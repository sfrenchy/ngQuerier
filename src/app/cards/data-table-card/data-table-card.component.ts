import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild, Output, EventEmitter, Renderer2, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, Observable, from, of, forkJoin, mergeMap, tap, catchError, EMPTY, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, map, mergeAll, toArray } from 'rxjs/operators';
import { Card } from '@cards/card.decorator';
import { BaseCardComponent } from '@cards/base/base-card.component';
import { DataTableCardService } from './data-table-card.service';
import { ColumnFilterPopoverComponent } from './column-filter-popover.component';
import { DataTableCardConfigurationComponent } from './data-table-card-configuration.component';
import { DataTableCardConfig, ColumnConfig } from './data-table-card.models';
import { OrderByParameterDto, DataRequestParametersDto, DBConnectionEndpointRequestInfoDto } from '@models/api.models';
import { DynamicFormComponent, FormDataSubmit } from './dynamic-form.component';
import { DatasourceConfig } from '@models/datasource.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { FormDataSubmitWithId } from './data-table-card.service';
import { ForeignKeyService } from './foreign-key.service';
import { TableStateService } from './table-state.service';
import { DatasourceService } from '@shared/components/datasource-configuration/datasource.service';
import { DataTableCardConfigFactory } from './data-table-card.factory';
import { ValidationError } from '@cards/validation/validation.models';
import { LocalDataSourceService } from './local-datasource.service';
import { TableDataEvent } from './data-table-card.models';

// Modifier l'interface ModalConfig
interface ModalConfig {
  titleKey: string;
  titleParams?: { [key: string]: any };
  showFullscreenButton?: boolean;
}

@Card({
  name: 'DataTable',
  translationPath: 'data-table-card',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
  </svg>`,
  configComponent: DataTableCardConfigurationComponent,
  configFactory: DataTableCardConfigFactory,
  defaultConfig: () => new DataTableCardConfig()
})
@Component({
  selector: 'app-data-table-card',
  templateUrl: './data-table-card.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, BaseCardComponent, ColumnFilterPopoverComponent, DynamicFormComponent, ConfirmationDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableCardComponent extends BaseCardComponent<DataTableCardConfig> implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tableContainer') tableContainerRef?: ElementRef;
  @ViewChild('tableHeader') tableHeaderRef?: ElementRef;
  @ViewChild('tableBody') tableBodyRef?: ElementRef;

  data: any[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 0;
  loading = false;
  isLoadingData = false;
  isCalculatingRows = true;
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

  private getHeaderHeight(): number {
    if (!this.tableContainerRef?.nativeElement) return 0;
    const header = this.tableContainerRef.nativeElement.querySelector('thead');
    return header ? header.offsetHeight : 0;
  }

  adjustedRowHeight: number = this.DEFAULT_ROW_HEIGHT;
  private initialLoadDone: boolean = false;
  private isAdjusting: boolean = false;
  private resizeTimeout: any = null;
  columnWidths = new Map<string, number>();
  private tableWidth: number = 0;
  @Output() configurationChanged = new EventEmitter<any>();
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
  public showDeleteConfirmation:boolean = false;
  public rowToDelete:any = null;
  // Nouvelles propriétés pour la gestion des filtres
  activeFilters = new Map<string, Set<string>>();
  columnValues = new Map<string, string[]>();
  activeFilterPopover: { column: ColumnConfig, element: HTMLElement } | null = null;
  private documentClickListener: ((event: MouseEvent) => void) | null = null;
  sortConfig: OrderByParameterDto[] = [];

  private actionsColumnWidth: number = 0;

  // Ajout des nouvelles propriétés
  showAddForm = false;
  addFormSchema: any = null;
  formData: any = null;

  // Nouvelles propriétés pour les clés étrangères
  addFormForeignKeyData: { [key: string]: any[] } = {};
  addFormForeignKeyConfigs: { [key: string]: any } = {};

  // Remplacer modalTitle: string par
  modalConfig: ModalConfig | null = null;

  private loadingTimer: any = null;
  private isPageChange = false;
  private loadingStartTime: number = 0;

  // Ajout des propriétés manquantes
  isEditMode: boolean = false;
  currentEditingRow: any = null;

  isFormLoading = false;

  private resizing: boolean = false;
  private currentResizeColumn: ColumnConfig | null = null;
  private startWidth: number = 0;
  private resizeGuide: HTMLElement | null = null;

  @ViewChild('headerContent') headerContent!: ElementRef;
  @ViewChild('filterContainer') filterContainer!: ElementRef;
  @ViewChild('filterOverlay') filterOverlay!: ElementRef;

  private currentDataSubject = new BehaviorSubject<TableDataEvent>({
    data: [],
    total: 0,
    schema: null
  });

  private previousConfig: DatasourceConfig | null = null;

  // Méthode utilitaire pour convertir les pixels en chaîne
  private px(value: number): string {
    return `${value}px`;
  }

  constructor(
    protected override translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private dataService: DataTableCardService,
    private foreignKeyService: ForeignKeyService,
    private tableStateService: TableStateService,
    private renderer: Renderer2,
    private datasourceService: DatasourceService,
    private configFactory: DataTableCardConfigFactory,
    private localDataSourceService: LocalDataSourceService
  ) {
    super(translateService);
    this.currentLanguage = this.translateService.currentLang;

    // S'abonner aux changements de langue
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.currentLanguage = event.lang;
        this.cdr.detectChanges();
      });

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
      // Ne pas fermer si on clique sur un bouton de filtre
      const target = event.target as HTMLElement;
      const filterButton = target.closest('button');
      if (filterButton && filterButton.querySelector('svg')) {
        return;
      }

      // Ne pas fermer si on clique dans le popover
      const popover = document.querySelector('app-column-filter-popover');
      if (popover && (popover.contains(target) || popover === target)) {
        return;
      }

      this.closeFilterPopover();
    };
    document.addEventListener('click', this.documentClickListener);
  }

  private get isConfigurationValid(): boolean {
    if (!this.card?.configuration) return false;
    const validationResult = this.configFactory.validateConfig(this.card.configuration);
    return validationResult.isValid;
  }

  override ngOnInit() {
    super.ngOnInit();
    this.loadCardTranslations();
    this.loadSavedState();
    this.registerAsDataSource();
    try {
      if (this.card.configuration?.datasource) {
        // Précharger le schéma du formulaire uniquement si on peut ajouter ou modifier
        if (this.canAdd() || this.canUpdate() || this.canDelete()) {
          this.dataService.preloadSchemaDefinitions(this.card.configuration.datasource);
        }

        // S'abonner aux changements d'état
        this.dataService.getState(this.card.configuration.datasource)
          .pipe(takeUntil(this.destroy$))
          .subscribe(state => {
            this.data = state.items;
            this.totalItems = state.total;

            if (state.loading) {
              this.isLoadingData = true;
              if (this.isPageChange) {
                this.loadingStartTime = Date.now();
                this.loading = false;
                this.loadingTimer = setTimeout(() => {
                  if (this.isLoadingData) {
                    this.loading = true;
                    this.cdr.detectChanges();
                  }
                }, 1000);
              } else {
                this.loading = true;
              }
            } else {
              this.isLoadingData = false;
              if (this.loadingTimer) {
                clearTimeout(this.loadingTimer);
                this.loadingTimer = null;
              }
              this.loading = false;
              this.isPageChange = false;
              this.loadingStartTime = 0;
            }

            // Mettre à jour le currentDataSubject avec les nouvelles données
            this.currentDataSubject.next({
              data: this.data,
              total: this.totalItems,
              schema: this.card.configuration?.datasource?.controller?.responseEntityJsonSchema || {},
              filters: {
                globalSearch: this.globalSearch,
                columnSearches: Array.from(this.activeFilters.entries()).map(([key, values]) => ({
                  columnKey: key,
                  values: Array.from(values)
                }))
              },
              sorting: this.sortConfig
            });

            this.cdr.detectChanges();
          });
      } else {
        console.warn('[DataTableCard] Configuration manquante');
      }
    } catch (error) {
      console.error('[DataTableCard] Erreur dans ngOnInit', error);
      this.cdr.detectChanges();
    }
  }

  ngAfterViewInit() {
    if (this.isConfigurationValid) {
      this.isCalculatingRows = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        // Initialiser les largeurs de colonnes si elles ne sont pas déjà définies
        this.initializeColumnWidths();

        // Calculer la taille optimale sans déclencher de rechargement
        this.calculateAndSetOptimalSize();

        // Charger les données une seule fois avec la taille calculée
        if (this.pageSize > 0) {
          const parameters: DataRequestParametersDto = {
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
            globalSearch: this.globalSearch,
            columnSearches: this.getActiveFilters(),
            orderBy: this.sortConfig
          };

          this.dataService.loadData(this.card.configuration!.datasource, parameters);
        }

        this.isCalculatingRows = false;
        this.initialLoadDone = true;
        this.cdr.detectChanges();
      }, 100);
    } else {
      console.warn('[DataTableCard] Configuration invalide dans ngAfterViewInit');
    }
  }

  private initializeColumnWidths() {
    const visibleColumns = this.getVisibleColumns();
    const tableWidth = this.tableContainerRef?.nativeElement?.clientWidth || 0;
    const defaultColumnWidth = Math.max(150, Math.floor(tableWidth / visibleColumns.length));

    visibleColumns.forEach(column => {
      // Ne pas écraser les largeurs déjà définies (chargées depuis le localStorage)
      if (!this.columnWidths.has(column.key)) {
        this.columnWidths.set(column.key, defaultColumnWidth);
      }
    });

    // Sauvegarder l'état initial
    this.saveCurrentState();
  }

  protected override onHeightChange() {
    if (this.height > 0 && this.initialLoadDone) {
      setTimeout(() => {
        this.calculateAndSetOptimalSize();
        this.updateScrollbarVisibility();
      });
    }
  }

  private calculateAndSetOptimalSize() {
    try {
      if (!this.isConfigurationValid) {
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

      // 1. Calculer la hauteur disponible pour les lignes en soustrayant la hauteur du header
      const headerHeight = this.getHeaderHeight();
      const availableHeightForRows = availableHeight - this.TABLE_BORDER - headerHeight;

      // 2. Calculer le nombre de lignes qui peuvent tenir
      const rowTotalSpace = this.ROW_HEIGHT + this.ROW_BORDER + (this.CELL_PADDING * 2); // Hauteur + bordure + padding haut et bas
      const optimalRows = Math.floor(availableHeightForRows / rowTotalSpace);

      // 3. Déterminer le nombre final de lignes avec une ligne de sécurité en moins
      const targetSize = Math.min(optimalRows - 1, this.totalItems || (optimalRows - 1));
      const newPageSize = Math.max(1, targetSize);

      // 4. Calculer la hauteur de ligne ajustée en utilisant le nombre réduit de lignes
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
        }

        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Erreur dans calculateAndSetOptimalSize:', error);
      this.cdr.detectChanges();
    }
  }

  private getActiveFilters(): { column: string, value: string }[] {
    return Array.from(this.activeFilters.entries()).flatMap(([column, values]) =>
      Array.from(values).map(value => ({
        column,
        value
      }))
    );
  }

  private loadData(): void {
    if (!this.isConfigurationValid) return;

    const parameters: DataRequestParametersDto = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      globalSearch: this.globalSearch,
      columnSearches: this.getActiveFilters(),
      orderBy: this.sortConfig
    };

    this.dataService.loadData(this.card.configuration!.datasource, parameters);
    this.cdr.detectChanges();
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

  private updateColumnWidths() {
    if (!this.tableContainerRef?.nativeElement) {
      return;
    }

    const headerCells = this.tableContainerRef.nativeElement.querySelectorAll('thead th');

    let totalWidth = 0;
    let fixedLeftWidth = 0;
    let fixedRightWidth = 0;

    // Update actions column width if it exists
    const actionsCell = Array.from(headerCells).find(cell => (cell as HTMLElement).classList.contains('actions-column'));
    if (actionsCell) {
      this.actionsColumnWidth = (actionsCell as HTMLElement).offsetWidth;
      fixedRightWidth += this.actionsColumnWidth;
    }

    // Calculer les largeurs des colonnes fixes
    this.getVisibleColumns().forEach((column, index) => {
      const width = this.columnWidths.get(column.key) || 0;
      if (column.isFixed) {
        fixedLeftWidth += width;
      } else if (column.isFixedRight) {
        fixedRightWidth += width;
      }
    });

    // Mettre à jour les styles CSS pour le conteneur de table
    const containerWidth = this.tableContainerRef.nativeElement.clientWidth;
    const scrollableWidth = containerWidth - fixedLeftWidth - fixedRightWidth;

    // Ajuster la largeur totale de la table si nécessaire
    let contentWidth = Array.from(this.columnWidths.values()).reduce((sum, width) => sum + width, 0);
    this.tableWidth = Math.max(contentWidth, containerWidth);

    this.updateScrollbarVisibility();
    this.cdr.detectChanges();
  }

  getFixedColumnRight(column: ColumnConfig): string | null {
    if (!column.isFixedRight) return null;

    let right = 0;
    const visibleColumns = this.getVisibleColumns();

    // If we have actions, add their width to the initial right position
    if (this.hasActions()) {
      right += this.actionsColumnWidth;
    }

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
    if (page === this.currentPage) {
      return;
    }
    // Réinitialiser l'état du loader
    this.loading = false;
    this.isPageChange = true;
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
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
    }
    this.unregisterAsDataSource();
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
      this.calculateAndSetOptimalSize();
      this.updateColumnWidths();
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
    event.stopPropagation();
    event.preventDefault();

    if (this.activeFilterPopover?.column === column) {
      this.closeFilterPopover();
      return;
    }

    this.closeFilterPopover();
    this.activeFilterPopover = { column, element: button };

    // Charger les valeurs uniques si pas déjà fait
    if (!this.columnValues.has(column.key)) {
      this.loadUniqueValues(column);
    }

    // Forcer la détection de changements
    this.cdr.detectChanges();
  }

  closeFilterPopover() {
    this.activeFilterPopover = null;
    this.cdr.detectChanges();
  }

  // Charger les valeurs uniques pour une colonne
  private loadUniqueValues(column: ColumnConfig) {
    if (!this.card.configuration?.datasource) {
      return;
    }

    this.dataService.getColumnValues(this.card.configuration.datasource, column.key)
      .subscribe({
        next: (values) => {
          this.columnValues.set(column.key, values);
          // Forcer la détection de changements après avoir mis à jour les valeurs
          setTimeout(() => {
            this.cdr.detectChanges();
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
          this.columnValues.set(column.key, Array.from(localValues).sort());
          // Forcer la détection de changements après avoir mis à jour les valeurs
          setTimeout(() => {
            this.cdr.detectChanges();
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
    this.saveCurrentState();
  }

  // Méthode pour vérifier si une colonne a des filtres actifs
  hasActiveFilter(column: ColumnConfig): boolean {
    return this.activeFilters.has(column.key);
  }

  // Méthode pour obtenir l'index de tri d'une colonne (-1 si non triée)
  getSortIndex(column: ColumnConfig): number {
    return this.sortConfig.findIndex(sort => sort.column === column.key);
  }

  // Méthode pour obtenir la direction de tri d'une colonne
  getSortDirection(column: ColumnConfig): boolean | undefined {
    const sortItem = this.sortConfig.find(sort => sort.column === column.key);
    return sortItem?.isDescending;
  }

  // Méthode pour gérer le tri
  toggleSort(event: MouseEvent, column: ColumnConfig) {
    event.stopPropagation();

    const currentIndex = this.getSortIndex(column);
    const isShiftPressed = event.shiftKey;

    let newSortConfig: OrderByParameterDto[] = [];

    if (!isShiftPressed) {
      // Sans Shift : gestion d'une seule colonne
      if (currentIndex === -1) {
        // Nouveau tri ascendant
        newSortConfig = [{
          column: column.key,
          isDescending: false
        }];
      } else {
        const currentSort = this.sortConfig[currentIndex];
        if (!currentSort.isDescending) {
          // Passer en descendant
          newSortConfig = [{
            column: column.key,
            isDescending: true
          }];
        }
        // Si c'était déjà descendant, on laisse newSortConfig vide (pas de tri)
      }
    } else {
      // Avec Shift : tri multiple
      newSortConfig = [...this.sortConfig]; // Copie de la configuration existante
      if (currentIndex === -1) {
        // Ajouter un nouveau tri
        newSortConfig.push({
          column: column.key,
          isDescending: false
        });
      } else {
        const currentSort = newSortConfig[currentIndex];
        if (!currentSort.isDescending) {
          // Passer en descendant
          newSortConfig[currentIndex] = {
            ...currentSort,
            isDescending: true
          };
        } else {
          // Supprimer le tri
          newSortConfig.splice(currentIndex, 1);
        }
      }
    }

    // Assigner la nouvelle configuration et recharger
    this.sortConfig = newSortConfig;
    this.loadData();
    this.saveCurrentState();
  }

  // Méthodes pour vérifier les permissions CRUD
  canAdd(): boolean {
    return this.card.configuration?.crudConfig?.canAdd && this.isConfigurationValid;
  }

  canUpdate(): boolean {
    return this.card.configuration?.crudConfig?.canUpdate && this.isConfigurationValid;
  }

  canDelete(): boolean {
    return this.card.configuration?.crudConfig?.canDelete && this.isConfigurationValid;
  }

  hasActions(): boolean {
    return this.canUpdate() || this.canDelete();
  }

  // Modifier la méthode onAdd
  onAdd(): void {

    if (!this.card.configuration?.datasource) {
      console.error('[DataTableCard] Configuration datasource manquante');
      return;
    }

    // Vider les caches
    this.dataService.clearSchemaDefinitions(this.card.configuration.datasource);
    this.tableStateService.clearState(this.card.id.toString(), this.card.configuration.datasource);
    this.foreignKeyService.clearCache();

    this.isFormLoading = true;
    this.showAddForm = true;
    this.modalConfig = {
      titleKey: 'data-table-card.ADD.TITLE',
      showFullscreenButton: true
    };
    this.cdr.detectChanges();

    // Extraire le nom du contrôleur de la route
    const controllerName = this.card.configuration.datasource.controller.route.split('/').pop() || '';

    this.dataService.getReadActionParameterDefinition({
      ...this.card.configuration.datasource,
      controller: {
        ...this.card.configuration.datasource.controller,
        name: controllerName
      }
    })
      .pipe(
        tap(params => {}),
        catchError(error => {
          this.isFormLoading = false;
          this.showAddForm = false;
          this.cdr.detectChanges();
          return EMPTY;
        })
      )
      .subscribe({
        next: (parameters: DBConnectionEndpointRequestInfoDto[]) => {
          if (parameters.length === 1) {
            try {
              this.addFormSchema = JSON.parse(parameters[0].jsonSchema);

              // Charger les données des clés étrangères
              this.loadForeignKeyData().subscribe(() => {
                this.isFormLoading = false;
                this.cdr.detectChanges();
              });
            } catch (error) {
              this.isFormLoading = false;
              this.showAddForm = false;
              this.cdr.detectChanges();
            }
          } else {
            this.isFormLoading = false;
            this.showAddForm = false;
            this.cdr.detectChanges();
          }
        }
      });
  }

  isFormFullscreen = false;

  onFormFullscreenChange(isFullscreen: boolean) {
    this.isFormFullscreen = isFullscreen;
    const formElement = document.querySelector('app-dynamic-form') as HTMLElement;
    if (formElement) {
      if (this.isFormFullscreen) {
        formElement.classList.add('fixed', 'inset-0', 'z-50', 'p-4');
      } else {
        formElement.classList.remove('fixed', 'inset-0', 'z-50', 'p-4');
      }
    }
    this.cdr.detectChanges();
  }

  private loadForeignKeyData(): Observable<unknown> {
    if (!this.addFormSchema?.properties) return of(void 0);

    // Réinitialiser les données
    this.addFormForeignKeyData = {};
    this.addFormForeignKeyConfigs = {};

    // Configurer le service de clés étrangères
    this.foreignKeyService.setConfig(this.card.configuration);

    // Collecter toutes les observables de clés étrangères
    const foreignKeyObservables = Object.entries(this.addFormSchema.properties)
      .filter(([key, prop]: [string, any]) => {
        const metadata = prop['x-entity-metadata'];
        return metadata?.isForeignKey && metadata.foreignKeyTable;
      })
      .map(([key, prop]: [string, any]) => {
        const metadata = prop['x-entity-metadata'];
        const tableName = metadata.foreignKeyTable;

        // Ajouter la configuration d'affichage si elle existe
        if (this.card.configuration?.crudConfig?.foreignKeyConfigs?.[tableName]) {
          this.addFormForeignKeyConfigs[tableName] = this.card.configuration.crudConfig.foreignKeyConfigs[tableName];
        }

        // Utiliser le service de clés étrangères pour récupérer les options
        return from(this.foreignKeyService.getForeignKeyOptions(
          tableName,
          metadata.foreignKeyColumn,
          this.addFormForeignKeyConfigs[tableName]
        )).pipe(
          map(options => {
            this.addFormForeignKeyData[tableName] = options.map(opt => opt.details);
            this.cdr.detectChanges();
            return tableName;
          })
        );
      });

    // Attendre que toutes les données soient chargées
    return foreignKeyObservables.length > 0 ?
      forkJoin(foreignKeyObservables) :
      of([]);
  }

  onFormSubmit(formData: FormDataSubmit) {
    if (this.isEditMode) {
      const primaryKeyValue = this.dataService.getPrimaryKeyValue(this.currentEditingRow, this.addFormSchema);
      if (primaryKeyValue) {
        const formDataWithId: FormDataSubmitWithId = {
          ...formData,
          id: primaryKeyValue
        };

        this.dataService.updateData(this.card.configuration.datasource!, formDataWithId).subscribe({
          next: (response) => {
            this.loadData();
            this.resetForm();
          },
          error: (error) => {
            console.error('[DataTableCard] Erreur lors de la mise à jour', error);
            // Gérer l'erreur et mettre à jour l'UI
            this.cdr.detectChanges();
          }
        });
      }
    } else {
      this.dataService.createData(this.card.configuration.datasource!, formData).subscribe({
        next: (response) => {
          this.loadData();
          this.resetForm();
        },
        error: (error) => {
          console.error('[DataTableCard] Erreur lors de la création', error);
          // Gérer l'erreur et mettre à jour l'UI
          this.cdr.detectChanges();
        }
      });
    }
  }

  onFormCancel() {
    this.showAddForm = false;
    this.isEditMode = false;
    this.addFormSchema = null;
    this.currentEditingRow = null;
    this.cdr.detectChanges();
  }

  onUpdate(row: any): void {

    // Vider les caches
    this.dataService.clearSchemaDefinitions(this.card.configuration.datasource);
    this.tableStateService.clearState(this.card.id.toString(), this.card.configuration.datasource);
    this.foreignKeyService.clearCache();

    this.isFormLoading = true;
    this.showAddForm = true;
    this.modalConfig = {
      titleKey: 'data-table-card.EDIT.TITLE',
      showFullscreenButton: true
    };
    this.cdr.detectChanges();

    // Extraire le nom du contrôleur de la route
    const controllerName = this.card.configuration.datasource.controller.route.split('/').pop() || '';

    // 1. Charger le schéma
    this.dataService.getReadActionParameterDefinition({
      ...this.card.configuration.datasource,
      controller: {
        ...this.card.configuration.datasource.controller,
        name: controllerName
      }
    }).subscribe({
      next: (parameters) => {
        if (parameters.length === 0) {
          console.warn('[DataTableCard] Nombre de paramètres invalide:', parameters.length);
          this.isFormLoading = false;
          this.cdr.detectChanges();
          return;
        }

        try {
          const schema = JSON.parse(parameters[0].jsonSchema);
          const id = this.dataService.getPrimaryKeyValue(row, schema);

          // 2. Charger l'entité
          this.datasourceService.fetchEntityById(this.card.configuration.datasource, id).subscribe({
            next: (entity) => {
              this.currentEditingRow = entity;
              this.addFormSchema = schema;
              this.formData = entity;
              this.isEditMode = true;

              // 3. Charger les données des clés étrangères
              this.loadForeignKeyData().subscribe(() => {
                this.isFormLoading = false;
                this.cdr.detectChanges();
              });
            },
            error: (error) => {
              console.error('[DataTableCard] Erreur lors de la récupération de l\'entité:', error);
              this.isFormLoading = false;
              this.cdr.detectChanges();
            }
          });
        } catch (error) {
          console.error('[DataTableCard] Erreur lors du parsing du schéma:', error);
          this.isFormLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('[DataTableCard] Erreur lors de la récupération des paramètres:', error);
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDeleteRow(row: any): void {
    this.rowToDelete = row;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    this.dataService.getReadActionParameterDefinition(this.card.configuration.datasource)
      .subscribe({
        next: (parameters: DBConnectionEndpointRequestInfoDto[]) => {
          if (parameters.length > 0) {
            const schema = JSON.parse(parameters[0].jsonSchema);
            const primaryKeyValue = this.dataService.getPrimaryKeyValue(this.rowToDelete, schema);

            if (primaryKeyValue) {
              this.dataService.deleteData(this.card.configuration.datasource!, primaryKeyValue).subscribe({
                next: () => {
                  this.loadData();
                  this.rowToDelete = null;
                  this.showDeleteConfirmation = false;
                  this.cdr.detectChanges();
                },
                error: (error) => {
                  console.error('[DataTableCard] Erreur lors de la suppression:', error);
                  this.showDeleteConfirmation = false;
                  this.cdr.detectChanges();
                }
              });
            }
          }
        },
        error: (error: any) => {
          console.error('[DataTableCard] Erreur lors du chargement du schéma:', error);
          this.showDeleteConfirmation = false;
          this.cdr.detectChanges();
        }
      });
  }

  onCancelDelete() : void {
    this.showDeleteConfirmation = false;
  }

  convertToCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  resetForm() {
    this.isEditMode = false;
    this.currentEditingRow = null;
    this.showAddForm = false;
    this.isFormLoading = false;
    this.addFormSchema = null;
    this.cdr.detectChanges();
  }

  private loadSavedState() {
    if (this.card.configuration?.datasource) {
      const savedState = this.tableStateService.loadState(this.card.id.toString(), this.card.configuration.datasource);
      if (savedState) {
        // Restaurer les largeurs des colonnes
        if (savedState.columnWidths) {
          Object.entries(savedState.columnWidths).forEach(([key, width]) => {
            this.columnWidths.set(key, width);
          });
        }

        // Restaurer les filtres
        if (savedState.filters) {
          Object.entries(savedState.filters).forEach(([key, values]) => {
            this.activeFilters.set(key, new Set(values));
          });
        }

        // Restaurer le tri
        if (savedState.sorting) {
          this.sortConfig = savedState.sorting;
        }
      }
    }
  }

  private saveCurrentState() {
    if (this.card.configuration?.datasource) {
      const state = {
        columnWidths: Object.fromEntries(this.columnWidths),
        filters: Object.fromEntries(
          Array.from(this.activeFilters.entries()).map(([key, values]) => [key, Array.from(values)])
        ),
        sorting: this.sortConfig
      };
      this.tableStateService.saveState(this.card.id.toString(), this.card.configuration.datasource, state);
    }
  }

  onResizeStart(event: MouseEvent, column: ColumnConfig) {
    event.preventDefault();
    this.resizing = true;
    this.currentResizeColumn = column;
    this.startX = event.pageX;
    this.startWidth = this.columnWidths.get(column.key) || 0;

    // Créer le guide de redimensionnement
    this.resizeGuide = this.renderer.createElement('div');
    this.renderer.addClass(this.resizeGuide, 'column-resize-guide');
    this.renderer.setStyle(this.resizeGuide, 'left', this.px(event.pageX));
    this.renderer.appendChild(document.body, this.resizeGuide);

    // Ajouter la classe resizing au body
    this.renderer.addClass(document.body, 'resizing');

    // Ajouter les écouteurs d'événements
    const mouseMoveHandler = (e: MouseEvent) => this.onResizeMove(e);
    const mouseUpHandler = (e: MouseEvent) => {
      this.onResizeEnd(e);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  private onResizeMove(event: MouseEvent) {
    if (!this.resizing || !this.currentResizeColumn || !this.resizeGuide) {
      return;
    }

    // Uniquement déplacer le guide visuel
    this.renderer.setStyle(this.resizeGuide, 'left', this.px(event.pageX));
  }

  private onResizeEnd(event: MouseEvent) {
    if (!this.resizing || !this.currentResizeColumn) return;

    // Calculer et appliquer la nouvelle largeur seulement à la fin du redimensionnement
    const deltaX = event.pageX - this.startX;
    const newWidth = Math.max(50, this.startWidth + deltaX);

    // Mettre à jour la largeur de la colonne
    this.columnWidths.set(this.currentResizeColumn.key, newWidth);

    // Mettre à jour la largeur totale de la table et la scrollbar
    this.updateColumnWidths();

    // Sauvegarder l'état
    this.saveCurrentState();

    // Nettoyer
    if (this.resizeGuide) {
      this.renderer.removeChild(document.body, this.resizeGuide);
      this.resizeGuide = null;
    }
    this.renderer.removeClass(document.body, 'resizing');
    this.resizing = false;
    this.currentResizeColumn = null;
    this.cdr.detectChanges();
  }

  // Ajouter ces nouvelles méthodes
  onHeaderMouseEnter(column: ColumnConfig) {
  }

  onHeaderMouseLeave(column: ColumnConfig) {
  }

  private registerAsDataSource(): void {
    if (!this.card?.id) return;

    // Construire le schéma à partir des colonnes configurées
    const schema = {
      type: 'object',
      properties: this.card.configuration?.columns?.reduce((acc: Record<string, any>, column: { key: string; type?: string; title?: string; description?: string }) => {
        acc[column.key] = {
          type: column.type || 'string',
          title: column.title || column.key,
          description: column.description
        };
        return acc;
      }, {} as Record<string, any>) || {}
    };

    console.log('[DataTableCard] Registering with schema:', schema);

    const tableInfo = {
      cardId: this.card.id,
      title: this.card.title,
      schema: schema,
      currentData$: this.currentDataSubject.asObservable()
    };
    if (this.card.id > 0) {
      this.localDataSourceService.registerDataTable(tableInfo);
    }
  }

  private unregisterAsDataSource(): void {
    if (this.card?.id) {
      this.localDataSourceService.unregisterDataTable(this.card.id);
    }
  }

  private validateDatasourceConfig(config: DatasourceConfig): boolean {
    if (config.type === 'LocalDataTable') {
      // Vérifier que la table n'utilise pas ses propres données
      if (config.localDataTable?.cardId === this.card.id) {
        console.error('Une table ne peut pas utiliser ses propres données comme source');
        return false;
      }

      // Vérifier que la table source existe
      if (config.localDataTable?.cardId && !this.localDataSourceService.isTableAvailable(config.localDataTable.cardId)) {
        console.error('La table source n\'est pas disponible');
        return false;
      }
    }
    return true;
  }

  onDatasourceConfigChange(config: DatasourceConfig) {
    if (!this.validateDatasourceConfig(config)) {
      if (this.previousConfig) {
        this.card.configuration.datasource = { ...this.previousConfig };
      }
      return;
    }

    this.previousConfig = { ...this.card.configuration.datasource };
    this.card.configuration.datasource = config;
    this.configurationChanged.emit(this.card.configuration);
    this.loadData();
  }
}
