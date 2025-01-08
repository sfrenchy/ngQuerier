import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DynamicRow, DynamicCard, PageLayout } from '@models/page-layout.models';

@Injectable({
  providedIn: 'root'
})
export class PageLayoutService {
  private currentPageId: number | null = null;
  pageLayout$ = new BehaviorSubject<PageLayout>({
    id: 0,
    rows: [],
    isDirty: false
  });

  loadPageLayout(pageId: number) {
    // TODO: Load from API
    this.currentPageId = pageId;
    this.pageLayout$.next({
      id: pageId,
      rows: [],
      isDirty: false
    });
  }

  addRow(index: number) {
    const layout = this.pageLayout$.value;
    const newRow: DynamicRow = {
      id: Date.now(),
      order: index,
      height: 200,
      cards: [],
      alignment: 'start',
      spacing: 4
    };

    const rows = [...layout.rows];
    rows.splice(index, 0, newRow);
    
    // Update order property for all rows
    const updatedRows = rows.map((row, idx) => ({
      ...row,
      order: idx
    }));

    this.pageLayout$.next({
      ...layout,
      rows: updatedRows,
      isDirty: true
    });
  }

  updateRow(updatedRow: DynamicRow) {
    const layout = this.pageLayout$.value;
    const updatedRows = layout.rows.map(row => 
      row.id === updatedRow.id ? { ...updatedRow } : row
    );

    this.pageLayout$.next({
      ...layout,
      rows: updatedRows,
      isDirty: true
    });
  }

  addCardToRow(card: DynamicCard, rowId: number) {
    const layout = this.pageLayout$.value;
    const rowIndex = layout.rows.findIndex(r => r.id === rowId);
    
    if (rowIndex === -1) return;

    const newCard: DynamicCard = {
      ...card,
      id: Date.now(),
      order: layout.rows[rowIndex].cards.length
    };

    const updatedRows = layout.rows.map((row, index) => {
      if (index === rowIndex) {
        return {
          ...row,
          cards: [...row.cards, newCard]
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

  updateRowCards(rowId: number, cards: DynamicCard[]) {
    const layout = this.pageLayout$.value;
    const rowIndex = layout.rows.findIndex(r => r.id === rowId);
    
    if (rowIndex === -1) return;

    const updatedRows = layout.rows.map((row, index) => {
      if (index === rowIndex) {
        return {
          ...row,
          cards: cards.map((card, idx) => ({
            ...card,
            order: idx
          }))
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

  deleteRow(rowId: number) {
    const layout = this.pageLayout$.value;
    const updatedRows = layout.rows
      .filter(row => row.id !== rowId)
      .map((row, index) => ({
        ...row,
        order: index
      }));

    this.pageLayout$.next({
      ...layout,
      rows: updatedRows,
      isDirty: true
    });
  }

  saveLayout() {
    if (!this.currentPageId) return;
    
    // TODO: Save to API
    const layout = this.pageLayout$.value;
    console.log('Saving layout:', layout);
    
    this.pageLayout$.next({
      ...layout,
      isDirty: false
    });
  }
} 