import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Card } from '@cards/card.decorator';
import { DataTableCardCardConfigurationComponent } from './data-table-card-card-configuration.component';
import { BaseCardConfig } from '@models/api.models';
import { BaseCardComponent } from '@cards/base-card.component';
import { DatasourceConfig } from '@models/datasource.models';
import { CardDatabaseService } from '@services/card-database.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataTableCardCardService } from './data-table-card-card.service';

export interface ColumnConfig {
  key: string;
  type: string;
  label: { [key: string]: string };
  alignment: 'left' | 'center' | 'right';
  visible: boolean;
  decimals?: number;
  dateFormat?: 'date' | 'time' | 'datetime';
  isNavigation?: boolean;
  navigationType?: string;
  isCollection?: boolean;
  elementType?: string;
  entityMetadata?: {
    isPrimaryKey?: boolean;
    isIdentity?: boolean;
    columnName?: string;
    columnType?: string;
    defaultValue?: any;
    isRequired?: boolean;
    isForeignKey?: boolean;
    foreignKeyTable?: string;
    foreignKeyColumn?: string;
    foreignKeyConstraintName?: string;
    maxLength?: number;
  };
}

export interface TableVisualConfig {
  headerBackgroundColor: string;
  rowBackgroundColor: string;
  headerTextColor: string;
  rowTextColor: string;
  isCompactMode: boolean;
  alternateRowColors: boolean;
  alternateRowsBrightness: number;
  rowCount?: number;
}

export class DataTableCardCardConfig extends BaseCardConfig {
  datasource: DatasourceConfig;
  columns?: ColumnConfig[];
  visualConfig: TableVisualConfig;

  constructor() {
    super();
    this.datasource = {
      type: 'API'
    };
    this.visualConfig = {
      headerBackgroundColor: '#1f2937', // bg-gray-800
      rowBackgroundColor: '#111827',    // bg-gray-900
      headerTextColor: '#d1d5db',       // text-gray-300
      rowTextColor: '#d1d5db',          // text-gray-300
      isCompactMode: false,
      alternateRowColors: false,
      alternateRowsBrightness: 80,      // Valeur par défaut de 80%
      rowCount: undefined               // Pas de valeur par défaut
    };
  }

  toJson(): any {
    return {
      datasource: this.datasource,
      columns: this.columns,
      visualConfig: this.visualConfig
    };
  }

  static fromJson(json: any): DataTableCardCardConfig {
    const config = new DataTableCardCardConfig();
    if (json.datasource) {
      config.datasource = json.datasource;
    }
    if (json.columns) {
      config.columns = json.columns;
    }
    if (json.visualConfig) {
      config.visualConfig = {
        ...config.visualConfig,
        ...json.visualConfig
      };
    }
    return config;
  }
}

@Card({
  name: 'DataTableCard',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
  </svg>`,
  configComponent: DataTableCardCardConfigurationComponent,
  configType: DataTableCardCardConfig,
  defaultConfig: () => new DataTableCardCardConfig()
})
@Component({
  selector: 'app-data-table-card-card',
  templateUrl: './data-table-card-card.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableCardCardComponent extends BaseCardComponent<DataTableCardCardConfig> implements OnInit, OnDestroy {
  data: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  currentLanguage: string;
  hoveredRow: number = -1;
  private destroy$ = new Subject<void>();
  private resizeObserver: ResizeObserver;
  private tableContainer: HTMLElement | null = null;
  private rowHeight: number = 0;
  private lastOptimalSize: number = 0;
  private isAdjusting: boolean = false;
  @Output() configurationChanged = new EventEmitter<any>();

  constructor(
    protected override cardDatabaseService: CardDatabaseService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dataService: DataTableCardCardService
  ) {
    super(cardDatabaseService);
    this.currentLanguage = this.translateService.currentLang;
    this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
  }

  ngOnInit() {
    if (this.card.configuration?.datasource) {
      // Utiliser le nombre de lignes de la configuration si disponible
      if (this.card.configuration.visualConfig.rowCount) {
        this.pageSize = this.card.configuration.visualConfig.rowCount;
      }

      // S'abonner aux changements de données
      this.dataService.getData(this.card.configuration.datasource)
        .pipe(takeUntil(this.destroy$))
        .subscribe(items => {
          this.data = [...items];
          
          // Après le chargement des données, vérifier si la taille est optimale
          // seulement si rowCount n'est pas défini
          if (!this.card.configuration?.visualConfig.rowCount) {
            setTimeout(() => {
              this.checkOptimalSize();
              this.cdr.detectChanges();
            });
          }
        });

      this.dataService.getTotal(this.card.configuration.datasource)
        .pipe(takeUntil(this.destroy$))
        .subscribe(total => {
          this.totalItems = total;
          this.cdr.detectChanges();
        });

      this.dataService.isLoading(this.card.configuration.datasource)
        .pipe(takeUntil(this.destroy$))
        .subscribe(loading => {
          this.loading = loading;
          this.cdr.detectChanges();
        });

      // Charger les données initiales
      this.dataService.loadData(
        this.card.configuration.datasource,
        this.currentPage,
        this.pageSize
      );
    }
  }

  ngAfterViewInit() {
    // Observer la taille du conteneur
    this.tableContainer = document.querySelector('.table-container');
    if (this.tableContainer) {
      this.resizeObserver.observe(this.tableContainer);
      // Attendre que les données soient chargées pour mesurer la hauteur
      setTimeout(() => {
        this.measureRowHeight();
        this.checkOptimalSize();
      }, 100);
    }
  }

  private measureRowHeight() {
    if (!this.tableContainer) return;
    
    // Sélectionner spécifiquement une ligne de données (pas le header)
    const dataRow = this.tableContainer.querySelector('tbody tr:not(.animate-pulse)') as HTMLElement;
    if (dataRow) {
      this.rowHeight = dataRow.offsetHeight;
    }
  }

  private checkOptimalSize() {
    if (!this.tableContainer || this.isAdjusting) {
      return;
    }

    // Mesurer la hauteur de ligne si pas encore fait
    if (!this.rowHeight) {
      this.measureRowHeight();
      if (!this.rowHeight) return;
    }

    const availableHeight = this.tableContainer.clientHeight;
    const headerHeight = this.tableContainer.querySelector('thead')?.offsetHeight || 0;
    const availableRowSpace = availableHeight - headerHeight;
    
    // Calculer le nombre optimal de lignes en tenant compte de la bordure
    const rowWithBorderHeight = this.rowHeight + 1; // +1 pour la bordure
    const optimalRows = Math.floor(availableRowSpace / rowWithBorderHeight);
    
    // Si le nombre total d'éléments est inférieur à la taille optimale, on ajuste
    const targetSize = Math.min(optimalRows, this.totalItems);

    // Vérifier si on peut ajouter au moins une ligne
    const currentTotalHeight = headerHeight + (this.pageSize * rowWithBorderHeight);
    const hasSpaceForMore = availableHeight - currentTotalHeight >= rowWithBorderHeight;

    // Ajuster si on peut ajouter des lignes ou si on a trop de lignes
    if (hasSpaceForMore || targetSize < this.pageSize) {
      this.isAdjusting = true;
      this.pageSize = targetSize;
      
      // Sauvegarder le nombre de lignes dans la configuration
      if (this.card.configuration) {
        this.card.configuration.visualConfig.rowCount = targetSize;
        // Émettre le changement de configuration
        this.configurationChanged.emit(this.card);
      }

      this.loadData();
      
      // Réinitialiser le flag après le chargement
      setTimeout(() => {
        this.isAdjusting = false;
      }, 200);
    }
  }

  ngOnDestroy() {
    if (this.tableContainer) {
      this.resizeObserver.unobserve(this.tableContainer);
    }
    this.resizeObserver.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onResize() {
    // Attendre que le DOM soit stable
    setTimeout(() => this.checkOptimalSize(), 0);
  }

  private loadData() {
    if (this.card.configuration?.datasource) {
      this.dataService.loadData(
        this.card.configuration.datasource,
        this.currentPage,
        this.pageSize
      );
    }
  }

  getVisibleColumns(): ColumnConfig[] {
    return this.card.configuration?.columns?.filter((c: ColumnConfig) => c.visible) || [];
  }

  getVisibleColumnsCount(): number {
    return this.getVisibleColumns().length;
  }

  isDateColumn(column: ColumnConfig): boolean {
    return !!column.entityMetadata?.columnType?.toLowerCase().includes('date');
  }

  isNumberColumn(column: ColumnConfig): boolean {
    const type = column.entityMetadata?.columnType?.toLowerCase() || '';
    return type.includes('int') || 
           type.includes('decimal') || 
           type.includes('float') || 
           type.includes('double') || 
           type.includes('number');
  }

  getColumnLabel(column: ColumnConfig): string {
    return column.label[this.currentLanguage] || column.label['en'] || column.key;
  }

  getColumnValue(item: any, column: ColumnConfig): any {
    if (!item || !column.key) {
      return '';
    }
    
    // Convertir la clé en camelCase
    const camelCaseKey = column.key.charAt(0).toLowerCase() + column.key.slice(1);
    
    // Gestion des propriétés imbriquées avec notation par points
    const keys = camelCaseKey.split('.');
    let value = item;
    
    for (const key of keys) {
      if (value === null || value === undefined) {
        return '';
      }
      value = value[key];
    }

    // Formatage des dates selon la configuration
    if (this.isDateColumn(column) && value) {
      const date = new Date(value);
      switch (column.dateFormat) {
        case 'date':
          return date.toLocaleDateString(this.currentLanguage);
        case 'time':
          return date.toLocaleTimeString(this.currentLanguage);
        case 'datetime':
        default:
          return date.toLocaleString(this.currentLanguage);
      }
    }

    // Formatage des nombres décimaux si spécifié
    if (this.isNumberColumn(column) && column.decimals !== undefined && value !== null && value !== undefined) {
      return Number(value).toFixed(column.decimals);
    }

    return value;
  }

  /**
   * Adjusts a color's brightness
   * @param color The base color in hex format
   * @param percent The percentage to adjust (-100 to 100, negative for darker, positive for lighter)
   */
  adjustColor(color: string, percent: number): string {
    if (!color || percent === 0) return color;
    
    // Convert hex to RGB
    const R = parseInt(color.substring(1,3), 16);
    const G = parseInt(color.substring(3,5), 16);
    const B = parseInt(color.substring(5,7), 16);

    // Pour l'assombrissement (percent négatif), on mélange avec du noir (0,0,0)
    // Pour l'éclaircissement (percent positif), on mélange avec du blanc (255,255,255)
    const blendR = percent > 0 ? 255 : 0;
    const blendG = percent > 0 ? 255 : 0;
    const blendB = percent > 0 ? 255 : 0;

    // On utilise la valeur absolue du pourcentage pour le calcul
    const ratio = Math.abs(percent) / 100;

    // Blend with target color
    const mixR = Math.round(R * (1 - ratio) + blendR * ratio);
    const mixG = Math.round(G * (1 - ratio) + blendG * ratio);
    const mixB = Math.round(B * (1 - ratio) + blendB * ratio);

    // Convert back to hex
    const RR = ((mixR.toString(16).length === 1) ? "0" + mixR.toString(16) : mixR.toString(16));
    const GG = ((mixG.toString(16).length === 1) ? "0" + mixG.toString(16) : mixG.toString(16));
    const BB = ((mixB.toString(16).length === 1) ? "0" + mixB.toString(16) : mixB.toString(16));

    return "#" + RR + GG + BB;
  }
} 
