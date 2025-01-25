import { BaseCardConfig } from '../../models/api.models';
import { DatasourceConfig } from '../../models/datasource.models';

export interface SeriesConfig {
  name: string;
  dataColumn: string;
  type: 'line' | 'smooth';
  color?: string;
  showSymbol?: boolean;
  symbolSize?: number;
  areaStyle?: {
    opacity?: number;
  };
}

export interface ChartVisualConfig {
  backgroundColor?: string;
  textColor?: string;
  legend?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis';
  };
  toolbox?: {
    features?: {
      dataZoom?: boolean;
      restore?: boolean;
      saveAsImage?: boolean;
    };
  };
}

export class LineChartCardConfig extends BaseCardConfig {
  datasource?: DatasourceConfig;
  xAxisColumn?: string;
  series: SeriesConfig[] = [];
  visualConfig: ChartVisualConfig = {
    backgroundColor: '#1f2937',
    textColor: '#ffffff',
    legend: {
      show: true,
      position: 'top'
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    toolbox: {
      features: {
        dataZoom: true,
        restore: true,
        saveAsImage: true
      }
    }
  };

  constructor() {
    super();
    this.datasource = {
      type: 'API'
    };
    this.xAxisColumn = '';
    this.series = [];
    this.visualConfig = {
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      legend: {
        show: true,
        position: 'top'
      },
      tooltip: {
        show: true,
        trigger: 'axis'
      },
      toolbox: {
        features: {
          dataZoom: true,
          restore: true,
          saveAsImage: true
        }
      }
    };
  }

  toJson(): any {
    return {
      datasource: this.datasource,
      xAxisColumn: this.xAxisColumn,
      series: this.series,
      visualConfig: this.visualConfig
    };
  }

  static fromJson(json: any): LineChartCardConfig {
    const config = new LineChartCardConfig();
    if (json.datasource) {
      config.datasource = json.datasource;
    }
    if (json.xAxisColumn) {
      config.xAxisColumn = json.xAxisColumn;
    }
    if (json.series) {
      config.series = json.series;
    }
    if (json.visualConfig) {
      config.visualConfig = {
        ...config.visualConfig,
        ...json.visualConfig
      };
    }
    return config;
  }
}

export interface ChartState {
  data: any[];
  loading: boolean;
  error?: any;
  config?: DatasourceConfig;
} 