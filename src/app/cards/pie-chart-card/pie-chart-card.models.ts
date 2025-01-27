import { BaseChartConfig, ChartVisualConfig } from '@models/chart.models';
import { DatasourceConfig } from '@models/datasource.models';

export class PieChartCardConfig implements BaseChartConfig {
  datasource: DatasourceConfig;
  visualConfig: ChartVisualConfig;
  labelColumn?: string;
  valueColumn?: string;
  radius?: string;
  title?: string;

  constructor() {
    this.datasource = { type: 'API' };
    this.visualConfig = {
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      legend: {
        show: true
      },
      tooltip: {
        show: true,
        trigger: 'item'
      },
      toolbox: {
        features: {
          saveAsImage: true
        }
      }
    };
  }

  toJson(): any {
    return {
      datasource: this.datasource,
      labelColumn: this.labelColumn,
      valueColumn: this.valueColumn,
      radius: this.radius,
      title: this.title,
      visualConfig: this.visualConfig
    };
  }

  static fromJson(json: any): PieChartCardConfig {
    const config = new PieChartCardConfig();
    if (json.datasource) {
      config.datasource = json.datasource;
    }
    if (json.labelColumn) {
      config.labelColumn = json.labelColumn;
    }
    if (json.valueColumn) {
      config.valueColumn = json.valueColumn;
    }
    if (json.radius) {
      config.radius = json.radius;
    }
    if (json.title) {
      config.title = json.title;
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