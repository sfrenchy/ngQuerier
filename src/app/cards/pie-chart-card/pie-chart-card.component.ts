import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BaseChartCard } from '../base-chart-card.component';
import { PieChartCardConfig } from './pie-chart-card.models';
import { DatasourceService } from '@shared/components/datasource-configuration/datasource.service';
import { Card } from '@cards/card.decorator';
import { PieChartCardConfigurationComponent } from './pie-chart-card-configuration.component';

@Card({
  name: 'PieChart',
  translationPath: 'pie-chart-card',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
  </svg>`,
  configComponent: PieChartCardConfigurationComponent,
  configType: PieChartCardConfig,
  defaultConfig: () => new PieChartCardConfig()
})
@Component({
  selector: 'app-pie-chart-card',
  template: `
    <div class="flex flex-col h-full">
      <div class="flex-1">
        <div #chartContainer class="w-full h-full"></div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class PieChartCardComponent extends BaseChartCard<PieChartCardConfig> {
  constructor(
    protected override translateService: TranslateService,
    protected override datasourceService: DatasourceService
  ) {
    super(translateService, datasourceService);
  }

  protected override transformData(data: any[]): any[] {
    if (!this.card.configuration) return [];

    const { labelColumn, valueColumn } = this.card.configuration;
    if (!labelColumn || !valueColumn) return [];

    return data.map(item => ({
      name: item[labelColumn],
      value: item[valueColumn]
    }));
  }

  protected override updateChartOptions(): void {
    if (!this.chartState.data || !this.card.configuration) return;

    const { radius = '75%' } = this.card.configuration;

    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        type: 'pie',
        radius,
        data: this.chartState.data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };

    if (this.chartInstance) {
      this.chartInstance.setOption(this.chartOptions);
    }
  }
} 