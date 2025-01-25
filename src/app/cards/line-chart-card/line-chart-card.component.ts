import { Component, Type, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Card } from '@cards/card.decorator';
import { LineChartCardConfigurationComponent } from './line-chart-card-configuration.component';
import { BaseCardComponent } from '@cards/base-card.component';
import { LineChartCardService } from './line-chart-card.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardDatabaseService } from '@services/card-database.service';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { LineChartCardConfig, ChartState, SeriesConfig } from './line-chart-card.models';
import { EChartsOption } from 'echarts';
import { CardDto } from '@models/api.models';

@Card({
  name: 'LineChart',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
  </svg>`,
  configComponent: LineChartCardConfigurationComponent as Type<any>,
  configType: LineChartCardConfig,
  defaultConfig: () => new LineChartCardConfig()
})
@Component({
  selector: 'app-line-chart-card',
  templateUrl: './line-chart-card.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BaseCardComponent,
    NgxEchartsModule
  ],
  providers: [
    LineChartCardService,
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: {
        echarts: () => import('echarts')
      }
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartCardComponent extends BaseCardComponent<LineChartCardConfig> implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  chartState: ChartState = {
    data: [],
    loading: false
  };
  chartOptions: EChartsOption = {};

  constructor(
    private cardService: LineChartCardService,
    protected override cardDatabaseService: CardDatabaseService,
    protected override translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    super(cardDatabaseService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.subscribeToDataChanges();
    this.loadData();
  }

  private subscribeToDataChanges() {
    this.cardService.getState(this.card.configuration)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: ChartState) => {
        this.chartState = state;
        this.updateChartOptions();
        this.cdr.markForCheck();
      });
  }

  private loadData() {
    if (this.card.configuration?.datasource) {
      this.cardService.loadData(this.card.configuration);
    }
  }

  private updateChartOptions() {
    if (!this.chartState.data || !this.card.configuration) return;

    console.group('Line Chart Data');
    console.log('Raw Data:', this.chartState.data);
    console.log('Configuration:', this.card.configuration);

    // Vérification de la structure des données
    const firstItem = this.chartState.data[0];
    console.log('First data item structure:', firstItem);
    console.log('Available properties:', firstItem ? Object.keys(firstItem) : []);

    // Fonction utilitaire pour accéder aux propriétés sans tenir compte de la casse
    const getPropertyValue = (obj: any, propertyName: string): any => {
      if (!obj || !propertyName) return undefined;
      const normalizedName = propertyName.toLowerCase();
      const key = Object.keys(obj).find(k => k.toLowerCase() === normalizedName);
      return key ? obj[key] : undefined;
    };

    const xAxisColumn = this.card.configuration.xAxisColumn;
    console.log('X-Axis Column:', xAxisColumn);

    // Extraction des données pour l'axe X avec vérification
    const xAxisData = this.chartState.data.map(item => {
      const value = getPropertyValue(item, xAxisColumn);
      if (value === undefined) {
        console.warn(`Missing value for X-axis column "${xAxisColumn}" in item:`, item);
      }
      return value;
    });
    console.log('X-Axis Data:', xAxisData);
    
    // Configuration des séries avec vérification des données
    const series = this.card.configuration.series.map((seriesConfig: SeriesConfig) => {
      const seriesData = this.chartState.data.map(item => {
        const value = getPropertyValue(item, seriesConfig.dataColumn);
        if (value === undefined) {
          console.warn(`Missing value for series "${seriesConfig.name}" column "${seriesConfig.dataColumn}" in item:`, item);
        }
        return value;
      });

      console.log(`Series "${seriesConfig.name}":`, {
        column: seriesConfig.dataColumn,
        data: seriesData
      });

      return {
        name: seriesConfig.name,
        type: seriesConfig.type || 'line',
        data: seriesData,
        showSymbol: seriesConfig.showSymbol,
        symbolSize: seriesConfig.symbolSize,
        itemStyle: seriesConfig.color ? { color: seriesConfig.color } : undefined,
        areaStyle: seriesConfig.areaStyle,
        smooth: seriesConfig.type === 'smooth'
      };
    });
    
    this.chartOptions = {
      backgroundColor: this.card.configuration.visualConfig.backgroundColor,
      textStyle: {
        color: this.card.configuration.visualConfig.textColor
      },
      tooltip: {
        ...this.card.configuration.visualConfig.tooltip,
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: this.card.configuration.visualConfig.legend,
      toolbox: this.card.configuration.visualConfig.toolbox,
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

    console.log('Final Chart Options:', this.chartOptions);
    console.groupEnd();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
} 