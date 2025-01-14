import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RowDto, CardDto } from '@models/api.models';
import { BaseCardComponent } from './cards/base-card.component';
import { Type } from '@angular/core';

@Component({
  selector: 'app-droppable-row',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: "./droppable-row.component.html"
})
export class DroppableRowComponent {
  @Input() row!: RowDto;
  @Input() getCardComponent!: (type: string) => Type<BaseCardComponent> | null;

  @Output() deleteRow = new EventEmitter<number>();
  @Output() startResize = new EventEmitter<{event: MouseEvent, rowId: number}>();
  @Output() cardDropped = new EventEmitter<{event: any, row: RowDto}>();
  @Output() configureCard = new EventEmitter<{rowId: number, card: CardDto}>();
  @Output() deleteCard = new EventEmitter<{rowId: number, card: CardDto}>();

  onCardDrop(event: any) {
    this.cardDropped.emit({event, row: this.row});
  }

  onConfigureCard(card: CardDto) {
    this.configureCard.emit({rowId: this.row.id, card});
  }

  onDeleteCard(rowId: number, card: CardDto) {
    this.deleteCard.emit({rowId, card});
  }
} 