import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Card } from '@cards/card.decorator';
import { BaseChartCard } from '@cards/base-chart-card.component';
import { StackedBarAndLinesChartCardConfig, BarSeriesConfig, LineSeriesConfig } from './stacked-bar-and-lines-chart.models';
import { DatasourceService } from '@shared/components/datasource-configuration/datasource.service';
import { BaseCardComponent } from '@cards/base-card.component';
import { StackedBarAndLinesChartConfigurationComponent } from './stacked-bar-and-lines-chart-configuration.component';
import { ChartParametersFooterComponent } from '@shared/components/chart-parameters-footer/chart-parameters-footer.component';

@Card({
  name: 'StackedBarAndLinesChart',
  translationPath: 'stacked-bar-and-lines-chart-card',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>`,
  configComponent: StackedBarAndLinesChartConfigurationComponent,
  configType: StackedBarAndLinesChartCardConfig,
  defaultConfig: () => new StackedBarAndLinesChartCardConfig()
})
@Component({
  selector: 'app-stacked-bar-and-lines-chart',
  templateUrl: '../base-chart-card.component.html',
  standalone: true,
  imports: [
    CommonModule, 
    TranslateModule,
    BaseCardComponent,
    ChartParametersFooterComponent
  ]
})
export class StackedBarAndLinesChartComponent extends BaseChartCard<StackedBarAndLinesChartCardConfig> {
  constructor(
    protected override translateService: TranslateService,
    protected override datasourceService: DatasourceService
  ) {
    super(translateService, datasourceService);
  }

  protected override transformData(data: any[]): any[] {
    if (!this.card.configuration) return [];

    const { xAxisColumn, xAxisDateFormat } = this.card.configuration;
    if (!xAxisColumn) return [];

    // Vérification et transformation des données
    return data.map(item => {
      const xValue = this.getPropertyValue(item, xAxisColumn);
      if (xValue === undefined) {
        console.warn(`Missing value for X-axis column "${xAxisColumn}" in item:`, item);
        return null;
      }

      const result: any = {
        x: this.formatDateIfNeeded(xValue, xAxisDateFormat)
      };

      // Ajout des valeurs pour les séries de barres
      this.card.configuration.barSeries.forEach((seriesConfig: BarSeriesConfig) => {
        const value = this.getPropertyValue(item, seriesConfig.dataColumn);
        if (value === undefined) {
          console.warn(`Missing value for bar series "${seriesConfig.name}" column "${seriesConfig.dataColumn}" in item:`, item);
        }
        result[seriesConfig.name] = value;
      });

      // Ajout des valeurs pour les séries de lignes
      this.card.configuration.lineSeries.forEach((seriesConfig: LineSeriesConfig) => {
        const value = this.getPropertyValue(item, seriesConfig.dataColumn);
        if (value === undefined) {
          console.warn(`Missing value for line series "${seriesConfig.name}" column "${seriesConfig.dataColumn}" in item:`, item);
        }
        result[seriesConfig.name] = value;
      });

      return result;
    }).filter(item => item !== null);
  }

  protected override updateChartOptions(): void {
    if (!this.chartState.data || !this.card.configuration) return;

    const xAxisData = this.chartState.data.map(item => item.x);

    // Configuration des séries de barres
    const barSeries = this.card.configuration.barSeries.map((seriesConfig: BarSeriesConfig) => ({
      name: seriesConfig.name,
      type: 'bar',
      stack: seriesConfig.stack,
      data: this.chartState.data.map(item => item[seriesConfig.name]),
      itemStyle: seriesConfig.color ? { color: seriesConfig.color } : undefined,
      barWidth: seriesConfig.barWidth,
      barGap: seriesConfig.barGap,
      barCategoryGap: seriesConfig.barCategoryGap
    }));

    // Configuration des séries de lignes
    const lineSeries = this.card.configuration.lineSeries.map((seriesConfig: LineSeriesConfig) => ({
      name: seriesConfig.name,
      type: seriesConfig.type,
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
        boundaryGap: true
      },
      yAxis: {
        type: 'value'
      },
      series: [...barSeries, ...lineSeries]
    };

    if (this.chartInstance) {
      this.chartInstance.setOption(this.chartOptions);
    }
  }

  private getPropertyValue(obj: any, propertyName: string): any {
    if (!obj || !propertyName) return undefined;
    const normalizedName = propertyName.toLowerCase();
    const key = Object.keys(obj).find(k => k.toLowerCase() === normalizedName);
    return key ? obj[key] : undefined;
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