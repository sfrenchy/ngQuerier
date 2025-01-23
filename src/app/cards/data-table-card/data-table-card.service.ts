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

interface TableState {
  items: any[];
  total: number;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataTableCardService {
  
  private stateMap = new Map<string, BehaviorSubject<TableState>>();
  private cacheMap = new Map<string, { 
    data: any, 
    timestamp: number,
    parameters: DataRequestParametersDto 
  }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

  constructor(private cardDatabaseService: CardDatabaseService) {}

  private getStateKey(datasource: DatasourceConfig): string {
    return `${datasource.connection!.id}_${datasource.controller!.route}`;
  }

  private getOrCreateState(datasource: DatasourceConfig): BehaviorSubject<TableState> {
    const key = this.getStateKey(datasource);
    if (!this.stateMap.has(key)) {
      this.stateMap.set(key, new BehaviorSubject<TableState>({
        items: [],
        total: 0,
        loading: false
      }));
    }
    return this.stateMap.get(key)!;
  }

  getState(datasource: DatasourceConfig): Observable<TableState> {
    return this.getOrCreateState(datasource).asObservable();
  }

  invalidateCache(datasource: DatasourceConfig): void {
    const key = this.getStateKey(datasource);
    this.cacheMap.delete(key);
  }

  loadData(datasource: DatasourceConfig, parameters: DataRequestParametersDto): void {
    const key = this.getStateKey(datasource);
    const state = this.getOrCreateState(datasource);
    const currentCache = this.cacheMap.get(key);
    
    // Vérifier si nous avons un cache valide avec les mêmes paramètres
    if (currentCache && 
        Date.now() - currentCache.timestamp < this.CACHE_DURATION &&
        JSON.stringify(currentCache.parameters) === JSON.stringify(parameters)) {
      state.next({
        items: currentCache.data.items,
        total: currentCache.data.total,
        loading: false
      });
      return;
    }

    state.next({ ...state.getValue(), loading: true });

    this.cardDatabaseService.fetchData(datasource, parameters).subscribe({
      next: (response) => {
        // Mettre à jour le cache
        this.cacheMap.set(key, {
          data: response,
          timestamp: Date.now(),
          parameters
        });

        state.next({
          items: response.items,
          total: response.total,
          loading: false
        });
      },
      error: (error) => {
        console.error('Error loading data:', error);
        state.next({
          items: [],
          total: 0,
          loading: false
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
    
    if (!this.cacheMap.has(entitySchemaCacheKey)) {
      this.getReadActionParameterDefinition(config).subscribe();
    }
  }

  clearSchemaDefinitions(config?: DatasourceConfig): void {
    if (config) {
      const cacheKey = `${config.connection!.id}_${config.controller?.name}`;
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