import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
      alternateRowsBrightness: 80       // Valeur par défaut de 80%
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

  constructor(
    protected override cardDatabaseService: CardDatabaseService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dataService: DataTableCardCardService
  ) {
    super(cardDatabaseService);
    this.currentLanguage = this.translateService.currentLang;
  }

  ngOnInit() {
    if (this.card.configuration?.datasource) {
      // S'abonner aux changements de données
      this.dataService.getData(this.card.configuration.datasource)
        .pipe(takeUntil(this.destroy$))
        .subscribe(items => {
          // Créer une nouvelle référence pour forcer la détection de changements
          this.data = [...items];
          
          // Force la détection de changements immédiatement
          setTimeout(() => {
            this.cdr.detectChanges();
          });
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
