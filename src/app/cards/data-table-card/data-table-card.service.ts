import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatasourceConfig } from '@models/datasource.models';
import { ColumnSearchDto, DBConnectionEndpointRequestInfoDto } from '@models/api.models';
import { CardDatabaseService } from '@services/card-database.service';
import { DataRequestParametersDto } from '@models/api.models';
import { OrderByParameterDto } from '@models/api.models';
import { ColumnConfig, DataState } from './data-table-card.models';
import { FormDataSubmit } from './dynamic-form.component';

@Injectable({
  providedIn: 'root'
})
export class DataTableCardService {
  
  private dataStateMap = new Map<string, BehaviorSubject<DataState>>();
  private schemaCache = new Map<string, any>();

  constructor(private cardDatabaseService: CardDatabaseService) {}

  private getStateKey(config: DatasourceConfig): string {
    return JSON.stringify(config);
  }

  private getOrCreateState(config: DatasourceConfig): BehaviorSubject<DataState> {
    const key = this.getStateKey(config);
    if (!this.dataStateMap.has(key)) {
      this.dataStateMap.set(key, new BehaviorSubject<DataState>({
        items: [],
        total: 0,
        loading: false,
        config,
        pageNumber: 1,
        pageSize: 0,
        globalSearch: '',
        columnSearches: []
      }));
    }
    return this.dataStateMap.get(key)!;
  }

  getState(config: DatasourceConfig): Observable<DataState> {
    return this.getOrCreateState(config).asObservable();
  }

  loadData(
    datasource: DatasourceConfig,
    parameters: DataRequestParametersDto
  ) {
    const state$ = this.getOrCreateState(datasource);
    const currentState = state$.getValue();

    // Vérifier si les données doivent être rechargées
    const shouldReload = 
      currentState.items.length === 0 ||
      currentState.pageNumber !== parameters.pageNumber ||
      currentState.pageSize !== parameters.pageSize ||
      currentState.globalSearch !== parameters.globalSearch ||
      JSON.stringify(currentState.columnSearches) !== JSON.stringify(parameters.columnSearches) ||
      !this.areOrderByEqual(currentState.orderBy, parameters.orderBy);

    if (!shouldReload) {
      return;
    }

    // Préserver la configuration actuelle, y compris les colonnes
    const preservedConfig: DatasourceConfig & { columns?: ColumnConfig[] } = {
      ...datasource,
      columns: currentState.config?.columns || []
    };

    // Mettre à jour l'état immédiatement avec les nouveaux paramètres et le statut de chargement
    state$.next({ 
      ...currentState, 
      loading: true,
      pageNumber: parameters.pageNumber,
      pageSize: parameters.pageSize,
      globalSearch: parameters.globalSearch,
      columnSearches: parameters.columnSearches,
      orderBy: parameters.orderBy,
      config: preservedConfig
    });

    // Éviter les appels redondants en vérifiant si un appel est déjà en cours
    if (currentState.loading) {
      return;
    }

    // Faire l'appel API et mettre à jour l'état avec les résultats
    this.cardDatabaseService.fetchData(datasource, parameters).subscribe({
      next: (response) => {
        state$.next({
          ...state$.getValue(),
          items: response.items,
          total: response.total,
          loading: false,
          config: preservedConfig
        });
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        state$.next({ 
          ...state$.getValue(), 
          items: [],
          total: 0,
          loading: false,
          error: error
        });
      }
    });
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
    const cacheKey = `${config.connection!.id}_${config.controller?.name}_entity_schema`;
    return this.cardDatabaseService.getDatabaseEndpoints(config.connection!.id, config.controller?.name + "Controller" || '', '', 'Create').pipe(
      map(endpoints => endpoints.flatMap(endpoint => endpoint.parameters))
    );
  }

  preloadSchemaDefinitions(config: DatasourceConfig): void {
    if (!config?.connection?.id || !config?.controller?.name) return;

    const entitySchemaCacheKey = `${config.connection.id}_${config.controller.name}_entity_schema`;
    
    if (!this.schemaCache.has(entitySchemaCacheKey)) {
      this.getReadActionParameterDefinition(config).subscribe();
    }
  }

  clearSchemaDefinitions(config?: DatasourceConfig): void {
    if (config) {
      const cacheKey = `${config.connection!.id}_${config.controller?.name}`;
      this.schemaCache.delete(cacheKey);
    } else {
      this.schemaCache.clear();
    }
  }

  createData(datasource: DatasourceConfig, formData: FormDataSubmit): Observable<any[]> {
    let createDto: { [key: string]: any } = {};
    Object.keys(formData.schema.properties).forEach(key => {
      createDto[key] = formData.formData[key] !== undefined ? formData.formData[key] : null;
    });
    return this.cardDatabaseService.createData(datasource, createDto);
  }

  deleteData(datasource: DatasourceConfig, id: any): Observable<any> {
    return this.cardDatabaseService.deleteData(datasource, id);
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

  getColumnValues(config: DatasourceConfig, columnName: string): Observable<string[]> {
    return this.cardDatabaseService.getColumnValues(config, columnName);
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
} 