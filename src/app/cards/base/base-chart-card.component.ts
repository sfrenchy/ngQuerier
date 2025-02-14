import {AfterViewInit, Component, ElementRef, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import * as echarts from 'echarts';
import {EChartsOption} from 'echarts';

import {BaseCardComponent} from './base-card.component';
import {DatasourceService} from '@shared/components/datasource-configuration/datasource.service';
import {BaseChartConfig, ChartVisualConfig} from '@models/chart.models';
import {DataRequestParametersDto, PaginatedResultDto} from '@models/api.models';
import {StoredProcedureParameter} from '@models/parameters.models';
import {
  ChartParametersFooterComponent
} from '@shared/components/chart-parameters-footer/chart-parameters-footer.component';
import {RequestParametersService} from '@shared/services/request-parameters.service';
import {LocalDataSourceService} from '@cards/data-table-card/local-datasource.service';
import {TableDataEvent} from '@cards/data-table-card/data-table-card.models';
import {CardConfigAdapterService} from '@cards/card-config-adapter.service';

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
    protected override cardConfigAdapter: CardConfigAdapterService,
    protected datasourceService: DatasourceService,
    protected requestParametersService: RequestParametersService,
    protected localDataSourceService: LocalDataSourceService
  ) {
    super(translateService, cardConfigAdapter);
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

        // Mettre à jour les paramètres de procédure stockée si nécessaire
        if (savedParams.procedureParameters && this.card.configuration?.chartParameters?.parameters) {
          const updatedParameters = this.card.configuration.chartParameters.parameters.map((param: StoredProcedureParameter) => {
            const savedParam = savedParams.procedureParameters?.[param.name];
            if (savedParam) {
              return {
                ...param,
                value: savedParam.value,
                dateType: savedParam.dateType
              };
            }
            return param;
          });
          this.card.configuration.chartParameters.parameters = updatedParameters;
        }
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
            this.card.configuration.datasource.procedureParameters[param.name] = {...param};
          }
        });
      }
    }

    this.setupCommonChartOptions();
    if (this.card.configuration?.datasource) {
      // Charger les données seulement après avoir initialisé tous les paramètres
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

  protected loadData(): void {
    if (!this.card.configuration?.datasource) {
      console.warn('[BaseChartCard] No datasource configuration');
      return;
    }

    this.chartState.loading = true;
    this.chartState.error = undefined;

    // Pour LocalDataTable, s'abonner aux mises à jour
    if (this.card.configuration.datasource.type === 'LocalDataTable') {
      const cardId = this.card.configuration.datasource.localDataTable?.cardId;
      if (!cardId) {
        this.chartState.error = 'No source table selected';
        this.chartState.loading = false;
        return;
      }

      const tableData = this.localDataSourceService.getTableData(cardId);
      if (!tableData) {
        this.chartState.error = 'Source table not registered';
        this.chartState.loading = false;
        return;
      }

      tableData.pipe(
        filter(event => !!event),
        takeUntil(this.destroy$)
      ).subscribe({
        next: (event: TableDataEvent | null) => {
          if (!event) {
            this.chartState.error = 'No data received';
            this.chartState.loading = false;
            return;
          }
          this.chartState.data = this.transformData(event.data || []);
          this.chartState.loading = false;
          this.chartState.lastUpdate = new Date();
          this.updateChartOptions();
        },
        error: (error: Error) => {
          console.error('[BaseChartCard] Error loading data:', error);
          this.chartState.error = error.message || 'Error loading data';
          this.chartState.loading = false;
        }
      });
      return;
    }

    // Pour les autres types de sources
    this.datasourceService
      .fetchData(this.card.configuration.datasource, this.requestParameters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (!result) {
            this.chartState.error = 'No data received';
            this.chartState.loading = false;
            return;
          }
          this.chartState.data = this.transformData(result.items || []);
          this.chartState.loading = false;
          this.chartState.lastUpdate = new Date();
          this.updateChartOptions();
        },
        error: (error: Error) => {
          console.error('[BaseChartCard] Error loading data:', error);
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

    // Configuration de base
    const baseOptions: EChartsOption = {
      backgroundColor: visualConfig?.backgroundColor,
      textStyle: {
        color: visualConfig?.textColor
      },
      animation: visualConfig?.animation,
      animationDuration: visualConfig?.animationDuration,
      animationEasing: visualConfig?.animationEasing,
    };

    // Configuration de la grille
    if (visualConfig?.grid) {
      baseOptions.grid = {
        ...visualConfig.grid,
        left: gridMargins.left,
        right: gridMargins.right,
        top: gridMargins.top,
        bottom: gridMargins.bottom,
        containLabel: true
      };
    }

    // Configuration de la légende
    if (visualConfig?.legend) {
      baseOptions.legend = {
        ...visualConfig.legend,
        show: visualConfig.legend.show ?? true,
        orient: visualConfig.legend.position === 'right' || visualConfig.legend.position === 'left' ? 'vertical' : 'horizontal',
        left: visualConfig.legend.position === 'left' ? '3%' : visualConfig.legend.position === 'right' ? 'right' : 'center',
        top: visualConfig.legend.position === 'top' ? '3%' : visualConfig.legend.position === 'bottom' ? 'bottom' : 'middle',
        textStyle: {
          ...visualConfig.legend.textStyle,
          color: visualConfig.legend.textStyle?.color ?? visualConfig.textColor
        }
      };
    }

    // Configuration du tooltip
    if (visualConfig?.tooltip) {
      baseOptions.tooltip = {
        ...visualConfig.tooltip,
        show: visualConfig.tooltip.show ?? true,
        trigger: visualConfig.tooltip.trigger ?? 'axis',
        axisPointer: {
          type: 'shadow'
        }
      };
    }

    // Configuration de la toolbox
    if (visualConfig?.toolbox) {
      baseOptions.toolbox = {
        ...visualConfig.toolbox,
        show: visualConfig.toolbox.show ?? true,
        orient: visualConfig.toolbox.orient ?? 'horizontal',
        itemSize: visualConfig.toolbox.itemSize ?? 15,
        itemGap: visualConfig.toolbox.itemGap ?? 10,
        showTitle: visualConfig.toolbox.showTitle ?? true,
        feature: {
          dataZoom: {
            show: visualConfig.toolbox.feature?.dataZoom?.show ?? false,
            title: {
              zoom: 'Zoom',
              back: 'Retour'
            }
          },
          restore: {
            show: visualConfig.toolbox.feature?.restore?.show ?? false,
            title: 'Réinitialiser'
          },
          saveAsImage: {
            show: visualConfig.toolbox.feature?.saveAsImage?.show ?? true,
            title: 'Sauvegarder'
          },
          dataView: {
            show: visualConfig.toolbox.feature?.dataView?.show ?? false,
            title: 'Données',
            lang: ['Vue données', 'Fermer', 'Actualiser']
          },
          magicType: visualConfig.toolbox.feature?.magicType?.show ? {
            show: true,
            type: visualConfig.toolbox.feature.magicType.type ?? ['line', 'bar', 'stack'],
            title: {
              line: 'Ligne',
              bar: 'Barre',
              stack: 'Empilé'
            }
          } : undefined
        }
      };
    } else {
      // Configuration par défaut de la toolbox si aucune n'est spécifiée
      baseOptions.toolbox = {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Sauvegarder'
          }
        }
      };
    }

    // Configuration du titre
    if (visualConfig?.title) {
      baseOptions.title = {
        ...visualConfig.title,
        show: visualConfig.title.show ?? false,
        textStyle: {
          ...visualConfig.title.textStyle,
          color: visualConfig.title.textStyle?.color ?? visualConfig.textColor
        },
        subtextStyle: {
          ...visualConfig.title.subtextStyle,
          color: visualConfig.title.subtextStyle?.color ?? visualConfig.textColor
        }
      };
    }

    this.chartOptions = baseOptions;
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
    }
    this.loadData();
  }
}
