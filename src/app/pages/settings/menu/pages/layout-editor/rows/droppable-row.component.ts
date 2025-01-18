import { Component, EventEmitter, Input, Output, NgModuleRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgComponentOutlet } from '@angular/common';
import { CardDto, RowDto } from '@models/api.models';
import { CardService } from '@cards/card.service';
import { CardWrapperComponent } from '@cards/card-wrapper/card-wrapper.component';
import { RowWrapperComponent } from './row-wrapper.component';

@Component({
  selector: 'app-droppable-row',
  templateUrl: './droppable-row.component.html',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet, CardWrapperComponent, RowWrapperComponent]
})
export class DroppableRowComponent implements OnInit {
  @Input() row!: RowDto;
  @Input() set height(value: number) {
    this._height = value;
  }
  get height(): number {
    return this._height;
  }
  private _height = 0;

  @Output() deleteRow = new EventEmitter<void>();
  @Output() startResize = new EventEmitter<{event: MouseEvent, rowId: number}>();
  @Output() endResize = new EventEmitter<{rowId: number, newHeight: number}>();
  @Output() cardDrop = new EventEmitter<{rowId: number, cardType?: string}>();
  @Output() deleteCard = new EventEmitter<{rowId: number, cardId: number}>();
  @Output() configureCard = new EventEmitter<{rowId: number, cardId: number}>();
  @Output() configureRow = new EventEmitter<number>();

  isDraggingCard = false;
  private cardComponents = new Map<string, any>();

  constructor(
    private cardService: CardService,
    public moduleRef: NgModuleRef<any>
  ) {}

  ngOnInit() {
    if (this.row.height && this._height === 0) {
      this._height = this.row.height;
    }
  }

  getCardComponent(card: any) {
    const type = card.type;
    if (!this.cardComponents.has(type)) {
      const component = this.cardService.getCardByType(type);
      this.cardComponents.set(type, {
        component,
        inputs: {
          card: card,
          isEditing: true
        }
      });
    } else {
      const cardComponent = this.cardComponents.get(type);
      cardComponent.inputs = {
        card: card,
        isEditing: true
      };
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

  onResizeStart(event: {event: MouseEvent, rowId: number}) {
    this.startResize.emit(event);
  }

  onResizeEnd(event: {rowId: number, newHeight: number}) {
    this._height = event.newHeight;
    this.endResize.emit(event);
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

  onConfigureRow() {
    this.configureRow.emit(this.row.id);
  }
} 