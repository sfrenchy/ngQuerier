import { Component, EventEmitter, Input, Output, NgModuleRef } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { CardDto, RowDto } from '@models/api.models';
import { BaseCardComponent } from '../../../../../../cards/base-card.component';
import { CardService } from '../../../../../../cards/card.service';

@Component({
  selector: 'app-droppable-row',
  templateUrl: './droppable-row.component.html',
  standalone: true,
  imports: [CommonModule, BaseCardComponent, NgComponentOutlet]
})
export class DroppableRowComponent {
  @Input() row!: RowDto;
  @Output() deleteRow = new EventEmitter<void>();
  @Output() startResize = new EventEmitter<{event: MouseEvent, rowId: number}>();
  @Output() cardDrop = new EventEmitter<{rowId: number, cardType?: string}>();
  @Output() deleteCard = new EventEmitter<{rowId: number, cardId: number}>();
  @Output() configureCard = new EventEmitter<{rowId: number, cardId: number}>();

  isDraggingCard = false;
  isResizing = false;

  private cardComponents = new Map<string, any>();

  constructor(
    private cardService: CardService,
    public moduleRef: NgModuleRef<any>
  ) {}

  getCardComponent(type: string) {
    if (!this.cardComponents.has(type)) {
      this.cardComponents.set(type, this.cardService.getCardByType(type));
    }
    return this.cardComponents.get(type);
  }

  onDeleteRow() {
    this.deleteRow.emit();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer?.getData('text/plain');
    if (type === 'card') {
      this.isDraggingCard = true;
    }
  }

  onDragLeave(event: DragEvent) {
    if (event.currentTarget === event.target) {
      this.isDraggingCard = false;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingCard = false;
    
    if (!event.dataTransfer) return;

    const type = event.dataTransfer.getData('text/plain');
    if (type === 'card') {
      const cardType = event.dataTransfer.getData('cardType');
      this.cardDrop.emit({
        rowId: this.row.id,
        cardType
      });
    }
  }

  onResizeStart(event: MouseEvent) {
    this.isResizing = true;
    this.startResize.emit({
      event,
      rowId: this.row.id
    });
  }

  onCardDelete(cardId: number) {
    this.deleteCard.emit({
      rowId: this.row.id,
      cardId
    });
  }

  onCardConfigure(cardId: number) {
    this.configureCard.emit({
      rowId: this.row.id,
      cardId
    });
  }
} 