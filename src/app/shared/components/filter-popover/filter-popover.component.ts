import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseParameterPopover } from '../base-parameter-popover/base-parameter-popover.component';
import { ColumnSearchDto } from '@models/api.models';
import { StoredProcedureParameter } from '@models/parameters.models';

export interface FilterPopoverData {
  column: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  currentValue?: string;
  displayName: string;
  description: string;
  position?: 'above' | 'below';
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
  @Output() filterChange = new EventEmitter<ColumnSearchDto>();

  constructor() {
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

    this.filterChange.emit({
      column: this.data.column,
      value: this.parameter.value || ''
    });
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
  }
} 