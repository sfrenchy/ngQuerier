import { Component, Input, Output, EventEmitter, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDto } from '@models/api.models';

@Directive()
export abstract class BaseCardComponent {
  @Input() card!: CardDto;
  @Input() isEditing = false;
  @Input() maxRowHeight?: number;
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();

  // Optional header/footer methods to be overridden by child classes
  protected buildHeader(): boolean {
    return false;
  }

  protected buildFooter(): boolean {
    return false;
  }

  // Abstract method that must be implemented by child classes
  abstract buildCardContent(): any;

  protected getLocalizedTitle(languageCode: string): string {
    return this.card.configuration.titles[languageCode] || this.card.configuration.titles['en'] || '';
  }
} 