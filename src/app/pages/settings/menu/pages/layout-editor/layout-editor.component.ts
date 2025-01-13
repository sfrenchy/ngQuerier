import 'reflect-metadata';
import { Component, OnInit, OnDestroy, Type, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, DragDropModule, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { LayoutDto, RowDto, CardDto } from '@models/api.models';
import { BaseCardComponent } from './cards/base-card.component';
import { CardService, CardType } from './cards/card.service';

@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.css'],
  standalone: true,
  imports: [CommonModule, DragDropModule]
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

  canDrop = (drag: CdkDrag, drop: CdkDropList) => {
    return drag.data === 'row' || this.availableCards.some(card => card.type === drag.data);
  };

  onDrop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.layout.rows, event.previousIndex, event.currentIndex);
      // Mettre à jour l'ordre des lignes
      this.layout.rows.forEach((row: RowDto, index: number) => {
        row.order = index + 1;
      });
    } else {
      const dragData = event.item.data;
      if (dragData === 'row') {
        // Ajouter une nouvelle ligne
        const newRow: RowDto = {
          id: this.nextRowId++,
          order: this.layout.rows.length + 1,
          height: 100,
          cards: []
        };
        
        // Insérer la nouvelle ligne à la position du drop
        this.layout.rows.splice(event.currentIndex, 0, newRow);
        
        // Mettre à jour l'ordre des lignes
        this.layout.rows.forEach((row: RowDto, index: number) => {
          row.order = index + 1;
        });
      } else {
        // Ajouter une nouvelle carte
        const cardConfig = this.availableCards.find(c => c.type === dragData);
        if (cardConfig) {
          const newCard: CardDto = {
            id: this.nextCardId++,
            type: dragData,
            title: cardConfig.title,
            gridWidth: 4,
            backgroundColor: '#ffffff',
            config: {}
          };
          
          const rowIndex = event.currentIndex;
          this.layout.rows[rowIndex].cards.push(newCard);
        }
      }
    }
  }

  deleteRow(rowId: number): void {
    const index = this.layout.rows.findIndex(row => row.id === rowId);
    if (index !== -1) {
      this.layout.rows.splice(index, 1);
      // Mettre à jour l'ordre des lignes
      this.layout.rows.forEach((row: RowDto, idx: number) => {
        row.order = idx + 1;
      });
    }
  }

  startResize(event: MouseEvent, rowId: number): void {
    this.resizing = true;
    this.currentRowId = rowId;
    this.startY = event.clientY;
    const row = this.layout.rows.find(r => r.id === rowId);
    if (row) {
      this.startHeight = row.height;
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.resizing || this.currentRowId === null) return;

    const deltaY = event.clientY - this.startY;
    const row = this.layout.rows.find(r => r.id === this.currentRowId);
    if (row) {
      const newHeight = Math.max(50, this.startHeight + deltaY);
      row.height = newHeight;
    }
  }

  private onMouseUp(): void {
    this.resizing = false;
    this.currentRowId = null;
  }

  onConfigureCard(card: CardDto): void {
    // TODO: Ouvrir le dialogue de configuration
    console.log('Configure card:', card);
  }

  onDeleteCard(rowId: number, card: CardDto): void {
    const row = this.layout.rows.find(r => r.id === rowId);
    if (row) {
      const cardIndex = row.cards.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        row.cards.splice(cardIndex, 1);
      }
    }
  }
}
