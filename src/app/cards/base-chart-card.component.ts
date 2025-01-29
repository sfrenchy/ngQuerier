import { Component, ElementRef, ViewChild, OnInit, OnDestroy, AfterViewInit, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

import { BaseCardComponent } from './base-card.component';
import { DatasourceService } from '../shared/components/datasource-configuration/datasource.service';
import { BaseChartConfig, ChartVisualConfig } from '../models/chart.models';
import { DataRequestParametersDto, PaginatedResultDto } from '../models/api.models';
import { StoredProcedureParameter } from '../models/parameters.models';
import { ChartParametersFooterComponent } from '../shared/components/chart-parameters-footer/chart-parameters-footer.component';
import { RequestParametersService } from '../shared/services/request-parameters.service';

interface ChartState {
  data: any[];
  loading: boolean;
  error?: string;
  lastUpdate?: Date;
}

@Component({
  selector: 'app-base-chart-card',
  templateUrl: './base-chart-card.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BaseCardComponent,
    ChartParametersFooterComponent
  ]
})
@Injectable()
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
  protected isPanelOpen = false;
  protected requestParameters: DataRequestParametersDto = {
    pageNumber: 1,
    pageSize: 1000,
    orderBy: [],
    globalSearch: '',
    columnSearches: []
  };
  private currentCacheKey?: string;

  constructor(
    protected override translateService: TranslateService,
    protected datasourceService: DatasourceService,
    protected requestParametersService: RequestParametersService
  ) {
    super(translateService);
    this.isChartCard = true;
  }

  override ngOnInit() {
    super.ngOnInit();
    this.loadCardTranslations();
    this.visualConfig = this.card.configuration?.visualConfig;

    // Charger les paramètres sauvegardés avant le premier chargement
    if (this.card.id) {
      const savedParams = this.requestParametersService.loadFromLocalStorage(this.card.id);
      if (savedParams) {
        this.requestParameters = savedParams;
      }
    }

    // Initialiser chartParameters si nécessaire pour les stored procedures
    if (this.card.configuration?.datasource?.isStoredProcedure) {
      if (!this.card.configuration.chartParameters) {
        this.card.configuration.chartParameters = {
          parameters: [],
          autoRefreshInterval: 0
        };
      }
      // Convertir les procedureParameters en parameters si nécessaire
      if (this.card.configuration.datasource.procedureParameters && !this.card.configuration.chartParameters.parameters.length) {
        // Créer une copie profonde des paramètres pour éviter les références partagées
        const parameters = Object.entries(this.card.configuration.datasource.procedureParameters as Record<string, StoredProcedureParameter>)
          .map(([name, param]) => ({
            name,
            type: param.type,
            value: param.value,
            userChangeAllowed: param.userChangeAllowed,
            displayName: param.displayName,
            description: param.description,
            dateType: param.dateType
          }));

        // Mettre à jour chartParameters
        this.card.configuration.chartParameters.parameters = parameters;

        // S'assurer que les procedureParameters sont synchronisés
        parameters.forEach(param => {
          if (this.card.configuration?.datasource?.procedureParameters) {
            this.card.configuration.datasource.procedureParameters[param.name] = { ...param };
          }
        });
      }
    }

    console.log('[BaseChartCard] Configuration initiale:', {
      chartParameters: this.card.configuration?.chartParameters,
      datasource: this.card.configuration?.datasource
    });
    this.setupCommonChartOptions();
    if (this.card.configuration?.datasource) {
      this.loadData();
      this.setupAutoRefreshIfNeeded();
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
    if (this.currentCacheKey) {
      this.datasourceService.clearAutoRefresh(this.currentCacheKey);
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

    // Récupérer les paramètres utilisateur si présents
    const userParameters = this.card.configuration.chartParameters?.parameters?.reduce((acc: Record<string, StoredProcedureParameter>, param: StoredProcedureParameter) => {
      acc[param.name] = param;
      return acc;
    }, {});

    console.log('[BaseChartCard] Chargement des données avec paramètres:', {
      chartParameters: this.card.configuration.chartParameters,
      requestParameters: this.requestParameters,
      userParameters,
      isStoredProcedure: this.card.configuration.datasource.isStoredProcedure
    });

    // Générer une clé de cache unique pour ce jeu de paramètres
    this.currentCacheKey = `${this.card.id}_${JSON.stringify(this.requestParameters)}_${JSON.stringify(userParameters)}`;

    this.datasourceService.fetchData(
      this.card.configuration.datasource,
      this.requestParameters,
      userParameters
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: PaginatedResultDto<any>) => {
        console.log('[BaseChartCard] Données reçues:', {
          itemCount: response.items?.length,
          lastUpdate: new Date()
        });
        this.chartState.data = this.transformData(response.items || []);
        this.chartState.loading = false;
        this.chartState.lastUpdate = new Date();
        this.updateChartOptions();
        if (this.chartInstance) {
          this.chartInstance.setOption(this.chartOptions);
        }
      },
      error: (error: Error) => {
        console.error('[BaseChartCard] Erreur de chargement:', error);
        this.chartState.error = error.message || 'Error loading data';
        this.chartState.loading = false;
      }
    });
  }

  protected setupAutoRefreshIfNeeded(): void {
    const refreshInterval = this.card.configuration?.chartParameters?.autoRefreshInterval;
    if (refreshInterval && refreshInterval > 0) {
      const userParameters = this.card.configuration.chartParameters?.parameters?.reduce((acc: Record<string, StoredProcedureParameter>, param: StoredProcedureParameter) => {
        acc[param.name] = param;
        return acc;
      }, {});

      this.datasourceService.setupAutoRefresh(
        this.card.configuration!.datasource,
        this.requestParameters,
        userParameters || {},
        refreshInterval,
        (response: PaginatedResultDto<any>) => {
          this.chartState.data = this.transformData(response.items || []);
          this.chartState.lastUpdate = new Date();
          this.updateChartOptions();
          if (this.chartInstance) {
            this.chartInstance.setOption(this.chartOptions);
          }
        }
      );
    }
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

  protected onRequestParametersChange(parameters: DataRequestParametersDto) {
    this.requestParameters = parameters;
    this.loadData();
  }

  protected onStoredProcedureParametersChange(parameters: StoredProcedureParameter[]) {
    if (this.card.configuration?.chartParameters) {
      this.card.configuration.chartParameters.parameters = parameters;
      
      // Sync with procedureParameters
      if (this.card.configuration.datasource?.procedureParameters) {
        parameters.forEach(param => {
          this.card.configuration!.datasource!.procedureParameters![param.name] = { ...param };
        });
      }
      
      this.loadData();
    }
  }
} 