import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';

import {BaseChartCard} from '../base/base-chart-card.component';
import {DatasourceService} from '../../shared/components/datasource-configuration/datasource.service';
import {PieChartCardConfig} from './pie-chart-card.models';
import {Card} from '../card.decorator';
import {PieChartCardConfigurationComponent} from './pie-chart-card-configuration.component';
import {RequestParametersService} from '@shared/services/request-parameters.service';
import {PieChartCardConfigFactory} from './pie-chart-card.factory';
import {BaseCardComponent} from '@cards/base/base-card.component';
import {
  ChartParametersFooterComponent
} from '@shared/components/chart-parameters-footer/chart-parameters-footer.component';
import {LocalDataSourceService} from '@cards/data-table-card/local-datasource.service';
import {CardConfigAdapterService} from '@cards/card-config-adapter.service';

@Card({
  name: 'PieChart',
  translationPath: 'pie-chart-card',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
  </svg>`,
  configComponent: PieChartCardConfigurationComponent,
  configFactory: PieChartCardConfigFactory,
  defaultConfig: () => new PieChartCardConfig()
})
@Component({
  selector: 'app-pie-chart-card',
  templateUrl: '../base/base-chart-card.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BaseCardComponent,
    ChartParametersFooterComponent
  ]
})
export class PieChartCardComponent extends BaseChartCard<PieChartCardConfig> {
  constructor(
    protected override translateService: TranslateService,
    protected override cardConfigAdapter: CardConfigAdapterService,
    protected override datasourceService: DatasourceService,
    protected override requestParametersService: RequestParametersService,
    protected override localDataSourceService: LocalDataSourceService
  ) {
    super(translateService, cardConfigAdapter, datasourceService, requestParametersService, localDataSourceService);
  }

  get loading(): boolean {
    return this.chartState.loading;
  }

  get hasData(): boolean {
    return this.chartState.data.length > 0;
  }

  protected shouldLoadData(): boolean {
    return !!(
      this.card.configuration?.labelColumn &&
      this.card.configuration?.valueColumn
    );
  }

  protected override transformData(data: any[]): any[] {
    if (!this.card.configuration) return [];

    const {labelColumn, valueColumn} = this.card.configuration;
    if (!labelColumn || !valueColumn) return [];

    // Créer un Map pour agréger les valeurs par label
    const aggregatedData = new Map<string, number>();

    data.forEach(item => {
      const label = this.getPropertyValue(item, labelColumn);
      const value = Number(this.getPropertyValue(item, valueColumn));

      if (label && !isNaN(value)) {
        // Si le label existe déjà, ajouter la valeur à la somme existante
        // Sinon, initialiser avec la valeur
        aggregatedData.set(label, (aggregatedData.get(label) || 0) + value);
      }
    });

    // Convertir le Map en tableau de données pour le graphique
    return Array.from(aggregatedData.entries()).map(([label, value]) => ({
      name: label,
      value: value
    }));
  }

  protected override updateChartOptions(): void {
    if (!this.chartState.data || !this.card.configuration) return;

    const {radius = '75%'} = this.card.configuration;

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

  private getPropertyValue(obj: any, propertyName: string): any {
    if (!obj || !propertyName) return undefined;
    const normalizedName = propertyName.toLowerCase();
    const key = Object.keys(obj).find(k => k.toLowerCase() === normalizedName);
    return key ? obj[key] : undefined;
  }

  protected setupDataSource(): void {
    if (this.card.configuration?.datasource?.type === 'LocalDataTable') {
      const cardId = this.card.configuration.datasource.localDataTable?.cardId;
      if (cardId) {
        this.localDataSourceService.getTableData(cardId)!
          .pipe(takeUntil(this.destroy$))
          .subscribe(event => {
            if (event?.data) {
              this.chartState.data = this.transformData(event.data);
              this.updateChartOptions();
            }
          });
      }
    }
  }
}
