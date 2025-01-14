import { Component, Input, Output, EventEmitter, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RowDto, CardDto, BaseCardConfig } from '@models/api.models';
import { BaseCardComponent } from './base-card.component';
import { CardWrapperComponent } from './card-wrapper.component';

@Component({
  selector: 'app-droppable-row',
  templateUrl: './droppable-row.component.html',
  standalone: true,
  imports: [CommonModule, CardWrapperComponent]
})
export class DroppableRowComponent {
  @Input() row!: RowDto;
  @Input() getCardComponent!: (type: string) => Type<BaseCardComponent> | null;
  @Output() deleteRow = new EventEmitter<void>();
  @Output() startResize = new EventEmitter<{ event: MouseEvent, rowId: number }>();
  @Output() cardDropped = new EventEmitter<{ event: DragEvent, row: RowDto, availableColumns: number }>();
  @Output() deleteCard = new EventEmitter<{ rowId: number, card: CardDto }>();
  @Output() configureCard = new EventEmitter<{ rowId: number, card: CardDto }>();

  isDraggingCard = false;

  get gridStyle() {
    return {
      'grid-template-columns': 'repeat(12, 1fr)'
    };
  }

  get availableColumns(): number {
    const usedColumns = this.row.cards.reduce((sum, card) => sum + (card.gridWidth || 4), 0);
    return Math.max(0, 12 - usedColumns);
  }

  getDefaultConfig(card: CardDto<any>): BaseCardConfig {
    return card.configuration || {
      toJson: () => ({})
    };
  }

  onDeleteRow() {
    this.deleteRow.emit();
  }

  onResizeStart(event: MouseEvent) {
    this.startResize.emit({ event, rowId: this.row.id });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.isDraggingCard = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDraggingCard = false;
  }

  onCardDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingCard = false;
    this.cardDropped.emit({
      event,
      row: this.row,
      availableColumns: this.availableColumns
    });
  }

  onDeleteCard(card: CardDto) {
    this.deleteCard.emit({ rowId: this.row.id, card });
  }

  onConfigurationChange(card: CardDto, updatedCard: CardDto) {
    this.configureCard.emit({ rowId: this.row.id, card: updatedCard });
  }
} 