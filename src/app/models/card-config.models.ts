import { BaseCardConfig, CardDto } from './api.models';
import { DatasourceConfig } from './datasource.models';
import { ChartParameters } from './parameters.models';
import { ChartVisualConfig, BaseChartConfig } from './chart.models';

// Card-specific interfaces
export interface ILabelCardConfig extends BaseCardConfig {
  content: {
    text: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface IDataTableCardConfig extends BaseCardConfig {
  dataConfig: DatasourceConfig;
  columns: {
    key: string;
    title: string;
    width?: number;
    sortable?: boolean;
    filterable?: boolean;
    format?: {
      type: 'text' | 'number' | 'date' | 'currency';
      format?: string;
      customFormatter?: string;
    };
  }[];
  pagination?: {
    enabled: boolean;
    pageSize: number;
    pageSizeOptions?: number[];
  };
  sorting?: {
    enabled: boolean;
    defaultSort?: {
      column: string;
      direction: 'asc' | 'desc';
    };
  };
  crudConfig?: {
    allowCreate: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
  };
}

// Chart-specific configurations
export interface ILineChartConfig extends BaseChartConfig {
  series: {
    name: string;
    column: string;
    color?: string;
    type?: 'line' | 'smooth';
    showSymbol?: boolean;
    symbolSize?: number;
    areaStyle?: {
      opacity?: number;
    };
  }[];
}

export interface IPieChartConfig extends BaseChartConfig {
  labelColumn: string;
  valueColumn: string;
  radius?: string;
  roseType?: boolean;
  center?: [string | number, string | number];
  itemStyle?: {
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
  };
}

export interface IStackedBarAndLinesChartConfig extends BaseChartConfig {
  barSeries: {
    name: string;
    dataColumn: string;
    stack: string;
    color?: string;
    barWidth?: number;
    barGap?: string;
    barCategoryGap?: string;
  }[];
  lineSeries: {
    name: string;
    dataColumn: string;
    type: 'line' | 'smooth';
    color?: string;
    showSymbol?: boolean;
    symbolSize?: number;
    areaStyle?: {
      opacity?: number;
    };
  }[];
} 
