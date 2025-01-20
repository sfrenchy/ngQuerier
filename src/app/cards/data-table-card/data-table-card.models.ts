import { BaseCardConfig, ColumnSearchDto, OrderByParameterDto } from '@models/api.models';
import { DatasourceConfig } from '@models/datasource.models';

export interface ForeignKeyDisplayConfig {
  table: string;
  displayColumns: string[];
  displayFormat?: string;  // Ex: "{firstName} {lastName} ({email})"
  searchColumns?: string[]; // Colonnes à utiliser pour la recherche
}

export interface TableVisualConfig {
  headerBackgroundColor: string;
  rowBackgroundColor: string;
  headerTextColor: string;
  rowTextColor: string;
  isCompactMode: boolean;
  alternateRowColors: boolean;
  alternateRowsBrightness: number;
  rowCount?: number;
}

export interface CrudConfig {
  canAdd: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  foreignKeyConfigs?: { [tableName: string]: ForeignKeyDisplayConfig };
}

export interface ColumnConfig {
  key: string;
  type: string;
  label: { [key: string]: string };
  alignment: 'left' | 'center' | 'right';
  visible: boolean;
  decimals?: number;
  dateFormat?: 'date' | 'time' | 'datetime';
  isFixed?: boolean;
  isFixedRight?: boolean;
  isNavigation?: boolean;
  navigationType?: string;
  isCollection?: boolean;
  elementType?: string;
  entityMetadata?: {
    isPrimaryKey: boolean;
    isIdentity: boolean;
    columnName: string;
    columnType: string;
    defaultValue: any;
    isRequired: boolean;
    isForeignKey: boolean;
    foreignKeyTable: string;
    foreignKeyColumn: string;
    foreignKeyConstraintName: string;
    maxLength?: number;
  };
}

export class DataTableCardConfig extends BaseCardConfig {
  datasource: DatasourceConfig;
  columns?: ColumnConfig[];
  visualConfig: TableVisualConfig;
  crudConfig: CrudConfig;

  constructor() {
    super();
    this.datasource = {
      type: 'API',
    };
    this.visualConfig = {
      headerBackgroundColor: '#1f2937', // bg-gray-800
      rowBackgroundColor: '#111827',    // bg-gray-900
      headerTextColor: '#d1d5db',       // text-gray-300
      rowTextColor: '#d1d5db',          // text-gray-300
      isCompactMode: false,
      alternateRowColors: false,
      alternateRowsBrightness: 80,      // Valeur par défaut de 80%
      rowCount: undefined               // Pas de valeur par défaut
    };
    this.crudConfig = {
      canAdd: false,
      canUpdate: false,
      canDelete: false,
      foreignKeyConfigs: {}
    };
  }

  toJson(): any {
    return {
      datasource: this.datasource,
      columns: this.columns,
      visualConfig: this.visualConfig,
      crudConfig: this.crudConfig
    };
  }

  static fromJson(json: any): DataTableCardConfig {
    const config = new DataTableCardConfig();
    if (json.datasource) {
      config.datasource = json.datasource;
    }
    if (json.columns) {
      config.columns = json.columns;
    }
    if (json.visualConfig) {
      config.visualConfig = {
        ...config.visualConfig,
        ...json.visualConfig
      };
    }
    if (json.crudConfig) {
      config.crudConfig = {
        ...config.crudConfig,
        ...json.crudConfig,
        foreignKeyConfigs: json.crudConfig.foreignKeyConfigs || {}
      };
    }
    return config;
  }
} 

export interface DataState {
  items: any[];
  total: number;
  loading: boolean;
  error?: any;
  config?: DatasourceConfig & {
    columns?: ColumnConfig[];
  };
  pageNumber: number;
  pageSize: number;
  globalSearch: string;
  columnSearches: ColumnSearchDto[];
  orderBy?: OrderByParameterDto[];
}

export interface DynamicFormField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  maxLength?: number;
  inputType: string;
  isNavigation: boolean;
  defaultValue?: any;
  nullable?: boolean;
  metadata?: {
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
  };
  minimum?: number;
  maximum?: number;
}

export interface DynamicFormSchema {
  type: string;
  title: string;
  properties: {
    [key: string]: {
      type: string;
      maxLength?: number;
      nullable?: boolean;
      minimum?: number;
      maximum?: number;
      'x-entity-metadata'?: {
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
        isNavigation?: boolean;
        navigationType?: string;
        isCollection?: boolean;
      };
    };
  };
}