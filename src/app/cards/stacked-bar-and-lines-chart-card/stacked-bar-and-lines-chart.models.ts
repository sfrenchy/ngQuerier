import { BaseChartConfig, ChartVisualConfig } from '@models/chart.models';
import { DatasourceConfig } from '@models/datasource.models';

export interface BarSeriesConfig {
  name: string;
  dataColumn: string;
  stack: string;
  color?: string;
  barWidth?: number;
  barGap?: string;
  barCategoryGap?: string;
}

export interface LineSeriesConfig {
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

export class StackedBarAndLinesChartCardConfig extends BaseChartConfig {
  override datasource: DatasourceConfig;
  override visualConfig: ChartVisualConfig;
  xAxisColumn?: string;
  xAxisDateFormat?: string;
  barSeries: BarSeriesConfig[] = [];
  lineSeries: LineSeriesConfig[] = [];

  constructor() {
    super();
    this.datasource = {
      type: 'API',
      controller: {
        route: 'api/v1/data/stacked-bar-and-lines-chart'
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
        feature: {
          dataZoom: {
            show: true,
            title: {
              zoom: 'Zoom',
              back: 'Réinitialiser'
            }
          },
          restore: {
            show: true,
            title: 'Réinitialiser'
          },
          saveAsImage: {
            show: true,
            title: 'Enregistrer'
          }
        }
      }
    };
  }

  override toJson(): any {
    return {
      datasource: this.datasource,
      xAxisColumn: this.xAxisColumn,
      xAxisDateFormat: this.xAxisDateFormat,
      barSeries: this.barSeries,
      lineSeries: this.lineSeries,
      visualConfig: this.visualConfig
    };
  }

  static override fromJson(json: any): StackedBarAndLinesChartCardConfig {
    const config = new StackedBarAndLinesChartCardConfig();
    if (json.datasource) {
      config.datasource = json.datasource;
    }
    if (json.xAxisColumn) {
      config.xAxisColumn = json.xAxisColumn;
    }
    if (json.xAxisDateFormat) {
      config.xAxisDateFormat = json.xAxisDateFormat;
    }
    if (json.barSeries) {
      config.barSeries = json.barSeries;
    }
    if (json.lineSeries) {
      config.lineSeries = json.lineSeries;
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
  error?: string;
} 