import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatasourceConfig } from '@models/datasource.models';
import { ColumnSearchDto } from '@models/api.models';
import { CardDatabaseService } from '@services/card-database.service';

export interface ColumnConfig {
  key: string;
  type: string;
  label: { [key: string]: string };
  alignment: 'left' | 'center' | 'right';
  visible: boolean;
  decimals?: number;
  dateFormat?: 'date' | 'time' | 'datetime';
  isNavigation?: boolean;
  navigationType?: string;
  isCollection?: boolean;
  elementType?: string;
  isFixed?: boolean;
  isFixedRight?: boolean;
  entityMetadata?: {
    isPrimaryKey?: boolean;
    isIdentity?: boolean;
    columnName?: string;
    columnType?: string;
    defaultValue?: any;
    isRequired?: boolean;
    isForeignKey?: boolean;
    foreignKeyTable?: string;
    foreignKeyColumn?: string;
    foreignKeyConstraintName?: string;
    maxLength?: number;
  };
}

interface DataState {
  items: any[];
  total: number;
  loading: boolean;
  config?: DatasourceConfig;
  pageNumber: number;
  pageSize: number;
  globalSearch: string;
  columnSearches: ColumnSearchDto[];
}

@Injectable({
  providedIn: 'root'
})
export class DataTableCardService {
  private dataStateMap = new Map<string, BehaviorSubject<DataState>>();

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

  getData(config: DatasourceConfig): Observable<any[]> {
    return this.getOrCreateState(config).pipe(
      map(state => state.items)
    );
  }

  getTotal(config: DatasourceConfig): Observable<number> {
    return this.getOrCreateState(config).pipe(
      map(state => state.total)
    );
  }

  isLoading(config: DatasourceConfig): Observable<boolean> {
    return this.getOrCreateState(config).pipe(
      map(state => state.loading)
    );
  }

  loadData(
    datasource: DatasourceConfig,
    pageNumber: number,
    pageSize: number,
    showLoading: boolean = true,
    globalSearch: string = '',
    columnSearches: ColumnSearchDto[] = []
  ) {
    const state$ = this.getOrCreateState(datasource);
    const currentState = state$.getValue();

    if (currentState.items.length > 0 && 
        currentState.pageNumber === pageNumber && 
        currentState.pageSize === pageSize &&
        currentState.globalSearch === globalSearch &&
        JSON.stringify(currentState.columnSearches) === JSON.stringify(columnSearches)) {
      return;
    }

    state$.next({ ...currentState, loading: showLoading });

    this.cardDatabaseService.fetchData(datasource, {
      pageNumber,
      pageSize,
      orderBy: [],
      globalSearch,
      columnSearches
    }).subscribe({
      next: (response) => {
        state$.next({
          items: response.items,
          total: response.total,
          loading: false,
          config: datasource,
          pageNumber: pageNumber,
          pageSize: pageSize,
          globalSearch: globalSearch,
          columnSearches: columnSearches
        });
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        state$.next({ ...currentState, loading: false });
      }
    });
  }

  clearData(config: DatasourceConfig): void {
    const key = this.getStateKey(config);
    this.dataStateMap.delete(key);
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

  // Méthodes de formatage des valeurs
  formatColumnValue(value: any, column: ColumnConfig, locale: string): any {
    if (value === null || value === undefined) {
      return '';
    }

    // Formatage des dates selon la configuration
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

    // Formatage des nombres décimaux si spécifié
    if (this.isNumberColumn(column) && column.decimals !== undefined && value !== null && value !== undefined) {
      return Number(value).toFixed(column.decimals);
    }

    return value;
  }

  getColumnValue(item: any, column: ColumnConfig, locale: string): any {
    if (!item || !column.key) {
      return '';
    }
    
    // Convertir la clé en camelCase
    const camelCaseKey = column.key.charAt(0).toLowerCase() + column.key.slice(1);
    
    // Gestion des propriétés imbriquées avec notation par points
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

  /**
   * Récupère les valeurs uniques d'une colonne
   * @param config Configuration de la source de données
   * @param columnName Nom de la colonne
   * @returns Observable des valeurs uniques
   */
  getColumnValues(config: DatasourceConfig, columnName: string): Observable<string[]> {
    return this.cardDatabaseService.getColumnValues(config, columnName);
  }
} 