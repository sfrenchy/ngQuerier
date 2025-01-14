import 'reflect-metadata';
import { Component, OnInit, OnDestroy, Type, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutDto, RowDto, CardDto } from '@models/api.models';
import { BaseCardComponent } from './cards/base-card.component';
import { CardService, CardType } from './cards/card.service';
import { DroppableRowComponent } from './droppable-row.component';

@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DroppableRowComponent
  ]
})
export class LayoutEditorComponent implements OnInit, OnDestroy {
  layout: LayoutDto = {
    pageId: 0,
    rows: []
  };

  availableCards: CardType[] = [];

  nextRowId = 1;
  nextCardId = 1;
  private resizing = false;
  private currentRowId: number | null = null;
  private startY = 0;
  private startHeight = 0;

  constructor(
    private injector: Injector,
    private cardService: CardService
  ) {
    // Bind the event handlers to maintain the correct 'this' context
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  async ngOnInit() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    
    this.availableCards = await this.cardService.discoverCards();
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  getCardComponent(type: string): Type<BaseCardComponent> | null {
    return this.cardService.getCardComponent(type);
  }

  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', 'row');
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const type = event.dataTransfer.getData('text/plain');
    if (type === 'row') {
      const newRow: RowDto = {
        id: this.nextRowId++,
        order: this.layout.rows.length,
        height: 200,
        cards: []
      };
      this.layout.rows.push(newRow);
    }
  }

  onCardDrop(event: {event: DragEvent, row: RowDto, availableColumns: number}) {
    if (!event.event.dataTransfer) return;
    
    const cardType = JSON.parse(event.event.dataTransfer.getData('application/json'));
    const newCard: CardDto = {
      id: this.nextCardId++,
      type: cardType.type,
      title: cardType.title,
      gridWidth: event.availableColumns,
      backgroundColor: '#ffffff',
      config: {}
    };

    const rowIndex = this.layout.rows.findIndex(r => r.id === event.row.id);
    if (rowIndex !== -1) {
      this.layout.rows[rowIndex].cards.push(newCard);
    }
  }

  deleteRow(rowId: number) {
    const index = this.layout.rows.findIndex(r => r.id === rowId);
    if (index !== -1) {
      this.layout.rows.splice(index, 1);
    }
  }

  startResize(event: MouseEvent, rowId: number) {
    this.resizing = true;
    this.currentRowId = rowId;
    this.startY = event.clientY;
    const row = this.layout.rows.find(r => r.id === rowId);
    if (row) {
      this.startHeight = row.height;
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.resizing || this.currentRowId === null) return;

    const deltaY = event.clientY - this.startY;
    const row = this.layout.rows.find(r => r.id === this.currentRowId);
    if (row) {
      const newHeight = Math.max(100, this.startHeight + deltaY);
      row.height = newHeight;
    }
  }

  private onMouseUp() {
    this.resizing = false;
    this.currentRowId = null;
  }

  onConfigureCard(event: { rowId: number, card: CardDto }) {
    // TODO: Implement card configuration
    console.log('Configure card', event);
  }

  onDeleteCard(rowId: number, card: CardDto) {
    const row = this.layout.rows.find(r => r.id === rowId);
    if (row) {
      const index = row.cards.findIndex(c => c.id === card.id);
      if (index !== -1) {
        row.cards.splice(index, 1);
      }
    }
  }

  onCardDragStart(event: DragEvent, cardType: CardType) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', 'card');
      event.dataTransfer.setData('application/json', JSON.stringify(cardType));
      event.dataTransfer.effectAllowed = 'move';
    }
  }
}
