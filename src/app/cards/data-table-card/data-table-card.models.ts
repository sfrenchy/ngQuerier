import { BaseCardConfig } from '@models/api.models';
import { DatasourceConfig } from '@models/datasource.models';

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
      canDelete: false
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
        ...json.crudConfig
      };
    }
    return config;
  }
} 