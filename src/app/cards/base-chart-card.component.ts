import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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

  constructor(
    protected override translateService: TranslateService,
    protected datasourceService: DatasourceService
  ) {
    super(translateService);
  }

  override ngOnInit() {
    super.ngOnInit();
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
      legend: visualConfig?.legend || {
        show: true,
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
      grid: visualConfig?.grid || {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    };
  }

  protected abstract updateChartOptions(): void;
  protected abstract transformData(data: any[]): any;
} 