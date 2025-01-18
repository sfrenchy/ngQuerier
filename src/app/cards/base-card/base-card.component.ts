import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDto } from '@models/api.models';

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class BaseCardComponent<T> {
  @Input() card!: CardDto<T>;
  @Input() isEditing = false;
  @Output() delete = new EventEmitter<void>();
  @Output() configure = new EventEmitter<void>();

  get backgroundColor(): string {
    return '#1F2937'; // bg-gray-800
  }

  get headerBackgroundColor(): string {
    return '#111827'; // bg-gray-900
  }

  get headerTextColor(): string {
    return '#F9FAFB'; // text-gray-50
  }

  get textColor(): string {
    return '#F9FAFB'; // text-gray-50
  }

  onDelete() {
    this.delete.emit();
  }

  onConfigure() {
    this.configure.emit();
  }
} 