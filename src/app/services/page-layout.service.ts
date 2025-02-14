import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CardDto, LayoutDto, RowDto} from '@models/api.models';
import {ApiService} from '@services/api.service';

interface LayoutState {
  layout: LayoutDto;
  isDirty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PageLayoutService {
  pageLayout = new BehaviorSubject<LayoutState>({
    layout: {
      pageId: 0,
      icon: '',
      names: {},
      isVisible: true,
      roles: [],
      route: '',
      rows: []
    },
    isDirty: false
  });

  private nextRowId = 1;
  private nextCardId = 1;

  constructor(private apiService: ApiService) {
  }

  loadPageLayout(id: number) {
    this.apiService.getLayout(id).subscribe({
      next: (layout) => {
        this.pageLayout.next({layout, isDirty: false});
      },
      error: (error) => {
        console.error('Error loading layout:', error);
      }
    });
  }

  addRow(index: number) {
    const currentState = this.pageLayout.value;
    const newRow: RowDto = {
      id: this.nextRowId++,
      order: index,
      height: 200,
      cards: []
    };

    const updatedRows = [...currentState.layout.rows];
    updatedRows.splice(index, 0, newRow);

    this.pageLayout.next({
      layout: {
        ...currentState.layout,
        rows: updatedRows
      },
      isDirty: true
    });
  }

  private getAvailableWidth(row: RowDto): number {
    const usedWidth = row.cards.reduce((total: number, card: CardDto) => total + card.gridwidth, 0);
    return 12 - usedWidth;
  }

  addCardToRow(card: CardDto, rowId: number) {
    const currentState = this.pageLayout.value;
    const rowIndex = currentState.layout.rows.findIndex((r: RowDto) => r.id === rowId);
    if (rowIndex === -1) return;

    const row = currentState.layout.rows[rowIndex];
    const availableWidth = this.getAvailableWidth(row);
    if (availableWidth <= 0) return;

    const newCard: CardDto = {
      ...card,
      id: this.nextCardId++,
      rowId: row.id,
      order: row.cards.length,
      gridwidth: Math.min(card.gridwidth, availableWidth)
    };

    const updatedRows = currentState.layout.rows.map((r: RowDto, index: number) => {
      if (index === rowIndex) {
        return {
          ...r,
          cards: [...r.cards, newCard]
        };
      }
      return r;
    });

    this.pageLayout.next({
      layout: {
        ...currentState.layout,
        rows: updatedRows
      },
      isDirty: true
    });
  }

  updateRowCards(rowId: number, cards: CardDto[]) {
    const currentState = this.pageLayout.value;
    const updatedRows = currentState.layout.rows.map((row: RowDto) => {
      if (row.id === rowId) {
        return {
          ...row,
          cards
        };
      }
      return row;
    });

    this.pageLayout.next({
      layout: {
        ...currentState.layout,
        rows: updatedRows
      },
      isDirty: true
    });
  }

  updateRow(updatedRow: RowDto) {
    const currentState = this.pageLayout.value;
    const updatedRows = currentState.layout.rows.map((row: RowDto) => {
      if (row.id === updatedRow.id) {
        return updatedRow;
      }
      return row;
    });

    this.pageLayout.next({
      layout: {
        ...currentState.layout,
        rows: updatedRows
      },
      isDirty: true
    });
  }

  deleteRow(rowId: number) {
    const currentState = this.pageLayout.value;
    const updatedRows = currentState.layout.rows.filter((row: RowDto) => row.id !== rowId);

    this.pageLayout.next({
      layout: {
        ...currentState.layout,
        rows: updatedRows
      },
      isDirty: true
    });
  }

  saveLayout() {
    const currentState = this.pageLayout.value;
    const apiLayout: LayoutDto = {
      ...currentState.layout,
      icon: currentState.layout.icon || "dashboard",
      names: currentState.layout.names || {
        en: "Dashboard",
        fr: "Tableau de bord"
      },
      isVisible: currentState.layout.isVisible ?? true,
      roles: currentState.layout.roles || ["Admin", "User"],
      route: currentState.layout.route || "/dashboard"
    };

    this.apiService.updateLayout(currentState.layout.pageId, apiLayout).subscribe({
      next: () => {
        this.pageLayout.next({
          layout: currentState.layout,
          isDirty: false
        });
      },
      error: (error) => {
        console.error('Error saving layout:', error);
      }
    });
  }
}
