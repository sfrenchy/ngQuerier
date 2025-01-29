import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Card } from '@cards/card.decorator';
import { LineChartCardConfigurationComponent } from './line-chart-card-configuration.component';
import { BaseChartCard } from '@cards/base/base-chart-card.component';
import { LineChartCardConfig, SeriesConfig } from './line-chart-card.models';
import { DatasourceService } from '@shared/components/datasource-configuration/datasource.service';
import { RequestParametersService } from '@shared/services/request-parameters.service';

@Card({
  name: 'LineChart',
  translationPath: 'line-chart-card',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
  </svg>`,
  configComponent: LineChartCardConfigurationComponent,
  configType: LineChartCardConfig,
  defaultConfig: () => new LineChartCardConfig()
})
@Component({
  selector: 'app-line-chart-card',
  templateUrl: '../base-chart-card.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule
  ]
})
export class LineChartCardComponent extends BaseChartCard<LineChartCardConfig> {
  constructor(
    translateService: TranslateService,
    datasourceService: DatasourceService,
    requestParametersService: RequestParametersService
  ) {
    super(translateService, datasourceService, requestParametersService);
  }

  protected override transformData(data: any[]): any[] {
    if (!this.card.configuration) return [];

    const { xAxisColumn, xAxisDateFormat } = this.card.configuration;
    if (!xAxisColumn) return [];

    // Fonction utilitaire pour accéder aux propriétés sans tenir compte de la casse
    const getPropertyValue = (obj: any, propertyName: string): any => {
      if (!obj || !propertyName) return undefined;
      const normalizedName = propertyName.toLowerCase();
      const key = Object.keys(obj).find(k => k.toLowerCase() === normalizedName);
      return key ? obj[key] : undefined;
    };

    // Vérification et transformation des données
    return data.map(item => {
      const xValue = getPropertyValue(item, xAxisColumn);
      if (xValue === undefined) {
        console.warn(`Missing value for X-axis column "${xAxisColumn}" in item:`, item);
        return null;
      }

      const result: any = {
        x: this.formatDateIfNeeded(xValue, xAxisDateFormat)
      };

      // Ajout des valeurs pour chaque série
      this.card.configuration.series.forEach((seriesConfig: SeriesConfig) => {
        const value = getPropertyValue(item, seriesConfig.dataColumn);
        if (value === undefined) {
          console.warn(`Missing value for series "${seriesConfig.name}" column "${seriesConfig.dataColumn}" in item:`, item);
        }
        result[seriesConfig.name] = value;
      });

      return result;
    }).filter(item => item !== null);
  }

  protected override updateChartOptions(): void {
    if (!this.chartState.data || !this.card.configuration) return;

    const xAxisData = this.chartState.data.map(item => item.x);

    const series = this.card.configuration.series.map((seriesConfig: SeriesConfig) => ({
      name: seriesConfig.name,
      type: seriesConfig.type || 'line',
      data: this.chartState.data.map(item => item[seriesConfig.name]),
      showSymbol: seriesConfig.showSymbol,
      symbolSize: seriesConfig.symbolSize,
      itemStyle: seriesConfig.color ? { color: seriesConfig.color } : undefined,
      areaStyle: seriesConfig.areaStyle,
      smooth: seriesConfig.type === 'smooth'
    }));
    
    this.chartOptions = {
      ...this.chartOptions,
      xAxis: {
        type: 'category',
        data: xAxisData,
        boundaryGap: false
      },
      yAxis: {
        type: 'value'
      },
      series
    };

    if (this.chartInstance) {
      this.chartInstance.setOption(this.chartOptions);
    }
  }

  private formatDateIfNeeded(value: any, format?: string): any {
    if (!format) return value;

    if (value instanceof Date) {
      return this.formatDate(value, format);
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return this.formatDate(date, format);
      }
    }
    
    return value;
  }

  private formatDate(date: Date, format: string): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/YYYY':
        return `${month}/${year}`;
      case 'YYYY':
        return year.toString();
      default:
        return date.toLocaleDateString();
    }
  }
} 