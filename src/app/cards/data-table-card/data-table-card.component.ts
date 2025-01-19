import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Card } from '@cards/card.decorator';
import { DataTableCardConfigurationComponent } from './data-table-card-configuration.component';
import { BaseCardConfig, ColumnSearchDto, OrderByParameterDto, DataRequestParametersDto } from '@models/api.models';
import { BaseCardComponent } from '@cards/base-card.component';
import { DatasourceConfig } from '@models/datasource.models';
import { CardDatabaseService } from '@services/card-database.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataTableCardService } from './data-table-card.service';
import { FormsModule } from '@angular/forms';
import { ColumnFilterPopoverComponent } from './column-filter-popover.component';

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

export class DataTableCardConfig extends BaseCardConfig {
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

  static fromJson(json: any): DataTableCardConfig {
    const config = new DataTableCardConfig();
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
  configComponent: DataTableCardConfigurationComponent,
  configType: DataTableCardConfig,
  defaultConfig: () => new DataTableCardConfig()
})
@Component({
  selector: 'app-data-table-card',
  templateUrl: './data-table-card.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, BaseCardComponent, ColumnFilterPopoverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableCardComponent extends BaseCardComponent<DataTableCardConfig> implements OnInit, OnDestroy, AfterViewInit {
  data: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 0;
  loading: boolean = false;
  isCalculatingRows: boolean = true;
  currentLanguage: string;
  hoveredRow: number = -1;
  private destroy$ = new Subject<void>();
  private tableContainer: HTMLElement | null = null;
  private tableHeader: HTMLElement | null = null;
  private tableFooter: HTMLElement | null = null;
  private customScrollbar: HTMLElement | null = null;
  private readonly TABLE_BORDER = 1;
  private readonly ROW_BORDER = 1;
  private readonly CELL_PADDING = 8;
  private readonly SCROLLBAR_HEIGHT = 8;
  private readonly SCROLLBAR_MARGIN = 16;
  private readonly DEFAULT_ROW_HEIGHT = 30;

  private get TOTAL_SCROLLBAR_SPACE(): number {
    return this.SCROLLBAR_HEIGHT + this.SCROLLBAR_MARGIN;
  }

  private get ROW_HEIGHT(): number {
    return this.card?.configuration?.visualConfig.isCompactMode ? 20 : this.DEFAULT_ROW_HEIGHT;
  }

  adjustedRowHeight: number = this.DEFAULT_ROW_HEIGHT;
  private initialLoadDone: boolean = false;
  private isAdjusting: boolean = false;
  private resizeTimeout: any = null;
  private columnWidths = new Map<string, number>();
  private tableWidth: number = 0;
  @Output() configurationChanged = new EventEmitter<any>();
  @ViewChild('tableContainer') tableContainerRef!: ElementRef;
  @ViewChild('customScroll') customScrollRef!: ElementRef;
  private isScrolling = false;
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  isScrollbarNeeded: boolean = false;
  protected canGoFullscreen = true;
  globalSearch: string = '';
  public searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  // Nouvelles propriétés pour la gestion des filtres
  activeFilters = new Map<string, Set<string>>();
  columnValues = new Map<string, string[]>();
  activeFilterPopover: { column: ColumnConfig, element: HTMLElement } | null = null;
  private documentClickListener: ((event: MouseEvent) => void) | null = null;
  sortConfig: OrderByParameterDto[] = [];

  constructor(
    protected override cardDatabaseService: CardDatabaseService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dataService: DataTableCardService
  ) {
    super(cardDatabaseService);
    this.currentLanguage = this.translateService.currentLang;

    // Configuration de la recherche
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchTerm) => {
      this.globalSearch = searchTerm;
      this.currentPage = 1;
      this.loadData();
    });

    // Ajouter le listener de clic sur le document
    this.documentClickListener = (event: MouseEvent) => {
      console.log('[Filter] Document click event', {
        target: event.target,
        isButton: (event.target as HTMLElement).closest('button'),
        hasIcon: (event.target as HTMLElement).closest('button')?.querySelector('svg')
      });

      // Ne pas fermer si on clique sur un bouton de filtre
      const target = event.target as HTMLElement;
      const filterButton = target.closest('button');
      if (filterButton && filterButton.querySelector('svg')) {
        console.log('[Filter] Click on filter button, keeping popover open');
        return;
      }

      // Ne pas fermer si on clique dans le popover
      const popover = document.querySelector('app-column-filter-popover');
      if (popover && (popover.contains(target) || popover === target)) {
        console.log('[Filter] Click inside popover, keeping it open');
        return;
      }

      console.log('[Filter] Closing popover from document click');
      this.closeFilterPopover();
    };
    document.addEventListener('click', this.documentClickListener);
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
    if (this.isValidConfiguration()) {
      this.isCalculatingRows = true;
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.calculateAndSetOptimalSize(true);
        this.isCalculatingRows = false;
        this.initialLoadDone = true;
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  protected override onHeightChange() {
    if (this.height > 0) {
      setTimeout(() => {
        this.calculateAndSetOptimalSize(true);
        this.updateScrollbarVisibility();
      });
    }
  }

  private calculateAndSetOptimalSize(shouldReloadData: boolean = true) {
    try {
      if (!this.isValidConfiguration()) {
        return;
      }

      const tableContainer = this.tableContainerRef?.nativeElement;
      if (!tableContainer) {
        return;
      }

      // Calculer la hauteur disponible
      const availableHeight = tableContainer.clientHeight;

      if (availableHeight <= 0) {
        return;
      }

      // 1. Calculer la hauteur disponible pour les lignes
      const availableHeightForRows = availableHeight - this.TABLE_BORDER;

      // 2. Calculer le nombre de lignes qui peuvent tenir
      const rowTotalSpace = this.ROW_HEIGHT + this.ROW_BORDER + (this.CELL_PADDING * 2); // Hauteur + bordure + padding haut et bas
      const optimalRows = Math.floor(availableHeightForRows / rowTotalSpace);
      
      // 3. Déterminer le nombre final de lignes
      const targetSize = Math.min(optimalRows, this.totalItems || optimalRows);
      const newPageSize = Math.max(1, targetSize);

      // 4. Calculer la hauteur de ligne ajustée
      const totalSpace = availableHeightForRows - (newPageSize * this.ROW_BORDER) - (newPageSize * (this.CELL_PADDING * 2));
      const newRowHeight = Math.floor(totalSpace / newPageSize);

      if (newRowHeight > 0) {
        this.adjustedRowHeight = newRowHeight;
        
        if (this.pageSize !== newPageSize && newPageSize > 0) {
          this.pageSize = newPageSize;
          
          if (this.card.configuration) {
            this.card.configuration.visualConfig.rowCount = newPageSize;
            this.configurationChanged.emit(this.card);
          }

          if (shouldReloadData) {
            this.loadData();
          }
        }

        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Erreur dans calculateAndSetOptimalSize:', error);
      this.cdr.detectChanges();
    }
  }

  private loadData() {
    if (!this.card.configuration?.datasource || !this.isValidConfiguration()) {
      return;
    }

    // Construire les paramètres de recherche
    const searchParams = this.dataService.buildSearchParameters(this.activeFilters, this.globalSearch);

    // Construire les paramètres de pagination
    const paginationParameters: DataRequestParametersDto = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      orderBy: this.sortConfig,
      globalSearch: searchParams.globalSearch,
      columnSearches: searchParams.columnSearches
    };

    // Charger les données avec les paramètres de pagination
    this.dataService.loadData(this.card.configuration.datasource, paginationParameters);
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
    if (!this.tableContainerRef?.nativeElement) return;

    const headerCells = Array.from(this.tableContainerRef.nativeElement.querySelectorAll('thead th'));
    let totalWidth = 0;

    headerCells.forEach((cell, index) => {
      const column = this.getVisibleColumns()[index];
      const width = (cell as HTMLElement).offsetWidth;
      if (column) {
        this.columnWidths.set(column.key, width);
        totalWidth += width;
      }
    });

    this.tableWidth = Math.max(totalWidth, this.tableContainerRef.nativeElement.clientWidth);
    this.updateScrollbarVisibility();
  }

  getTableWidth(): string {
    return `${this.tableWidth}px`;
  }

  ngAfterViewChecked() {
    // Mettre à jour les largeurs et la visibilité du scrollbar quand le contenu change
    this.updateColumnWidths();
  }

  getTotalPages(): number[] {
    if (this.pageSize <= 0) return [1];
    
    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    // Limiter à un maximum raisonnable de pages (par exemple 10000)
    const safeTotal = Math.min(Math.max(1, totalPages), 10000);
    
    try {
      return Array.from({ length: safeTotal }, (_, i) => i + 1);
    } catch (error) {
      console.warn('[DataTable] Erreur lors de la création du tableau de pages:', {
        totalItems: this.totalItems,
        pageSize: this.pageSize,
        calculatedTotal: totalPages,
        safeTotal
      });
      return [1];
    }
  }

  onPageChange(page: number) {
    if (!this.pageSize || this.pageSize <= 0) {
      console.warn('[DataTable] Impossible de changer de page: taille de page invalide');
      return;
    }

    const totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (page < 1 || page > totalPages) {
      console.warn('[DataTable] Page demandée hors limites:', {
        page,
        totalPages,
        totalItems: this.totalItems,
        pageSize: this.pageSize
      });
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

  override ngOnDestroy() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy(); // Appeler la méthode du parent pour nettoyer les listeners de fullscreen
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    // Nettoyer le listener de clic
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
  }

  onTableScroll(event: Event) {
    if (this.isScrolling) return;
    this.isScrolling = true;

    const tableContainer = event.target as HTMLElement;
    if (this.customScrollRef?.nativeElement) {
      this.customScrollRef.nativeElement.scrollLeft = tableContainer.scrollLeft;
    }

    this.isScrolling = false;
    this.cdr.detectChanges(); // Force la mise à jour du thumb
  }

  getScrollThumbWidth(): number {
    if (!this.tableContainerRef?.nativeElement) return 100;
    const container = this.tableContainerRef.nativeElement;
    const ratio = container.clientWidth / container.scrollWidth;
    return Math.max(ratio * 100, 10); // Au moins 10% de largeur pour le thumb
  }

  getScrollThumbPosition(): number {
    if (!this.tableContainerRef?.nativeElement) return 0;
    const container = this.tableContainerRef.nativeElement;
    const maxScroll = container.scrollWidth - container.clientWidth;
    return maxScroll <= 0 ? 0 : (container.scrollLeft / maxScroll) * (100 - this.getScrollThumbWidth());
  }

  onScrollbarClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.tableContainerRef?.nativeElement || event.target !== event.currentTarget) return;
    
    const container = this.tableContainerRef.nativeElement;
    const scrollbar = event.currentTarget as HTMLElement;
    const rect = scrollbar.getBoundingClientRect();
    const thumbWidth = this.getScrollThumbWidth();
    
    // Ajuster la position de clic en fonction de la largeur du thumb
    const thumbOffset = (thumbWidth / 100) * rect.width / 2;
    const clickPosition = event.clientX - rect.left - thumbOffset;
    const scrollRatio = clickPosition / (rect.width - (thumbWidth / 100) * rect.width);
    
    const targetScroll = (container.scrollWidth - container.clientWidth) * scrollRatio;
    container.scrollLeft = Math.max(0, Math.min(container.scrollWidth - container.clientWidth, targetScroll));
    this.cdr.detectChanges();
  }

  onThumbMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.tableContainerRef?.nativeElement) return;
    
    const container = this.tableContainerRef.nativeElement;
    const thumb = event.target as HTMLElement;
    const scrollbar = thumb.parentElement as HTMLElement;
    const startX = event.clientX;
    const startScrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollbarRect = scrollbar.getBoundingClientRect();
    
    // Calculer le ratio de défilement en fonction de la largeur totale de la table
    const scrollRatio = container.scrollWidth / scrollbarRect.width;
    
    const onMouseMove = (e: MouseEvent) => {
      if (!this.tableContainerRef?.nativeElement) return;
      
      const deltaX = e.clientX - startX;
      // Appliquer un multiplicateur pour augmenter la sensibilité
      const scrollDelta = deltaX * scrollRatio * 1.5;
      const newScroll = startScrollLeft + scrollDelta;
      
      container.scrollLeft = Math.max(0, Math.min(maxScroll, newScroll));
      this.cdr.detectChanges();
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  private updateScrollbarVisibility() {
    if (!this.tableContainerRef?.nativeElement) return;
    
    const container = this.tableContainerRef.nativeElement;
    this.isScrollbarNeeded = container.scrollWidth > container.clientWidth;
    this.cdr.detectChanges();
  }

  onFullscreenChange(isFullscreen: boolean) {
    // Attendre que le changement de taille soit effectif
    setTimeout(() => {
      this.calculateAndSetOptimalSize(true);
      this.updateScrollbarVisibility();
    }, 100);
  }

  ngOnChanges() {
    this.searchSubject.next(this.globalSearch);
  }

  // Helper pour le template
  getSelectedValues(columnKey: string): Set<string> {
    return this.activeFilters.get(columnKey) || new Set<string>();
  }

  // Méthode modifiée pour gérer le type EventTarget
  toggleFilterPopover(column: ColumnConfig, button: HTMLElement, event: MouseEvent) {
    console.log('[Filter] Toggle filter popover', {
      column: column.key,
      button,
      currentPopover: this.activeFilterPopover?.column.key
    });

    event.stopPropagation();
    event.preventDefault();

    if (this.activeFilterPopover?.column === column) {
      console.log('[Filter] Closing popover for same column');
      this.closeFilterPopover();
      return;
    }

    console.log('[Filter] Opening popover for column', column.key);
    this.closeFilterPopover();
    this.activeFilterPopover = { column, element: button };
    
    // Charger les valeurs uniques si pas déjà fait
    if (!this.columnValues.has(column.key)) {
      console.log('[Filter] Loading unique values for column', column.key);
      this.loadUniqueValues(column);
    }

    // Forcer la détection de changements
    this.cdr.detectChanges();
    console.log('[Filter] Popover state after toggle', {
      activeColumn: this.activeFilterPopover?.column.key,
      hasValues: this.columnValues.has(column.key),
      valueCount: this.columnValues.get(column.key)?.length
    });
  }

  closeFilterPopover() {
    console.log('[Filter] Closing popover', {
      wasActive: this.activeFilterPopover?.column.key
    });
    this.activeFilterPopover = null;
    this.cdr.detectChanges();
  }

  // Charger les valeurs uniques pour une colonne
  private loadUniqueValues(column: ColumnConfig) {
    if (!this.card.configuration?.datasource) {
      console.warn('[Filter] No datasource configured');
      return;
    }

    console.log('[Filter] Loading unique values from API for column', column.key);
    this.dataService.getColumnValues(this.card.configuration.datasource, column.key)
      .subscribe({
        next: (values) => {
          console.log('[Filter] Received values from API:', values);
          this.columnValues.set(column.key, values);
          // Forcer la détection de changements après avoir mis à jour les valeurs
          setTimeout(() => {
            this.cdr.detectChanges();
            console.log('[Filter] Values updated and change detection triggered');
          });
        },
        error: (error) => {
          console.error('[Filter] Error loading unique values:', error);
          // En cas d'erreur, on utilise les valeurs locales comme fallback
          const localValues = new Set<string>();
          this.data.forEach(item => {
            const value = this.dataService.getColumnValue(item, column, this.currentLanguage);
            if (value !== null && value !== undefined && value !== '') {
              localValues.add(value.toString());
            }
          });
          console.log('[Filter] Using local values as fallback:', localValues);
          this.columnValues.set(column.key, Array.from(localValues).sort());
          // Forcer la détection de changements après avoir mis à jour les valeurs
          setTimeout(() => {
            this.cdr.detectChanges();
            console.log('[Filter] Fallback values updated and change detection triggered');
          });
        }
      });
  }

  // Gérer le changement de filtre
  onFilterChange(column: ColumnConfig, selectedValues: Set<string>) {
    if (selectedValues.size > 0) {
      this.activeFilters.set(column.key, selectedValues);
    } else {
      this.activeFilters.delete(column.key);
    }
    
    this.currentPage = 1; // Retour à la première page
    this.loadData();
  }

  // Méthode pour vérifier si une colonne a des filtres actifs
  hasActiveFilter(column: ColumnConfig): boolean {
    return this.activeFilters.has(column.key);
  }
} 
