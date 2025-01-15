import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RowDto, CardDto } from '@models/api.models';
import { BaseCardComponent } from '../../../../../../cards/base-card.component';

@Component({
  selector: 'app-droppable-row',
  templateUrl: './droppable-row.component.html',
  standalone: true,
  imports: [CommonModule, BaseCardComponent]
})
export class DroppableRowComponent {
  @Input() row!: RowDto;
  @Output() deleteRow = new EventEmitter<void>();
  @Output() startResize = new EventEmitter<{ event: MouseEvent, rowId: number }>();
  @Output() cardDrop = new EventEmitter<{ rowId: number, cardType: string }>();
  @Output() deleteCard = new EventEmitter<{ rowId: number, cardId: number }>();
  @Output() configureCard = new EventEmitter<{ rowId: number, cardId: number }>();

  isDraggingCard = false;
  isResizing = false;

  onDeleteRow() {
    this.deleteRow.emit();
  }

  onResizeStart(event: MouseEvent) {
    this.isResizing = true;
    this.startResize.emit({ event, rowId: this.row.id });
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private onResizeEnd = () => {
    this.isResizing = false;
    document.removeEventListener('mouseup', this.onResizeEnd);
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

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const type = event.dataTransfer.getData('text/plain');
    if (type === 'card') {
      const cardType = event.dataTransfer.getData('cardType');
      this.cardDrop.emit({ rowId: this.row.id, cardType });
    }
  }

  onCardDelete(cardId: number) {
    this.deleteCard.emit({ rowId: this.row.id, cardId });
  }

  onCardConfigure(cardId: number) {
    this.configureCard.emit({ rowId: this.row.id, cardId });
  }
} 