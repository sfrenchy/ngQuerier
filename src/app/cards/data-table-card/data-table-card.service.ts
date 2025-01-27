import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatasourceService } from '@shared/components/datasource-configuration/datasource.service';
import { DatasourceConfig } from '@models/datasource.models';
import { DataRequestParametersDto, DBConnectionEndpointRequestInfoDto, DBConnectionEndpointInfoDto } from '@models/api.models';
import { ColumnSearchDto, ForeignKeyIncludeConfig, PaginatedResultDto } from '@models/api.models';
import { OrderByParameterDto } from '@models/api.models';
import { ColumnConfig, DataState } from './data-table-card.models';

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

export interface TableState {
  items: any[];
  total: number;
  loading: boolean;
  error?: any;
  foreignKeyData?: { foreignKey: string; values: { id: string; value: string; }[]; }[];
}

export interface FormDataSubmit {
  schema: any;
  formData: any;
}

export interface FormDataSubmitWithId extends FormDataSubmit {
  id: any;
}

interface EndpointInfo {
  name: string;
  type: string;
  isRequired: boolean;
  source: string;
  jsonSchema: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataTableCardService {
  private stateMap = new Map<string, BehaviorSubject<TableState>>();
  private cacheMap = new Map<string, any>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
  private currentDatasource?: DatasourceConfig;

  constructor(private datasourceService: DatasourceService) {}

  private getStateKey(config: DatasourceConfig): string {
    if (!config?.connection?.id || !config?.controller?.route) {
        console.warn('[DataTableCardService] Configuration invalide pour getStateKey', {
            connectionId: config?.connection?.id,
            controllerRoute: config?.controller?.route
        });
        return '';
    }
    const controllerName = config.controller.route.split('/').pop() || '';
    return `${config.connection.id}_${controllerName}`;
  }

  private getOrCreateState(config: DatasourceConfig): BehaviorSubject<TableState> {
    const key = this.getStateKey(config);
    if (!this.stateMap.has(key)) {
      this.stateMap.set(key, new BehaviorSubject<TableState>({
        items: [],
        total: 0,
        loading: false,
        foreignKeyData: []
      }));
    }
    return this.stateMap.get(key)!;
  }

  getState(config: DatasourceConfig): Observable<TableState> {
    return this.getOrCreateState(config).asObservable();
  }

  loadData(config: DatasourceConfig, parameters: DataRequestParametersDto, columns: ColumnConfig[] = []): void {
    this.currentDatasource = config;
    const key = this.getStateKey(config);
    const state = this.getOrCreateState(config);
    const currentCache = this.cacheMap.get(key);
    
    // Ajouter les includes pour les clés étrangères
    const foreignKeyIncludes = this.getForeignKeyIncludes(columns);
    const paramsWithIncludes: DataRequestParametersDto = {
        ...parameters,
        includes: foreignKeyIncludes
    };
    
    // Vérifier si nous avons un cache valide avec les mêmes paramètres
    if (currentCache && 
        Date.now() - currentCache.timestamp < this.CACHE_DURATION &&
        JSON.stringify(currentCache.parameters) === JSON.stringify(paramsWithIncludes)) {
        state.next({
            items: currentCache.data.items,
            total: currentCache.data.total,
            loading: false,
            foreignKeyData: currentCache.data.foreignKeyData
        });
        return;
    }

    state.next({ ...state.getValue(), loading: true });

    this.datasourceService.fetchData(config, paramsWithIncludes).subscribe({
        next: (response) => {
            // Mettre à jour le cache
            this.cacheMap.set(key, {
                data: response,
                timestamp: Date.now(),
                parameters: paramsWithIncludes
            });

            state.next({
                items: response.items,
                total: response.total,
                loading: false,
                foreignKeyData: response.foreignKeyData
            });
        },
        error: (error) => {
            console.error('[DataTableCardService] Erreur lors du chargement des données', error);
            state.next({
                items: [],
                total: 0,
                loading: false,
                error
            });
        }
    });
  }

  private getForeignKeyIncludes(columns: ColumnConfig[]): ForeignKeyIncludeConfig[] {
    const includes: ForeignKeyIncludeConfig[] = [];
    
    columns.forEach(column => {
      if (column.isVirtualForeignKey && column.sourceColumn && column.foreignKeyConfig) {
        // Ajouter l'include avec la configuration d'affichage
        includes.push({
          foreignKey: column.sourceColumn,
          displayFormat: column.foreignKeyConfig.displayFormat,
          displayColumns: column.foreignKeyConfig.displayColumns
        });
      }
    });
    
    return includes;
  }

  private areOrderByEqual(current?: OrderByParameterDto[], next?: OrderByParameterDto[]): boolean {
    const currentArr = current || [];
    const nextArr = next || [];

    if (currentArr.length !== nextArr.length) {
      return false;
    }

    return currentArr.every((sort, index) => {
      const nextSort = nextArr[index];
      return sort.column === nextSort.column && sort.isDescending === nextSort.isDescending;
    });
  }

  getReadActionParameterDefinition(config: DatasourceConfig): Observable<DBConnectionEndpointRequestInfoDto[]> {
    // Extraire le nom du contrôleur de la route (prendre la dernière partie après le dernier /)
    const controllerName = config?.controller?.route?.split('/').pop() || '';

    if (!config?.connection?.id || !controllerName) {
      console.warn('[DataTableCardService] Configuration invalide - Retour tableau vide');
      return of([]);
    }

    const cacheKey = `${config.connection.id}_${controllerName}_entity_schema`;
    const cachedSchema = this.cacheMap.get(cacheKey);
    if (cachedSchema) {
      return of(cachedSchema);
    }


    return this.datasourceService.getDatabaseEndpoints(config.connection.id, controllerName + "Controller", "", "Create").pipe(
      tap(response => {
      }),
      map((endpoints: DBConnectionEndpointInfoDto[]) => {
        const requestInfos = endpoints.map(endpoint => {
          return {
            name: endpoint.parameters[0].name,
            type: endpoint.parameters[0].type,
            isRequired: endpoint.parameters[0].isRequired,
            source: endpoint.parameters[0].source,
            jsonSchema: endpoint.parameters[0].jsonSchema
          } as DBConnectionEndpointRequestInfoDto;
        });
        this.cacheMap.set(cacheKey, requestInfos);
        return requestInfos;
      })
    );
  }

  preloadSchemaDefinitions(config: DatasourceConfig): void {
    if (!config?.connection?.id || !config?.controller?.route) return;

    const controllerName = config.controller.route.split('/').pop() || '';
    const entitySchemaCacheKey = `${config.connection.id}_${controllerName}_entity_schema`;
    
    if (!this.cacheMap.has(entitySchemaCacheKey)) {
      this.getReadActionParameterDefinition(config).subscribe();
    }
  }

  clearSchemaDefinitions(config?: DatasourceConfig): void {
    if (config) {
      const controllerName = config.controller?.route?.split('/').pop() || '';
      const cacheKey = `${config.connection!.id}_${controllerName}`;
      this.cacheMap.delete(cacheKey);
    } else {
      this.cacheMap.clear();
    }
  }

  createData(datasource: DatasourceConfig, formData: FormDataSubmit): Observable<any[]> {
    let createDto: { [key: string]: any } = {};
    Object.keys(formData.schema.properties).forEach(key => {
      createDto[key] = formData.formData[key] !== undefined ? formData.formData[key] : null;
    });
    return this.datasourceService.createData(datasource, createDto);
  }

  deleteData(datasource: DatasourceConfig, id: any): Observable<any> {
    return this.datasourceService.deleteData(datasource, id);
  }

  updateData(datasource: DatasourceConfig, formData: FormDataSubmitWithId): Observable<any> {
    const id = formData.id;
    let updateDto: { [key: string]: any } = {};
    Object.keys(formData.schema.properties).forEach(key => {
      updateDto[key] = formData.formData[key] !== undefined ? formData.formData[key] : null;
    });
    return this.datasourceService.updateData(datasource, id, updateDto);
  }

  // Méthodes utilitaires pour les colonnes
  isDateColumn(column: ColumnConfig): boolean {
    return !!column.entityMetadata?.columnType?.toLowerCase().includes('date');
  }

  isNumberColumn(column: ColumnConfig): boolean {
    const type = column.entityMetadata?.columnType?.toLowerCase() || '';
    return type.includes('int') || 
           type.includes('decimal') || 
           type.includes('float') || 
           type.includes('double') || 
           type.includes('money') || 
           type.includes('number');
  }

  formatColumnValue(value: any, column: ColumnConfig, locale: string): any {
    if (value === null || value === undefined) {
      return '';
    }

    if (this.isDateColumn(column) && value) {
      const date = new Date(value);
      switch (column.dateFormat) {
        case 'date':
          return date.toLocaleDateString(locale);
        case 'time':
          return date.toLocaleTimeString(locale);
        case 'datetime':
        default:
          return date.toLocaleString(locale);
      }
    }

    if (this.isNumberColumn(column) && column.decimals !== undefined && value !== null && value !== undefined) {
      return Number(value).toFixed(column.decimals);
    }

    return value;
  }

  getColumnValue(item: any, column: ColumnConfig, locale: string): any {
    if (!item || !column.key) {
      return '';
    }

    // Si c'est une colonne virtuelle de clé étrangère
    if (column.isVirtualForeignKey && column.sourceColumn && column.foreignKeyConfig) {
      return this.formatForeignKeyValue(item, column);
    }
    
    const camelCaseKey = column.key.charAt(0).toLowerCase() + column.key.slice(1);
    const keys = camelCaseKey.split('.');
    let value = item;
    
    for (const key of keys) {
      if (value === null || value === undefined) {
        return '';
      }
      value = value[key];
    }

    return this.formatColumnValue(value, column, locale);
  }

  private formatForeignKeyValue(item: any, column: ColumnConfig): string {
    if (!column.foreignKeyConfig || !column.sourceColumn || !this.currentDatasource) {
      return '';
    }

    // Get the foreign key value from the item
    const foreignKeyValue = item[column.sourceColumn.charAt(0).toLowerCase() + column.sourceColumn.slice(1)];
    if (!foreignKeyValue) {
      return '';
    }

    // Get the current state which contains the foreignKeyData
    const state = this.getOrCreateState(this.currentDatasource).getValue();
    
    const foreignKeyData = state.foreignKeyData?.find((fk: { foreignKey: string }) => 
      fk.foreignKey === column.sourceColumn
    );
    if (!foreignKeyData) {
      return '';
    }

    // Find the matching value in the foreignKeyData values array
    const matchingValue = foreignKeyData.values.find((v: { id: string; value: string }) => 
      v.id.toString() === foreignKeyValue.toString()
    );
    return matchingValue?.value || '';
  }

  getColumnValues(config: DatasourceConfig, columnName: string): Observable<string[]> {
    return this.datasourceService.getColumnValues(config, columnName);
  }

  getDefaultAlignment(type: string): 'left' | 'center' | 'right' {
    switch (type) {
      case 'number':
      case 'integer':
        return 'right';
      case 'boolean':
        return 'center';
      default:
        return 'left';
    }
  }

  getColumnType(prop: any): string {
    if (prop['x-entity-metadata']?.navigationType) {
      return prop['x-entity-metadata'].navigationType;
    }
    return prop.type;
  }

  getPrimaryKeyValue(row: any, schema: any): any {
    if (!schema?.properties) return null;

    const primaryKeyField = Object.entries(schema.properties)
      .find(([key, prop]: [string, any]) => {
        if (!prop['x-entity-metadata']?.isPrimaryKey) return false;
        // Rechercher la propriété dans row de manière insensible à la casse
        const rowKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
        return !!rowKey;
      });

    if (!primaryKeyField) return null;

    // Trouver la clé correspondante dans row
    const rowKey = Object.keys(row).find(k => k.toLowerCase() === primaryKeyField[0].toLowerCase());
    return rowKey ? row[rowKey] : null;
  }
} 