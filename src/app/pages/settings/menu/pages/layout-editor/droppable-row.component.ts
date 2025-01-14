import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RowDto, CardDto } from '@models/api.models';
import { BaseCardComponent } from './cards/base-card.component';
import { Type } from '@angular/core';
import { CardType } from './cards/card.service';
import { CardConfigDialogComponent } from './cards/card-config-dialog.component';

@Component({
  selector: 'app-droppable-row',
  standalone: true,
  imports: [
    CommonModule,
    CardConfigDialogComponent
  ],
  templateUrl: "./droppable-row.component.html"
})
export class DroppableRowComponent {
  @Input() row!: RowDto;
  @Input() getCardComponent!: (type: string) => Type<BaseCardComponent> | null;

  @Output() deleteRow = new EventEmitter<number>();
  @Output() startResize = new EventEmitter<{event: MouseEvent, rowId: number}>();
  @Output() cardDropped = new EventEmitter<{event: DragEvent, row: RowDto, availableColumns: number}>();
  @Output() configureCard = new EventEmitter<{rowId: number, card: CardDto}>();
  @Output() deleteCard = new EventEmitter<{rowId: number, card: CardDto}>();

  showConfigDialog = false;
  currentCard: CardDto | null = null;

  isDraggingCard = false;

  get gridStyle() {
    return {
      'grid-template-columns': 'repeat(12, 1fr)',
      'display': 'grid'
    };
  }

  get availableColumns(): number {
    const usedColumns = this.row.cards.reduce((total, card) => total + (card.gridWidth || 4), 0);
    return Math.max(0, 12 - usedColumns);
  }

  onDeleteRow() {
    this.deleteRow.emit(this.row.id);
  }

  onResizeStart(event: MouseEvent) {
    this.startResize.emit({event, rowId: this.row.id});
  }

  onCardDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingCard = false;
    this.cardDropped.emit({ event, row: this.row, availableColumns: this.availableColumns });
  }

  onConfigureCard(card: CardDto) {
    this.currentCard = card;
    this.showConfigDialog = true;
  }

  onConfigSave(updatedCard: CardDto) {
    this.showConfigDialog = false;
    this.configureCard.emit({rowId: this.row.id, card: updatedCard});
  }

  onConfigCancel() {
    this.showConfigDialog = false;
  }

  onDeleteCard(card: CardDto) {
    this.deleteCard.emit({rowId: this.row.id, card});
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.isDraggingCard = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDraggingCard = false;
  }
} 