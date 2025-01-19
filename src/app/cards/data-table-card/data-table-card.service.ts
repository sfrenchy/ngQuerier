import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatasourceConfig } from '@models/datasource.models';
import { ColumnSearchDto, DBConnectionEndpointRequestInfoDto } from '@models/api.models';
import { CardDatabaseService } from '@services/card-database.service';
import { DataRequestParametersDto } from '@models/api.models';
import { OrderByParameterDto } from '@models/api.models';
import { ColumnConfig, DataState, DynamicFormField } from './data-table-card.models';
import { FormDataSubmit } from './dynamic-form.component';


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

  createData(datasource: DatasourceConfig, formData: FormDataSubmit): Observable<any[]> {
    console.log('Creating data:', formData);
    let createDto: { [key: string]: any } = {};
    Object.keys(formData.schema.properties).forEach(key => {
      createDto[key] = formData.formData[key] !== undefined ? formData.formData[key] : null;
    });
    return this.cardDatabaseService.createData(datasource, createDto);
  }

  getTotal(config: DatasourceConfig): Observable<number> {
    return this.getOrCreateState(config).pipe(
      map(state => state.total)
    );
  }

  getAddActionParameterDefinition(config: DatasourceConfig): Observable<DBConnectionEndpointRequestInfoDto[]> {
    return this.cardDatabaseService.getDatabaseEndpoints(config.connection!.id, config.controller?.name + "Controller" || '', 'Create').pipe(
      map(endpoints => endpoints.flatMap(endpoint => endpoint.parameters))
  );
  }

  isLoading(config: DatasourceConfig): Observable<boolean> {
    return this.getOrCreateState(config).pipe(
      map(state => state.loading)
    );
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

    // Mettre à jour l'état immédiatement avec les nouveaux paramètres
    state$.next({ 
      ...currentState, 
      loading: true,
      pageNumber: parameters.pageNumber,
      pageSize: parameters.pageSize,
      globalSearch: parameters.globalSearch,
      columnSearches: parameters.columnSearches,
      orderBy: parameters.orderBy
    });

    this.cardDatabaseService.fetchData(datasource, parameters).subscribe({
      next: (response) => {
        state$.next({
          ...state$.getValue(),
          items: response.items,
          total: response.total,
          loading: false
        });
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        state$.next({ ...state$.getValue(), loading: false });
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

  /**
   * Construit les paramètres de recherche pour la requête
   * @param filters Map des filtres actifs par colonne
   * @param globalSearch Terme de recherche global
   * @returns Paramètres de recherche
   */
  buildSearchParameters(filters: Map<string, Set<string>>, globalSearch: string = ''): { columnSearches: ColumnSearchDto[], globalSearch: string } {
    const columnSearches: ColumnSearchDto[] = [];

    // Pour chaque colonne avec des filtres
    filters.forEach((values, column) => {
      // Pour chaque valeur sélectionnée dans le filtre
      values.forEach(value => {
        columnSearches.push({
          column,
          value
        });
      });
    });

    return {
      columnSearches,
      globalSearch
    };
  }
} 