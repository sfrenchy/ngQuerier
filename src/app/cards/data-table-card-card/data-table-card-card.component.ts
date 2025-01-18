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
      type: 'API',
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
  imports: [CommonModule, TranslateModule, FormsModule, BaseCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableCardCardComponent extends BaseCardComponent<DataTableCardCardConfig> implements OnInit, OnDestroy {
  data: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 0;
  loading: boolean = false;
  currentLanguage: string;
  hoveredRow: number = -1;
  private destroy$ = new Subject<void>();
  private tableContainer: HTMLElement | null = null;
  private tableHeader: HTMLElement | null = null;
  private tableFooter: HTMLElement | null = null;
  private readonly ROW_HEIGHT = 30;      // Hauteur de base d'une ligne
  private readonly ROW_BORDER = 1;       // Bordure entre les lignes
  private readonly CELL_PADDING = 12;    // Padding vertical des cellules (6px haut + 6px bas)
  private readonly ROW_TOTAL_HEIGHT = this.ROW_HEIGHT + this.ROW_BORDER + this.CELL_PADDING;
  adjustedRowHeight: number = this.ROW_HEIGHT;
  private initialLoadDone: boolean = false;
  private isAdjusting: boolean = false;
  private resizeTimeout: any = null;
  private columnWidths = new Map<string, number>();
  @Output() configurationChanged = new EventEmitter<any>();

  constructor(
    protected override cardDatabaseService: CardDatabaseService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dataService: DataTableCardCardService
  ) {
    super(cardDatabaseService);
    this._hasFooter = true;
    this.currentLanguage = this.translateService.currentLang;
  }

  ngOnInit() {
    try {
      if (this.card.configuration?.datasource && this.isValidConfiguration()) {
        // S'abonner aux changements de données
        this.dataService.getData(this.card.configuration.datasource)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (items) => {
              this.data = [...items];
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error in getData subscription:', error);
              this.data = [];
              this.cdr.detectChanges();
            }
          });

        this.dataService.getTotal(this.card.configuration.datasource)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (total) => {
              this.totalItems = total;
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error in getTotal subscription:', error);
              this.totalItems = 0;
              this.cdr.detectChanges();
            }
          });

        this.dataService.isLoading(this.card.configuration.datasource)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (loading) => {
              this.loading = loading;
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error in isLoading subscription:', error);
              this.loading = false;
              this.cdr.detectChanges();
            }
          });

        // Ne pas charger les données ici, attendre le calcul de la taille optimale
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.cdr.detectChanges();
    }
  }

  private isValidConfiguration(): boolean {
    return !!(this.card.configuration?.datasource?.connection && this.card.configuration?.datasource?.controller);
  }

  ngAfterViewInit() {
    try {
      if (this.isValidConfiguration()) {
        // Récupérer les références aux éléments
        this.tableContainer = document.querySelector('.data-table-container');
        this.tableHeader = document.querySelector('.data-table-header');
        this.tableFooter = document.querySelector('.data-table-footer');
        
        this.calculateAndSetOptimalSize(true);
        this.initialLoadDone = true;
      }
    } catch (error) {
      console.error('Error in DataTableCardCard initialization:', error);
      this.cdr.detectChanges();
    }
  }

  protected override onHeightChange() {
    console.log('[DataTable] onHeightChange appelé, hauteur:', this.height);
    if (this.height > 0) {
      // Attendre que le DOM soit stable
      setTimeout(() => {
        this.calculateAndSetOptimalSize(true);
      });
    }
  }

  private calculateAndSetOptimalSize(shouldReloadData: boolean = true) {
    try {
      if (!this.isValidConfiguration() || this.height <= 0) {
        console.log('[DataTable] Impossible de calculer la taille optimale:', {
          height: this.height,
          isValidConfig: this.isValidConfiguration()
        });
        return;
      }

      // Récupérer la hauteur disponible du conteneur de la table
      const tableContainer = document.querySelector('[tablecontainer]') as HTMLElement;
      if (!tableContainer) {
        console.log('[DataTable] Conteneur de table non trouvé');
        return;
      }

      const availableHeight = tableContainer.clientHeight;
      console.log('[DataTable] Hauteur disponible du conteneur:', availableHeight);

      // Si la hauteur n'est pas encore disponible, réessayer plus tard
      if (availableHeight <= 0) {
        console.log('[DataTable] Hauteur non disponible, nouvel essai dans 100ms');
        setTimeout(() => {
          this.calculateAndSetOptimalSize(shouldReloadData);
        }, 100);
        return;
      }

      // Calculer le nombre optimal de lignes
      const optimalRows = Math.floor(availableHeight / this.ROW_TOTAL_HEIGHT);
      const targetSize = Math.min(optimalRows, this.totalItems || optimalRows);
      const newPageSize = Math.max(1, targetSize);

      // Calculer la hauteur ajustée des lignes pour remplir l'espace
      const totalSpace = availableHeight - ((newPageSize - 1) * this.ROW_BORDER);
      const newRowHeight = Math.floor(totalSpace / newPageSize) - this.CELL_PADDING;
      
      console.log('[DataTable] Calcul de la taille optimale:', {
        containerHeight: availableHeight,
        optimalRows,
        newPageSize,
        newRowHeight,
        currentHeight: this.adjustedRowHeight,
        totalItems: this.totalItems,
        shouldReloadData
      });

      // Ne mettre à jour que si nous avons une hauteur valide
      if (newRowHeight > 0) {
        this.adjustedRowHeight = newRowHeight;
        
        // Si le nombre de lignes a changé
        if (this.pageSize !== newPageSize && newPageSize > 0) {
          console.log('[DataTable] Changement du nombre de lignes:', {
            ancien: this.pageSize,
            nouveau: newPageSize
          });
          this.pageSize = newPageSize;
          
          // Sauvegarder le nombre de lignes dans la configuration
          if (this.card.configuration) {
            this.card.configuration.visualConfig.rowCount = newPageSize;
            this.configurationChanged.emit(this.card);
          }

          // Ne recharger les données que si demandé et si la taille a changé
          if (shouldReloadData) {
            console.log('[DataTable] Rechargement des données');
            this.loadData();
          }
        }

        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error in calculateAndSetOptimalSize:', error);
      this.cdr.detectChanges();
    }
  }

  private loadData() {
    try {
      if (this.card.configuration?.datasource && this.isValidConfiguration()) {
        this.dataService.loadData(
          this.card.configuration.datasource,
          this.currentPage,
          this.pageSize
        );
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      this.cdr.detectChanges();
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

  getRowStyle(index: number): any {
    return {
      'height.px': this.adjustedRowHeight + this.CELL_PADDING,
      'background-color': this.getRowBackgroundColor(index),
      'color': this.card.configuration?.visualConfig.rowTextColor
    };
  }

  ngOnDestroy() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
} 
