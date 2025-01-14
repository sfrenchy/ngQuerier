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
  ) {}

  async ngOnInit() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    this.availableCards = await this.cardService.discoverCards();
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
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
        id: this.layout.rows.length + 1,
        order: this.layout.rows.length,
        height: 200,
        cards: []
      };
      this.layout.rows.push(newRow);
    }
  }

  onCardDrop(event: DragEvent, row: RowDto) {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const type = event.dataTransfer.getData('text/plain');
    if (type === 'card') {
      const cardType = JSON.parse(event.dataTransfer.getData('application/json')) as CardType;
      const newCard: CardDto = {
        id: this.nextCardId++,
        type: cardType.type,
        title: cardType.title,
        gridWidth: 4,
        backgroundColor: '#ffffff',
        config: {}
      };
      row.cards.push(newCard);
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
    if (this.resizing && this.currentRowId !== null) {
      const deltaY = event.clientY - this.startY;
      const row = this.layout.rows.find(r => r.id === this.currentRowId);
      if (row) {
        row.height = Math.max(100, this.startHeight + deltaY);
      }
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
