import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { RowDto, CardDto } from '@models/api.models';
import { BaseCardComponent } from './cards/base-card.component';
import { Type } from '@angular/core';

@Component({
  selector: 'app-droppable-row',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: "./droppable-row.component.html"
})
export class DroppableRowComponent {
  @Input() row!: RowDto;
  @Input() cardToolbox!: CdkDropList;
  @Input() getCardComponent!: (type: string) => Type<BaseCardComponent> | null;

  @Output() deleteRow = new EventEmitter<number>();
  @Output() startResize = new EventEmitter<{event: MouseEvent, rowId: number}>();
  @Output() cardDropped = new EventEmitter<{event: CdkDragDrop<CardDto[]>, row: RowDto}>();
  @Output() configureCard = new EventEmitter<CardDto>();
  @Output() deleteCard = new EventEmitter<{rowId: number, card: CardDto}>();

  onCardDrop(event: CdkDragDrop<CardDto[]>) {
    this.cardDropped.emit({event, row: this.row});
  }

  onConfigureCard(card: CardDto) {
    this.configureCard.emit(card);
  }

  onDeleteCard(rowId: number, card: CardDto) {
    this.deleteCard.emit({rowId, card});
  }
} 