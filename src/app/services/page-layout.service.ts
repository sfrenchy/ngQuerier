import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DynamicRow, DynamicCard, PageLayout } from '@models/page-layout.models';

@Injectable({
  providedIn: 'root'
})
export class PageLayoutService {
  pageLayout$ = new BehaviorSubject<PageLayout>({
    id: 1,
    rows: [],
    isDirty: false
  });

  private nextRowId = 1;
  private nextCardId = 1;

  loadPageLayout(id: number) {
    // TODO: Load from backend
    this.pageLayout$.next({
      id,
      rows: [],
      isDirty: false
    });
  }

  addRow(index: number) {
    const layout = this.pageLayout$.value;
    const newRow: DynamicRow = {
      id: this.nextRowId++,
      order: index,
      height: 200,
      cards: [],
      alignment: 'start',
      spacing: 4
    };

    const updatedRows = [...layout.rows];
    updatedRows.splice(index, 0, newRow);

    this.pageLayout$.next({
      ...layout,
      rows: updatedRows,
      isDirty: true
    });
  }

  private getAvailableGridWidth(row: DynamicRow): number {
    const usedWidth = row.cards.reduce((total, card) => total + card.gridWidth, 0);
    return 12 - usedWidth;
  }

  addCardToRow(card: DynamicCard, rowId: number) {
    const layout = this.pageLayout$.value;
    const rowIndex = layout.rows.findIndex(r => r.id === rowId);
    if (rowIndex === -1) return;

    const row = layout.rows[rowIndex];
    const availableWidth = this.getAvailableGridWidth(row);
    if (availableWidth <= 0) return;

    // Créer une nouvelle carte avec un nouvel ID et ajuster la largeur
    const newCard: DynamicCard = {
      ...card,
      id: this.nextCardId++,
      order: row.cards.length,
      gridWidth: Math.min(card.gridWidth, availableWidth)
    };

    const updatedRows = layout.rows.map((r, index) => {
      if (index === rowIndex) {
        return {
          ...r,
          cards: [...r.cards, newCard]
        };
      }
      return r;
    });

    this.pageLayout$.next({
      ...layout,
      rows: updatedRows,
      isDirty: true
    });
  }

  updateRowCards(rowId: number, cards: DynamicCard[]) {
    const layout = this.pageLayout$.value;
    const updatedRows = layout.rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          cards
        };
      }
      return row;
    });

    this.pageLayout$.next({
      ...layout,
      rows: updatedRows,
      isDirty: true
    });
  }

  updateRow(updatedRow: DynamicRow) {
    const layout = this.pageLayout$.value;
    const updatedRows = layout.rows.map(row => {
      if (row.id === updatedRow.id) {
        return updatedRow;
      }
      return row;
    });

    this.pageLayout$.next({
      ...layout,
      rows: updatedRows,
      isDirty: true
    });
  }

  deleteRow(rowId: number) {
    const layout = this.pageLayout$.value;
    const updatedRows = layout.rows.filter(row => row.id !== rowId);

    this.pageLayout$.next({
      ...layout,
      rows: updatedRows,
      isDirty: true
    });
  }

  saveLayout() {
    // TODO: Save to backend
    const layout = this.pageLayout$.value;
    this.pageLayout$.next({
      ...layout,
      isDirty: false
    });
  }
} 