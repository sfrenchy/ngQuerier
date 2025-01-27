import { BaseCardConfig } from './api.models';
import { EChartsOption } from 'echarts';

export interface ChartVisualConfig {
  backgroundColor?: string;
  textColor?: string;
  tooltip?: any;
  legend?: any;
  toolbox?: any;
  grid?: {
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    top?: string | number;
    containLabel?: boolean;
  };
}

export interface BaseChartConfig extends BaseCardConfig {
  visualConfig: ChartVisualConfig;
  datasource: any; // Will be replaced by DatasourceConfig
}

export interface ChartState {
  data: any[];
  loading: boolean;
  error?: string;
} 