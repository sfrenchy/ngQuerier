import {BaseChartConfig} from '@models/chart.models';
import {DatasourceConfig} from '@models/datasource.models';
import {StoredProcedureParameter} from '@models/parameters.models';

export interface SeriesConfig {
  name: string;
  dataColumn: string;
  type?: 'line' | 'smooth';
  showSymbol?: boolean;
  symbolSize?: number;
  color?: string;
  areaStyle?: any;
}

export class LineChartCardConfig extends BaseChartConfig {
  xAxisColumn: string = '';
  xAxisDateFormat?: string;
  series: SeriesConfig[] = [];

  constructor() {
    super();
    this.datasource = {
      type: 'API',
      procedureParameters: {} as Record<string, StoredProcedureParameter>,
      hasUserParameters: false,
      isStoredProcedure: false
    };
    this.visualConfig = {
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    };
  }

  override toJson(): any {
    return {
      ...super.toJson(),
      xAxisColumn: this.xAxisColumn,
      xAxisDateFormat: this.xAxisDateFormat,
      series: this.series
    };
  }

  static override fromJson(json: any): LineChartCardConfig {
    const config = new LineChartCardConfig();
    config.datasource = json.datasource;
    config.visualConfig = json.visualConfig;
    config.chartParameters = json.chartParameters;
    config.xAxisColumn = json.xAxisColumn;
    config.xAxisDateFormat = json.xAxisDateFormat;
    config.series = json.series;
    return config;
  }
}

export interface ChartState {
  data: any[];
  loading: boolean;
  error?: any;
  config?: DatasourceConfig;
}
