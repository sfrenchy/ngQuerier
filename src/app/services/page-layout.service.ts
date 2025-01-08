import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DynamicRow, DynamicCard, PageLayout } from '@models/page-layout.models';
import { ApiService } from '@services/api.service';
import { Layout } from '@models/api.models';

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

  constructor(private apiService: ApiService) {}

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

  private getAvailableWidth(row: DynamicRow): number {
    const usedWidth = row.cards.reduce((total, card) => total + card.width, 0);
    return 12 - usedWidth;
  }

  addCardToRow(card: DynamicCard, rowId: number) {
    const layout = this.pageLayout$.value;
    const rowIndex = layout.rows.findIndex(r => r.id === rowId);
    if (rowIndex === -1) return;

    const row = layout.rows[rowIndex];
    const availableWidth = this.getAvailableWidth(row);
    if (availableWidth <= 0) return;

    console.log('Adding card with width:', card.width);
    console.log('Available width:', availableWidth);

    // Créer une nouvelle carte avec un nouvel ID et ajuster la largeur
    const newCard: DynamicCard = {
      ...card,
      id: this.nextCardId++,
      rowId: row.id,
      order: row.cards.length,
      width: Math.min(card.width, availableWidth)
    };

    console.log('New card width:', newCard.width);

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
    const layout = this.pageLayout$.value;
    const apiLayout: Layout = {
      pageId: layout.id,
      icon: layout.icon || "dashboard",
      names: layout.names || {
        en: "Dashboard",
        fr: "Tableau de bord"
      },
      isVisible: layout.isVisible ?? true,
      roles: layout.roles || ["Admin", "User"],
      route: layout.route || "/dashboard",
      rows: layout.rows.map(row => ({
        id: row.id,
        order: row.order,
        height: row.height,
        alignment: row.alignment.charAt(0).toUpperCase() + row.alignment.slice(1),
        crossAlignment: "Start",
        spacing: row.spacing,
        cards: row.cards.map(card => {
          const { titles, ...restConfig } = card.configuration;
          return {
            id: card.id,
            rowId: card.rowId,
            order: card.order,
            width: card.width,
            type: card.type,
            titles,
            configuration: restConfig
          };
        })
      }))
    };

    this.apiService.updateLayout(layout.id, apiLayout).subscribe({
      next: () => {
        this.pageLayout$.next({
          ...layout,
          isDirty: false
        });
      },
      error: (error) => {
        console.error('Error saving layout:', error);
        // TODO: Handle error (show notification, etc.)
      }
    });
  }
} 