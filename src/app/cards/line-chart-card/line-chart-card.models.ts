import { BaseChartConfig, ChartVisualConfig } from '@models/chart.models';
import { DatasourceConfig, ParameterValue } from '@models/datasource.models';

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

export class LineChartCardConfig implements BaseChartConfig {
  datasource: DatasourceConfig;
  visualConfig: ChartVisualConfig;
  xAxisColumn?: string;
  xAxisDateFormat?: string;
  series: SeriesConfig[] = [];

  constructor() {
    this.datasource = { 
      type: 'API',
      procedureParameters: {} as Record<string, ParameterValue>,  // Initialiser avec un objet vide typé
      controller: {
        route: 'api/v1/data/line-chart'  // Route par défaut
      }
    };
    this.visualConfig = {
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      legend: {
        show: true
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
      xAxisDateFormat: this.xAxisDateFormat,
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
    if (json.xAxisDateFormat) {
      config.xAxisDateFormat = json.xAxisDateFormat;
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