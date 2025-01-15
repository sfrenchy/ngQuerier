import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDto, BaseCardConfig } from '@models/api.models';
import { uintToHex } from '../shared/utils/color.utils';

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

  get backgroundColor(): string {
    return uintToHex(this.card.backgroundColor);
  }

  get textColor(): string {
    return uintToHex(this.card.textColor);
  }

  get headerTextColor(): string {
    return uintToHex(this.card.headerTextColor);
  }

  get headerBackgroundColor(): string {
    return uintToHex(this.card.headerBackgroundColor);
  }

  onConfigure() {
    this.configure.emit();
  }

  onDelete() {
    this.delete.emit();
  }
} 