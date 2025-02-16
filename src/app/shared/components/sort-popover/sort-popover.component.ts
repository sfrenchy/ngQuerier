import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {BaseParameterPopover} from '../base-parameter-popover/base-parameter-popover.component';
import {OrderByParameterDto} from '@models/api.models';

export interface SortPopoverData {
  column: string;
  currentDirection?: boolean;
  displayName?: string;
  description?: string;
  position?: 'above' | 'below';
  availableColumns?: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    displayName: string;
  }>;
}

export interface Position {
  top: number;
  left: number;
}

@Component({
  selector: 'app-sort-popover',
  templateUrl: './sort-popover.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class SortPopoverComponent extends BaseParameterPopover implements OnInit {
  @Input() data!: SortPopoverData;
  @Input() position?: Position;
  @Output() override close = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<OrderByParameterDto>();

  selectedColumn: string = '';

  constructor() {
    super();
    // Initialisation avec des valeurs par défaut
    this.parameter = {
      name: '',
      type: 'boolean',
      value: false,
      userChangeAllowed: true,
      displayName: '',
      description: ''
    };
  }

  onColumnChange(columnName: string): void {
    const column = this.data.availableColumns?.find(col => col.name === columnName);
    if (column && this.localParameter) {
      this.data.column = column.name;
      this.localParameter.name = column.name;
      this.localParameter.displayName = column.displayName;
      this.onValueChange();
    }
  }

  protected override onParameterChange(): void {
    // Pas de traitement spécial nécessaire pour les tris
  }

  protected override onValueChange(): void {
    this.sortChange.emit({
      column: this.data.column,
      isDescending: this.parameter.value === true
    });
  }

  protected override getParameterType(): string {
    return 'boolean';
  }

  ngOnInit() {
    // Mise à jour avec les données du tri
    this.parameter = {
      name: this.data.column,
      type: 'boolean',
      value: this.data.currentDirection || false,
      userChangeAllowed: true,
      displayName: this.data.displayName || this.data.column,
      description: this.data.description || ''
    };
    this.selectedColumn = this.data.column;
    this.localParameter = {...this.parameter};
  }
}
