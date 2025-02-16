import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ApiService} from '@services/api.service';
import {DatasourceConfig} from '@models/datasource.models';
import {DataRequestParametersDto, DBConnectionEndpointInfoDto, PaginatedResultDto} from '@models/api.models';
import {StoredProcedureParameter} from '@models/parameters.models';
import {LocalDataSourceService} from '@cards/data-table-card/local-datasource.service';
import {CardDatabaseService} from '@cards/card-database.service';

interface ForeignKeyDataValue {
  id: string;
  value: string;
}

interface ForeignKeyData {
  foreignKey: string;
  values: ForeignKeyDataValue[];
}

interface ExtendedPaginatedResultDto<T> extends PaginatedResultDto<T> {
  foreignKeyData?: ForeignKeyData[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  parameters: DataRequestParametersDto;
}

@Injectable({
  providedIn: 'root'
})
export class DatasourceService {
  private configSubject = new BehaviorSubject<DatasourceConfig | null>(null);
  config$ = this.configSubject.asObservable();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cacheMap = new Map<string, CacheEntry<any>>();
  private autoRefreshIntervals = new Map<string, number>();

  constructor(
    private apiService: ApiService,
    private localDataSourceService: LocalDataSourceService,
    private cardDatabaseService: CardDatabaseService
  ) {
  }

  setConfig(config: DatasourceConfig): void {
    this.configSubject.next(config);
  }

  getConfig(): DatasourceConfig | null {
    return this.configSubject.value;
  }

  private getCacheKey(config: DatasourceConfig, parameters: DataRequestParametersDto, userParameters?: Record<string, StoredProcedureParameter>): string {
    return `${config.type}_${JSON.stringify(config)}_${JSON.stringify(parameters)}_${JSON.stringify(userParameters)}`;
  }

  fetchData(
    config: DatasourceConfig,
    parameters: DataRequestParametersDto = {
      pageNumber: 1,
      pageSize: 10,
      orderBy: [],
      globalSearch: '',
      columnSearches: []
    },
    userParameters?: Record<string, StoredProcedureParameter>
  ): Observable<ExtendedPaginatedResultDto<any>> {
    // Fusionner les paramètres utilisateur avec les paramètres de procédure stockée
    if (userParameters && config.procedureParameters) {
      Object.entries(userParameters).forEach(([key, param]) => {
        if (config.procedureParameters![key] && param.userChangeAllowed) {
          config.procedureParameters![key].value = param.value;
        }
      });
    }

    const cacheKey = this.getCacheKey(config, parameters, userParameters);
    const currentCache = this.cacheMap.get(cacheKey);

    // Vérifier si nous avons un cache valide
    if (currentCache &&
      Date.now() - currentCache.timestamp < this.CACHE_DURATION &&
      JSON.stringify(currentCache.parameters) === JSON.stringify(parameters)) {
      return new Observable(observer => {
        observer.next(currentCache.data);
        observer.complete();
      });
    }

    // Si c'est une procédure stockée
    if (config.isStoredProcedure) {
      return this.executeStoredProcedure(config, parameters).pipe(
        map(response => {
          this.cacheMap.set(cacheKey, {
            data: response,
            timestamp: Date.now(),
            parameters
          });
          return response;
        })
      );
    }

    // Sinon, utiliser l'accès CRUD standard
    switch (config.type) {
      case 'API':
        if (!config.connection || !config.controller) {
          throw new Error('API configuration requires both connection and controller');
        }
        return this.apiService.post<ExtendedPaginatedResultDto<any>>(
          `${config.controller.route!.replace("api/v1/", "")}/records`,
          parameters
        ).pipe(
          map(response => {
            this.cacheMap.set(cacheKey, {
              data: response,
              timestamp: Date.now(),
              parameters
            });
            return response;
          })
        );

      case 'EntityFramework':
        throw new Error('Not implemented');

      case 'SQLQuery':
        if (!config.query) {
          throw new Error('SQLQuery configuration requires a query');
        }
        return this.apiService.executeQuery(
          config.query.id,
          parameters
        ).pipe(
          map(response => {
            this.cacheMap.set(cacheKey, {
              data: response,
              timestamp: Date.now(),
              parameters
            });
            return response;
          })
        );

      case 'LocalDataTable':
        if (!config.localDataTable?.cardId) {
          return throwError(() => new Error('No source table specified'));
        }
        const tableData = this.localDataSourceService.getTableData(config.localDataTable.cardId);
        if (!tableData) {
          return throwError(() => new Error('Source table not registered'));
        }
        return tableData.pipe(
          // Attendre que les données soient disponibles
          filter(event => !!event),
          map(data => ({
            items: data?.data || [],
            total: data?.data?.length || 0,
            totalItems: data?.data?.length || 0,
            pageNumber: 1,
            pageSize: data?.data?.length || 0,
            totalPages: 1,
            requestParameters: parameters
          }))
        );

      default:
        return throwError(() => new Error(`Unsupported datasource type: ${config.type}`));
    }
  }

  private executeStoredProcedure(
    config: DatasourceConfig,
    parameters: DataRequestParametersDto
  ): Observable<ExtendedPaginatedResultDto<any>> {
    if (!config.connection || !config.controller) {
      throw new Error('Stored procedure execution requires both connection and controller');
    }

    // Formater les paramètres de la procédure stockée
    if (config.procedureParameters) {
      const formattedParams: { [key: string]: any } = {};
      Object.entries(config.procedureParameters).forEach(([key, paramValue]) => {
        if (paramValue.dateType) {
          // Gérer les paramètres de type date
          const now = new Date();
          switch (paramValue.dateType) {
            case 'today':
              formattedParams[key] = now;
              break;
            case 'yesterday':
              now.setDate(now.getDate() - 1);
              formattedParams[key] = now;
              break;
            case 'lastWeek':
              now.setDate(now.getDate() - 7);
              formattedParams[key] = now;
              break;
            case 'lastMonth':
              now.setMonth(now.getMonth() - 1);
              formattedParams[key] = now;
              break;
            case 'lastYear':
              now.setFullYear(now.getFullYear() - 1);
              formattedParams[key] = now;
              break;
            case 'specific':
            default:
              formattedParams[key] = paramValue.value;
              break;
          }
        } else {
          formattedParams[key] = paramValue.value;
        }
      });
      parameters = {...parameters, procedureParameters: formattedParams};
    }

    return this.apiService.post<ExtendedPaginatedResultDto<any>>(
      `${config.controller.route!.replace("api/v1/", "")}/execute`,
      parameters.procedureParameters
    );
  }

  fetchEntityById(config: DatasourceConfig, id: any): Observable<any> {
    if (!config) {
      throw new Error('No datasource configuration available');
    }

    switch (config.type) {
      case 'API':
        if (!config.connection || !config.controller) {
          throw new Error('Invalid API configuration');
        }
        const route = `${config.controller.route}/${id}`;
        return this.apiService.get(route);

      case 'EntityFramework':
        throw new Error('Not implemented');

      case 'SQLQuery':
        throw new Error('Not implemented');

      default:
        throw new Error('Unsupported datasource type');
    }
  }

  getColumnValues(config: DatasourceConfig, columnName: string): Observable<string[]> {
    if (!config.controller) {
      throw new Error('API configuration requires a controller');
    }
    return this.apiService.getColumnValues(config.controller.route!.replace("api/v1/", ""), columnName);
  }

  // CRUD operations
  createData(datasource: DatasourceConfig, formData: any): Observable<any[]> {
    if (!datasource.controller) {
      throw new Error('API configuration requires a controller');
    }
    return this.apiService.post<any[]>(`${datasource.controller.route!.replace("api/v1/", "")}`, formData);
  }

  deleteData(datasource: DatasourceConfig, id: any): Observable<any> {
    if (!datasource.controller) {
      throw new Error('API configuration requires a controller');
    }
    return this.apiService.delete(`${datasource.controller.route!.replace("api/v1/", "")}/${id}`);
  }

  updateData(datasource: DatasourceConfig, id: any, updateDto: any): Observable<any> {
    if (!datasource.controller) {
      throw new Error('API configuration requires a controller');
    }
    return this.apiService.put<any>(`${datasource.controller.route!.replace("api/v1/", "")}/${id}`, updateDto);
  }

  getDatabaseEndpoints(id: number, controller: string | null = null, targetTable: string | null = null, action: string | null = null): Observable<DBConnectionEndpointInfoDto[]> {
    return this.apiService.getDatabaseEndpoints(id, controller, targetTable, action);
  }

  // Méthode pour configurer l'auto-refresh
  setupAutoRefresh(
    config: DatasourceConfig,
    parameters: DataRequestParametersDto,
    userParameters: Record<string, StoredProcedureParameter>,
    intervalSeconds: number,
    callback: (data: ExtendedPaginatedResultDto<any>) => void
  ): void {
    const cacheKey = this.getCacheKey(config, parameters, userParameters);

    // Nettoyer l'intervalle existant si présent
    this.clearAutoRefresh(cacheKey);

    // Configurer le nouvel intervalle
    const intervalId = window.setInterval(() => {
      this.fetchData(config, parameters, userParameters).subscribe(callback);
    }, intervalSeconds * 1000);

    this.autoRefreshIntervals.set(cacheKey, intervalId);
  }

  // Méthode pour arrêter l'auto-refresh
  clearAutoRefresh(cacheKey: string): void {
    const intervalId = this.autoRefreshIntervals.get(cacheKey);
    if (intervalId) {
      clearInterval(intervalId);
      this.autoRefreshIntervals.delete(cacheKey);
    }
  }

  // Méthode pour invalider le cache
  invalidateCache(cacheKey?: string): void {
    if (cacheKey) {
      this.cacheMap.delete(cacheKey);
    } else {
      this.cacheMap.clear();
    }
  }
}
