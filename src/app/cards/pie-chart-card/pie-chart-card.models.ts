import { BaseChartConfig } from '@models/chart.models';
import { DatasourceConfig } from '@models/datasource.models';

export class PieChartCardConfig extends BaseChartConfig {
  labelColumn?: string;
  valueColumn?: string;
  radius?: string = '75%';

  constructor() {
    super();
    this.datasource = {
      type: 'API',
      controller: {
        route: 'api/v1/data/pie-chart'  // Route par défaut
      }
    };
  }

  override toJson(): any {
    return {
      ...super.toJson(),
      labelColumn: this.labelColumn,
      valueColumn: this.valueColumn,
      radius: this.radius
    };
  }

  static override fromJson(json: any): PieChartCardConfig {
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
    if (json.visualConfig) {
      config.visualConfig = json.visualConfig;
    }
    return config;
  }
} 