import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseParameterPopover } from '../base-parameter-popover/base-parameter-popover.component';
import { ColumnSearchDto } from '@models/api.models';
import { StoredProcedureParameter } from '@models/parameters.models';
import { DataTableCardService } from '@cards/data-table-card/data-table-card.service';

export interface FilterPopoverData {
  column: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  currentValue?: string;
  displayName: string;
  description: string;
  position?: 'above' | 'below';
  availableColumns?: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    displayName: string;
  }>;
  datasource?: any;
}

export interface Position {
  top: number;
  left: number;
}

@Component({
  selector: 'app-filter-popover',
  templateUrl: './filter-popover.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class FilterPopoverComponent extends BaseParameterPopover implements OnInit {
  @Input() data!: FilterPopoverData;
  @Input() position?: Position;
  @Output() override close = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<ColumnSearchDto[]>();

  availableValues: string[] = [];
  selectedValues = new Set<string>();
  isLoading = false;
  searchTerm = '';

  constructor(private dataService: DataTableCardService) {
    super();
    // Initialisation avec des valeurs par défaut
    this.parameter = {
      name: '',
      type: 'string',
      value: '',
      userChangeAllowed: true,
      displayName: '',
      description: ''
    };
  }

  protected override onParameterChange(): void {
    // Conversion spécifique pour les dates
    if (this.data.type === 'date' && this.parameter.value) {
      const [datePart] = this.parameter.value.split('T');
      this.parameter.value = datePart;
    }
  }

  protected override onValueChange(): void {
    // Conversion spécifique pour les dates
    if (this.data.type === 'date' && this.parameter.value) {
      this.parameter.value = `${this.parameter.value}T00:00`;
    }

    // Émettre une recherche distincte pour chaque valeur sélectionnée
    const values = Array.from(this.selectedValues);
    if (values.length > 0) {
      const searches: ColumnSearchDto[] = values.map(value => ({
        column: this.data.column,
        value: value
      }));
      this.filterChange.emit(searches);
    } else {
      this.filterChange.emit([]);
    }
  }

  protected override getParameterType(): string {
    return this.data.type;
  }

  ngOnInit() {
    // Mise à jour avec les données du filtre
    this.parameter = {
      name: this.data.column,
      type: this.data.type,
      value: this.data.currentValue || '',
      userChangeAllowed: true,
      displayName: this.data.displayName || this.data.column,
      description: this.data.description || ''
    };

    if (this.data.column) {
      this.loadValues();
      
      // Si on a une valeur courante, on l'ajoute aux valeurs sélectionnées
      if (this.data.currentValue) {
        this.selectedValues = new Set(this.data.currentValue.split(','));
      }
    }
  }

  onColumnChange(columnName: string): void {
    const column = this.data.availableColumns?.find(col => col.name === columnName);
    if (column) {
      this.data.column = column.name;
      this.data.type = column.type;
      this.data.displayName = column.displayName;
      
      // Reset the value when changing column
      this.parameter = {
        name: column.name,
        type: column.type,
        value: '',
        userChangeAllowed: true,
        displayName: column.displayName,
        description: this.data.description || ''
      };

      this.selectedValues.clear();
      this.loadValues();
    }
  }

  private loadValues() {
    if (!this.data.datasource || !this.data.column) return;

    this.isLoading = true;
    this.availableValues = [];

    this.dataService.getColumnValues(this.data.datasource, this.data.column)
      .subscribe({
        next: (values) => {
          this.availableValues = values;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('[FilterPopover] Error loading values:', error);
          this.isLoading = false;
        }
      });
  }

  get filteredValues(): string[] {
    if (!this.searchTerm) {
      return this.availableValues;
    }
    const search = this.searchTerm.toLowerCase();
    return this.availableValues.filter(value => 
      value.toString().toLowerCase().includes(search)
    );
  }

  selectAll() {
    this.selectedValues = new Set(this.filteredValues);
  }

  selectNone() {
    this.selectedValues.clear();
  }

  isValueSelected(value: string): boolean {
    return this.selectedValues.has(value);
  }

  toggleValue(value: string) {
    if (this.selectedValues.has(value)) {
      this.selectedValues.delete(value);
    } else {
      this.selectedValues.add(value);
    }
  }

  applyFilter() {
    this.onValueChange();
    this.close.emit();
  }
} 