import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseParameterPopover } from '../base-parameter-popover/base-parameter-popover.component';
import { OrderByParameterDto } from '@models/api.models';
import { StoredProcedureParameter } from '@models/parameters.models';

export interface SortPopoverData {
  column: string;
  currentDirection?: boolean;
  displayName?: string;
  description?: string;
  position?: 'above' | 'below';
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
  }
} 