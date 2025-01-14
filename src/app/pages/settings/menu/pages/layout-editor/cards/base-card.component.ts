import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDto, BaseCardConfig } from '@models/api.models';

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class BaseCardComponent<T extends BaseCardConfig> {
  @Input() card!: CardDto<T>;
  @Input() isEditing = false;
  @Output() configure = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onConfigure() {
    this.configure.emit();
  }

  onDelete() {
    this.delete.emit();
  }
} 