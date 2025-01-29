import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DatasourceConfig } from '@models/datasource.models';
import { StoredProcedureParameter } from '@models/parameters.models';
import { DataRequestParametersDto, ColumnSearchDto, OrderByParameterDto } from '@models/api.models';
import { FilterPopoverComponent, FilterPopoverData } from '../filter-popover/filter-popover.component';
import { SortPopoverComponent, SortPopoverData } from '../sort-popover/sort-popover.component';
import { ParameterPopoverComponent } from '../parameter-popover/parameter-popover.component';

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
export class ChartParametersFooterComponent implements OnChanges, OnDestroy {
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

  private _availableColumns: ColumnMetadata[] = [];

  constructor(private elementRef: ElementRef) {
    // Gestionnaire de clic global pour fermer les popovers
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const isInsidePopover = this.elementRef.nativeElement.contains(target);
      
      if (!isInsidePopover) {
        this.activeFilterPopover = null;
        this.activeSortPopover = null;
        this.activeParameterPopover = undefined;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('[ChartParametersFooter] Changes detected:', changes);
    if (changes['storedProcedureParameters']) {
      console.log('[ChartParametersFooter] Parameters updated:', this.storedProcedureParameters);
    }
    if (changes['datasource']) {
      console.log('[ChartParametersFooter] Datasource structure:', {
        entity: this.datasource?.entity,
        controller: this.datasource?.controller,
        schema: this.datasource?.controller?.responseEntityJsonSchema
      });
      this._availableColumns = this.getAvailableColumns();
      console.log('[ChartParametersFooter] Available columns:', this._availableColumns);
    }
  }

  ngOnDestroy(): void {
    // Nettoyage du gestionnaire de clic
    document.removeEventListener('click', this.handleDocumentClick);
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
    console.log('[ChartParametersFooter] Active parameters:', this.storedProcedureParameters);
    return this.storedProcedureParameters.filter(p => p.userChangeAllowed);
  }

  // Méthodes pour les paramètres de procédure stockée
  openPopover(parameter: StoredProcedureParameter, event: MouseEvent): void {
    this.selectedParameter = parameter;
  }

  closePopover(): void {
    this.selectedParameter = undefined;
  }

  onParameterChange(updatedParameter: StoredProcedureParameter): void {
    const updatedParameters = this.storedProcedureParameters.map(p => 
      p.name === updatedParameter.name ? updatedParameter : p
    );
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

    this.activeFilterPopover = {
      data: {
        column: columnName,
        type,
        displayName: columnName,
        description: `Filter by ${columnName}`
      },
    };
  }

  onFilterPopoverShown(): void {
    this.activeSortPopover = null;
    this.activeParameterPopover = undefined;
  }

  onFilterChange(search: ColumnSearchDto): void {
    const columnSearches = [...this.parameters.columnSearches];
    const existingIndex = columnSearches.findIndex(s => s.column === search.column);

    if (existingIndex !== -1) {
      columnSearches[existingIndex] = search;
    } else {
      columnSearches.push(search);
    }

    this.parametersChange.emit({
      ...this.parameters,
      columnSearches
    });
  }

  removeFilter(column: string): void {
    this.parametersChange.emit({
      ...this.parameters,
      columnSearches: this.parameters.columnSearches.filter(s => s.column !== column)
    });
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
        description: `Sort by ${columnName}`
      },
    };
  }

  onSortPopoverShown(): void {
    this.activeFilterPopover = null;
    this.activeParameterPopover = undefined;
  }

  onSortChange(order: OrderByParameterDto): void {
    const orderBy = [...this.parameters.orderBy];
    const existingIndex = orderBy.findIndex(o => o.column === order.column);

    if (existingIndex !== -1) {
      orderBy[existingIndex] = order;
    } else {
      orderBy.push(order);
    }

    this.parametersChange.emit({
      ...this.parameters,
      orderBy
    });
  }

  removeSort(column: string): void {
    this.parametersChange.emit({
      ...this.parameters,
      orderBy: this.parameters.orderBy.filter(o => o.column !== column)
    });
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
} 