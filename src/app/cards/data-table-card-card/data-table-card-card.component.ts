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
import { FormsModule } from '@angular/forms';

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
  isFixed?: boolean;
  isFixedRight?: boolean;
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
  imports: [CommonModule, TranslateModule, FormsModule],
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
  private initialLoadDone: boolean = false;
  @Output() configurationChanged = new EventEmitter<any>();
  private columnWidths = new Map<string, number>();

  constructor(
    protected override cardDatabaseService: CardDatabaseService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dataService: DataTableCardCardService
  ) {
    super(cardDatabaseService);
    this._hasFooter = true;
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
          this.updateColumnWidths();
          this.cdr.detectChanges();
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
    }
  }

  ngAfterViewInit() {
    // Observer la taille du conteneur
    this.tableContainer = document.querySelector('.table-container');
    if (this.tableContainer) {
      // Attendre que le DOM soit stable
      setTimeout(() => {
        this.measureRowHeight();
        
        // Si rowCount est défini dans la configuration, on l'utilise
        if (this.card.configuration?.visualConfig.rowCount) {
          this.pageSize = this.card.configuration.visualConfig.rowCount;
          this.loadData();
        } else {
          // Sinon on calcule la taille optimale
          this.calculateAndSetOptimalSize();
        }
        
        this.updateColumnWidths();
        this.initialLoadDone = true;
        
        // On n'observe les redimensionnements qu'après le chargement initial
        if (this.tableContainer) {  // Vérification supplémentaire pour le type
          this.resizeObserver.observe(this.tableContainer);
        }
      }, 100);
    }
  }

  private calculateAndSetOptimalSize() {
    if (!this.tableContainer || !this.rowHeight) return;

    const availableHeight = this.tableContainer.clientHeight;
    const headerHeight = this.tableContainer.querySelector('thead')?.offsetHeight || 0;
    const availableRowSpace = availableHeight - headerHeight;
    
    // Calculer le nombre optimal de lignes en tenant compte de la bordure
    const rowWithBorderHeight = this.rowHeight + 1; // +1 pour la bordure
    const optimalRows = Math.floor(availableRowSpace / rowWithBorderHeight);
    
    // Si le nombre total d'éléments est inférieur à la taille optimale, on ajuste
    const targetSize = Math.min(optimalRows, this.totalItems || optimalRows);
    const newPageSize = Math.max(1, targetSize);

    this.pageSize = newPageSize;
    
    // Sauvegarder le nombre de lignes dans la configuration
    if (this.card.configuration) {
      this.card.configuration.visualConfig.rowCount = newPageSize;
      this.configurationChanged.emit(this.card);
    }

    this.loadData();
  }

  private measureRowHeight() {
    if (!this.tableContainer) return;
    
    // Sélectionner spécifiquement une ligne de données (pas le header)
    const dataRow = this.tableContainer.querySelector('tbody tr:not(.animate-pulse)') as HTMLElement;
    if (dataRow) {
      this.rowHeight = dataRow.offsetHeight;
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
    // Ignorer les événements de resize avant le chargement initial
    // ou si on a une taille configurée
    if (this.isAdjusting || !this.initialLoadDone || this.card.configuration?.visualConfig.rowCount) return;
    
    this.isAdjusting = true;
    // Attendre que le DOM soit stable
    setTimeout(() => {
      this.measureRowHeight();
      this.calculateAndSetOptimalSize();
      this.updateColumnWidths();
      this.isAdjusting = false;
    }, 200);
  }

  private loadData() {
    if (this.card.configuration?.datasource) {
      this.dataService.loadData(
        this.card.configuration.datasource,
        this.currentPage,
        this.pageSize,
        false // Ne pas afficher le chargement lors des changements de page
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
    return this.dataService.isDateColumn(column);
  }

  isNumberColumn(column: ColumnConfig): boolean {
    return this.dataService.isNumberColumn(column);
  }

  getColumnLabel(column: ColumnConfig): string {
    return column.label[this.currentLanguage] || column.label['en'] || column.key;
  }

  getColumnValue(item: any, column: ColumnConfig): any {
    return this.dataService.getColumnValue(item, column, this.currentLanguage);
  }

  getFixedColumnLeft(column: ColumnConfig): string | null {
    if (!column.isFixed) return null;
    
    let left = 0;
    for (const col of this.getVisibleColumns()) {
      if (col === column) break;
      if (col.isFixed) {
        // Utiliser la largeur réelle de la colonne
        left += this.columnWidths.get(col.key) || 0;
      }
    }
    return `${left}px`;
  }

  getFixedColumnRight(column: ColumnConfig): string | null {
    if (!column.isFixedRight) return null;
    
    let right = 0;
    const visibleColumns = this.getVisibleColumns();
    for (let i = visibleColumns.length - 1; i >= 0; i--) {
      const col = visibleColumns[i];
      if (col === column) break;
      if (col.isFixedRight) {
        right += this.columnWidths.get(col.key) || 0;
      }
    }
    return `${right}px`;
  }

  getRowBackgroundColor(index: number): string {
    const baseColor = this.card.configuration?.visualConfig.rowBackgroundColor || '#111827';
    
    if (this.card.configuration?.visualConfig.alternateRowColors && 
        this.card.configuration?.visualConfig.alternateRowsBrightness > 0 && 
        index % 2 === 0) {
      return this.adjustColor(baseColor, this.card.configuration.visualConfig.alternateRowsBrightness);
    }
    
    return baseColor;
  }

  private adjustColor(color: string, brightness: number): string {
    // Convertir la couleur hex en RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Ajuster la luminosité
    const factor = (brightness || 0) / 100;
    const newR = Math.min(255, r + (255 - r) * factor);
    const newG = Math.min(255, g + (255 - g) * factor);
    const newB = Math.min(255, b + (255 - b) * factor);

    // Convertir en hex
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }

  private updateColumnWidths() {
    if (!this.tableContainer) return;

    const headerCells = Array.from(this.tableContainer.querySelectorAll('thead th'));
    headerCells.forEach((cell, index) => {
      const column = this.getVisibleColumns()[index];
      if (column) {
        this.columnWidths.set(column.key, (cell as HTMLElement).offsetWidth);
      }
    });
  }

  getTotalPages(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.getTotalPages().length) {
      return;
    }
    
    this.currentPage = page;
    this.loadData();
  }
} 
