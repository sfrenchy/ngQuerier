import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BaseCardComponent } from './base-card.component';
import { BaseChartConfig, ChartState } from '@models/chart.models';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { Subject } from 'rxjs';
import { DatasourceService } from '@shared/components/datasource-configuration/datasource.service';
import { takeUntil } from 'rxjs/operators';
import { DataRequestParametersDto } from '@models/api.models';
import { ChartVisualConfig } from '@models/chart.models';

@Component({
  selector: 'app-base-chart-card',
  templateUrl: './base-chart-card.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export abstract class BaseChartCard<TConfig extends BaseChartConfig> extends BaseCardComponent<TConfig> implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  
  protected chartInstance?: echarts.ECharts;
  protected chartState: ChartState = {
    data: [],
    loading: false
  };
  protected chartOptions: EChartsOption = {};
  protected destroy$ = new Subject<void>();
  protected isChartCard = false;
  protected visualConfig?: ChartVisualConfig;

  constructor(
    protected override translateService: TranslateService,
    protected datasourceService: DatasourceService
  ) {
    super(translateService);
    this.isChartCard = true;
  }

  override ngOnInit() {
    super.ngOnInit();
    this.loadCardTranslations();
    this.visualConfig = this.card.configuration?.visualConfig;
    this.setupCommonChartOptions();
    if (this.card.configuration?.datasource) {
      this.loadData();
    }
  }

  ngAfterViewInit() {
    this.initChart();
    this.updateChartOptions();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected loadData() {
    if (!this.card.configuration?.datasource) {
      console.warn('No datasource configuration found');
      return;
    }

    this.chartState.loading = true;
    this.chartState.error = undefined;

    const parameters: DataRequestParametersDto = {
      pageNumber: 1,
      pageSize: 1000, // Augmenter la taille pour avoir toutes les données
      orderBy: [],
      globalSearch: '',
      columnSearches: []
    };

    this.datasourceService.fetchData(this.card.configuration.datasource, parameters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.chartState.data = this.transformData(response.items || []);
          this.chartState.loading = false;
          this.updateChartOptions();
          if (this.chartInstance) {
            this.chartInstance.setOption(this.chartOptions);
          }
        },
        error: (error) => {
          console.error('Error loading chart data:', error);
          this.chartState.error = error.message || 'Error loading data';
          this.chartState.loading = false;
        }
      });
  }

  protected initChart() {
    if (this.chartContainer) {
      this.chartInstance = echarts.init(this.chartContainer.nativeElement);
      this.chartInstance.setOption(this.chartOptions);

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        if (this.chartInstance) {
          this.chartInstance.resize();
        }
      });
      resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  protected setupCommonChartOptions() {
    const visualConfig = this.card.configuration?.visualConfig;
    
    // Calculer les marges de la grille en fonction de la position de la légende
    const gridMargins = {
      left: '3%',
      right: '4%',
      top: '3%',
      bottom: '3%'
    };

    // Ajuster les marges selon la position de la légende
    if (visualConfig?.legend?.show) {
      switch (visualConfig.legend.position) {
        case 'left':
          gridMargins.left = '15%';
          break;
        case 'right':
          gridMargins.right = '15%';
          break;
        case 'top':
          gridMargins.top = '15%';
          break;
        case 'bottom':
          gridMargins.bottom = '15%';
          break;
      }
    }
    
    this.chartOptions = {
      backgroundColor: visualConfig?.backgroundColor,
      textStyle: {
        color: visualConfig?.textColor
      },
      tooltip: visualConfig?.tooltip || {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        show: visualConfig?.legend?.show ?? true,
        orient: visualConfig?.legend?.position === 'right' || visualConfig?.legend?.position === 'left' ? 'vertical' : 'horizontal',
        left: visualConfig?.legend?.position === 'left' ? '3%' : visualConfig?.legend?.position === 'right' ? 'right' : 'center',
        top: visualConfig?.legend?.position === 'top' ? '3%' : visualConfig?.legend?.position === 'bottom' ? 'bottom' : 'middle',
        textStyle: {
          color: visualConfig?.textColor
        }
      },
      toolbox: visualConfig?.toolbox || {
        show: true,
        feature: {
          saveAsImage: { show: true }
        }
      },
      grid: {
        ...visualConfig?.grid,
        left: gridMargins.left,
        right: gridMargins.right,
        top: gridMargins.top,
        bottom: gridMargins.bottom,
        containLabel: true
      }
    };
  }

  protected abstract updateChartOptions(): void;
  protected abstract transformData(data: any[]): any;

  protected onVisualConfigChange(config: ChartVisualConfig) {
    if (this.card.configuration) {
      this.card.configuration.visualConfig = config;
      this.visualConfig = config;
      this.setupCommonChartOptions();
      this.updateChartOptions();
      if (this.chartInstance) {
        this.chartInstance.setOption(this.chartOptions);
      }
    }
  }
} 