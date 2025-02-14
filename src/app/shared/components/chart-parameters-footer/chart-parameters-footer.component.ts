import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DatasourceConfig} from '@models/datasource.models';
import {StoredProcedureParameter} from '@models/parameters.models';
import {ColumnSearchDto, DataRequestParametersDto, OrderByParameterDto} from '@models/api.models';
import {FilterPopoverComponent, FilterPopoverData} from '../filter-popover/filter-popover.component';
import {SortPopoverComponent, SortPopoverData} from '../sort-popover/sort-popover.component';
import {ParameterPopoverComponent} from '../parameter-popover/parameter-popover.component';
import {RequestParametersService} from '../../services/request-parameters.service';

interface ParameterPopoverData {
  parameter: StoredProcedureParameter;
}

interface ColumnMetadata {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  columnName: string;
}

@Component({
  selector: 'app-chart-parameters-footer',
  templateUrl: './chart-parameters-footer.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FilterPopoverComponent,
    SortPopoverComponent,
    ParameterPopoverComponent
  ]
})
export class ChartParametersFooterComponent implements OnChanges, OnDestroy, OnInit {
  @Input() datasource!: DatasourceConfig;
  @Input() parameters: DataRequestParametersDto = {
    pageNumber: 1,
    pageSize: 1000,
    orderBy: [],
    globalSearch: '',
    columnSearches: []
  };
  @Input() storedProcedureParameters: StoredProcedureParameter[] = [];
  @Input() lastUpdate?: Date;
  @Input() autoRefreshInterval?: number;
  @Input() cardId!: number;

  @Output() parametersChange = new EventEmitter<DataRequestParametersDto>();
  @Output() storedProcedureParametersChange = new EventEmitter<StoredProcedureParameter[]>();
  @Output() refresh = new EventEmitter<void>();

  // Popovers de filtres et tris
  activeFilterPopover: {
    data: FilterPopoverData;
  } | null = null;

  activeSortPopover: {
    data: SortPopoverData;
  } | null = null;

  activeParameterPopover?: {
    data: ParameterPopoverData;
  };

  selectedParameter?: StoredProcedureParameter;
  private _activeParameters: StoredProcedureParameter[] = [];
  private _availableColumns: ColumnMetadata[] = [];

  dateFormat: string = 'short';
  private destroy$ = new Subject<void>();

  constructor(
    private elementRef: ElementRef,
    private requestParametersService: RequestParametersService,
    private translateService: TranslateService
  ) {
    // Gestionnaire de clic global pour fermer les popovers
    document.addEventListener('click', this.handleDocumentClick);

    // S'abonner aux changements de langue
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateDateFormat();
      });
  }

  ngOnInit() {
    this.updateDateFormat();
  }

  ngOnChanges(changes: SimpleChanges): void {

    // Sauvegarder le paramètre sélectionné actuel
    const currentSelectedParameter = this.selectedParameter;

    // Charger les paramètres sauvegardés si disponibles
    if ((changes['cardId'] || changes['storedProcedureParameters']?.firstChange) && this.cardId) {
      const savedParams = this.requestParametersService.loadFromLocalStorage(this.cardId);
      if (savedParams?.procedureParameters && this.storedProcedureParameters.length > 0) {
        let hasChanges = false;
        const updatedParameters = this.storedProcedureParameters.map(param => {
          const savedParam = savedParams.procedureParameters?.[param.name];
          if (savedParam && (savedParam.value !== param.value || savedParam.dateType !== param.dateType)) {
            hasChanges = true;
            return {
              ...param,
              value: savedParam.value,
              dateType: savedParam.dateType
            };
          }
          return param;
        });

        if (hasChanges) {
          // Mettre à jour la propriété locale
          this.storedProcedureParameters = updatedParameters;
          this._activeParameters = updatedParameters.filter(p => p.userChangeAllowed);
          // Émettre les paramètres mis à jour
          this.storedProcedureParametersChange.emit(updatedParameters);
        }

        // Mettre à jour les paramètres de requête
        this.parameters = savedParams;
      }
    }

    // Mettre à jour les paramètres actifs si les storedProcedureParameters changent
    if (changes['storedProcedureParameters']) {
      this._activeParameters = this.storedProcedureParameters.filter(p => p.userChangeAllowed);

      // Si nous avons un paramètre sélectionné, le mettre à jour avec la nouvelle version
      if (currentSelectedParameter) {
        const updatedParameter = this.storedProcedureParameters.find(
          p => p.name === currentSelectedParameter.name
        );
        if (updatedParameter && JSON.stringify(updatedParameter) !== JSON.stringify(currentSelectedParameter)) {
          this.selectedParameter = updatedParameter;
        } else if (!updatedParameter) {
          // Si le paramètre n'existe plus dans la liste, le désélectionner
          this.selectedParameter = undefined;
        }
      }
    }

    if (changes['datasource']) {
      this._availableColumns = this.getAvailableColumns();
    }
  }

  ngOnDestroy(): void {
    // Nettoyage du gestionnaire de clic
    document.removeEventListener('click', this.handleDocumentClick);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInsidePopover = this.elementRef.nativeElement.contains(target);

    if (!isInsidePopover) {
      this.activeFilterPopover = null;
      this.activeSortPopover = null;
      this.activeParameterPopover = undefined;
    }
  };

  get isStoredProcedure(): boolean {
    return this.datasource?.isStoredProcedure === true;
  }

  get activeParameters(): StoredProcedureParameter[] {
    return this._activeParameters;
  }

  // Méthodes pour les paramètres de procédure stockée
  openPopover(parameter: StoredProcedureParameter, event: MouseEvent): void {
    event.stopPropagation(); // Empêcher la propagation de l'événement

    // Si le paramètre est déjà sélectionné, on le désélectionne
    if (this.selectedParameter?.name === parameter.name) {
      this.selectedParameter = undefined;
      return;
    }

    this.selectedParameter = parameter;
    this.activeFilterPopover = null;
    this.activeSortPopover = null;
  }

  closePopover(): void {
    this.selectedParameter = undefined;
  }

  onParameterChange(updatedParameter: StoredProcedureParameter): void {
    const updatedParameters = this.storedProcedureParameters.map(p =>
      p.name === updatedParameter.name ? updatedParameter : p
    );
    // Mettre à jour la propriété locale
    this.storedProcedureParameters = updatedParameters;
    // Émettre l'événement
    this.storedProcedureParametersChange.emit(updatedParameters);
  }

  formatValue(parameter: StoredProcedureParameter): string {
    if (parameter.type === 'date') {
      if (parameter.dateType && parameter.dateType !== 'specific') {
        return parameter.dateType;
      }
      return parameter.value ? new Date(parameter.value).toLocaleDateString() : '';
    }
    if (parameter.type === 'boolean') {
      return parameter.value ? '✓' : '✗';
    }
    return parameter.value?.toString() || '';
  }

  // Méthodes pour les filtres
  openFilterPopover(columnName: string, type: 'string' | 'number' | 'boolean' | 'date', event: MouseEvent): void {
    event.stopPropagation();
    this.activeSortPopover = null;
    this.activeParameterPopover = undefined;

    // Utiliser la première colonne disponible
    const column = this.availableColumns[0];
    if (!column) return;  // Protection si pas de colonnes disponibles

    this.activeFilterPopover = {
      data: {
        column: column.name,
        type: column.type,
        displayName: column.name,
        description: `Filter by ${column.name}`,
        availableColumns: this.availableColumns.map(col => ({
          name: col.name,
          type: col.type,
          displayName: col.name
        })),
        datasource: this.datasource
      },
    };
  }

  onFilterPopoverShown(): void {
    this.activeSortPopover = null;
    this.activeParameterPopover = undefined;
  }

  onFilterChange(searches: ColumnSearchDto[]): void {
    // Supprimer les filtres existants pour cette colonne
    const columnSearches = this.parameters.columnSearches.filter(
      s => searches.length === 0 || s.column !== searches[0]?.column
    );

    // Ajouter les nouvelles recherches
    columnSearches.push(...searches);

    const updatedParams = {
      ...this.parameters,
      columnSearches
    };
    this.parametersChange.emit(updatedParams);
    if (this.cardId) {
      this.requestParametersService.saveToLocalStorage(this.cardId, updatedParams);
    }
  }

  removeFilter(column: string): void {
    const updatedParams = {
      ...this.parameters,
      columnSearches: this.parameters.columnSearches.filter(s => s.column !== column)
    };
    this.parametersChange.emit(updatedParams);
    if (this.cardId) {
      this.requestParametersService.saveToLocalStorage(this.cardId, updatedParams);
    }
  }

  // Méthodes pour les tris
  openSortPopover(columnName: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeFilterPopover = null;
    this.activeParameterPopover = undefined;

    this.activeSortPopover = {
      data: {
        column: columnName,
        displayName: columnName,
        description: `Sort by ${columnName}`,
        availableColumns: this.availableColumns.map(col => ({
          name: col.name,
          type: col.type,
          displayName: col.name
        }))
      },
    };
  }

  onSortPopoverShown(): void {
    this.activeFilterPopover = null;
    this.activeParameterPopover = undefined;
  }

  onSortChange(order: OrderByParameterDto): void {
    const updatedParams = {
      ...this.parameters,
      orderBy: [order]
    };
    this.parametersChange.emit(updatedParams);
    if (this.cardId) {
      this.requestParametersService.saveToLocalStorage(this.cardId, updatedParams);
    }
  }

  removeSort(column: string): void {
    const updatedParams = {
      ...this.parameters,
      orderBy: this.parameters.orderBy.filter(o => o.column !== column)
    };
    this.parametersChange.emit(updatedParams);
    if (this.cardId) {
      this.requestParametersService.saveToLocalStorage(this.cardId, updatedParams);
    }
  }

  // Méthode commune de rafraîchissement
  onRefresh(): void {
    this.refresh.emit();
  }

  // Méthodes pour les popovers
  getScrollY(): number {
    return window.scrollY || document.documentElement.scrollTop;
  }

  get availableColumns(): ColumnMetadata[] {
    return this._availableColumns;
  }

  private getAvailableColumns(): ColumnMetadata[] {
    if (!this.datasource?.controller?.responseEntityJsonSchema) {
      return [];
    }

    try {
      const schema = JSON.parse(this.datasource.controller.responseEntityJsonSchema);
      const columns: ColumnMetadata[] = [];

      for (const [name, def] of Object.entries<any>(schema.properties)) {
        columns.push({
          name,
          type: this.mapJsonSchemaType(def.type),
          required: schema.required?.includes(name) ?? false,
          columnName: def['x-entity-metadata']?.columnName ?? name
        });
      }

      return columns;
    } catch (error) {
      console.error('[ChartParametersFooter] Error parsing schema:', error);
      return [];
    }
  }

  private mapJsonSchemaType(jsonType: string): 'string' | 'number' | 'boolean' | 'date' {
    switch (jsonType) {
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'string':
        // TODO: Détecter les dates basées sur le format ou x-entity-metadata
        return 'string';
      default:
        return 'string';
    }
  }

  // Méthodes pour les filtres
  getGroupedFilters(): { column: string, values: string[] }[] {
    const groupedFilters = new Map<string, string[]>();

    for (const search of this.parameters.columnSearches) {
      if (!groupedFilters.has(search.column)) {
        groupedFilters.set(search.column, []);
      }
      groupedFilters.get(search.column)!.push(search.value);
    }

    return Array.from(groupedFilters.entries()).map(([column, values]) => ({
      column,
      values
    }));
  }

  toggleSortDirection(order: OrderByParameterDto): void {
    const updatedParams = {
      ...this.parameters,
      orderBy: [{
        ...order,
        isDescending: !order.isDescending
      }]
    };
    this.parametersChange.emit(updatedParams);
    if (this.cardId) {
      this.requestParametersService.saveToLocalStorage(this.cardId, updatedParams);
    }
  }

  private updateDateFormat() {
    // Format de date en fonction de la langue
    switch (this.translateService.currentLang) {
      case 'fr':
        this.dateFormat = 'dd/MM/y HH:mm';
        break;
      case 'en':
        this.dateFormat = 'M/d/y h:mm a';
        break;
      default:
        this.dateFormat = 'short';
    }
  }
}
