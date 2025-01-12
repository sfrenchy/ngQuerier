import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CardDto, RowDto, LayoutDto } from '@models/api.models';
import { PageLayoutService } from '@services/page-layout.service';
import { DraggableRowComponent } from '@components/draggable-row/draggable-row.component';
import { RowEditDialogComponent } from '@components/row-edit-dialog/row-edit-dialog.component';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DragDropModule,
    DraggableRowComponent,
    RowEditDialogComponent
  ],
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent implements OnInit {
  constructor(private pageLayoutService: PageLayoutService) {}

  get pageLayout() {
    return this.pageLayoutService.pageLayout;
  }

  availableCards: CardDto[] = [
    {
      type: 'placeholder',
      id: 0,
      rowId: 0,
      order: 0,
      gridwidth: 12,
      titles: {
        fr: 'Carte placeholder',
        en: 'Placeholder card'
      },
      configuration: {
        showHeader: true,
        showFooter: false,
        centerLabel: {
          fr: 'Texte placeholder',
          en: 'Placeholder text'
        }
      },
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      headerBackgroundColor: '#111827',
      headerTextColor: '#ffffff'
    }
  ];

  editingRow: RowDto | null = null;

  ngOnInit() {
    this.pageLayoutService.loadPageLayout(1); // TODO: Get page ID from route
  }

  getRowDropListIds(): string[] {
    const state = this.pageLayout.value;
    if (!state) return [];
    return state.layout.rows.map((row: RowDto) => `row-${row.id}`);
  }

  getConnectedDropLists(): string[] {
    const state = this.pageLayout.value;
    if (!state) return ['emptyDropZone'];
    
    if (state.layout.rows.length === 0) {
      return ['emptyDropZone'];
    }
    
    return ['emptyDropZone', 'bottomDropZone'];
  }

  getCardDropListConnections(): string[] {
    return this.getRowDropListIds();
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer.id === 'componentList') {
      const state = this.pageLayout.value;
      let dropIndex = state.layout.rows.length;

      if (event.container.id === 'emptyDropZone') {
        dropIndex = 0;
      }

      this.pageLayoutService.addRow(dropIndex);
    }
  }

  onCardDropped(event: { card: CardDto; rowId: number }) {
    this.pageLayoutService.addCardToRow(event.card, event.rowId);
  }

  onCardReordered(event: { rowId: number; cards: CardDto[] }) {
    this.pageLayoutService.updateRowCards(event.rowId, event.cards);
  }

  onRowHeightChange(event: { rowId: number; height: number }) {
    const state = this.pageLayout.value;
    const row = state.layout.rows.find((r: RowDto) => r.id === event.rowId);
    if (!row) return;

    this.pageLayoutService.updateRow({
      ...row,
      height: event.height
    });
  }

  editRow(row: RowDto) {
    this.editingRow = row;
  }

  onRowEditSave(updatedRow: RowDto) {
    this.pageLayoutService.updateRow(updatedRow);
    this.editingRow = null;
  }

  onRowEditCancel() {
    this.editingRow = null;
  }

  deleteRow(row: RowDto) {
    this.pageLayoutService.deleteRow(row.id);
  }

  saveLayout() {
    this.pageLayoutService.saveLayout();
  }

  onCardUpdate(card: CardDto) {
    const state = this.pageLayout.value;
    const rowIndex = state.layout.rows.findIndex((r: RowDto) => r.cards.some((c: CardDto) => c.id === card.id));
    if (rowIndex === -1) return;

    const updatedRows = state.layout.rows.map((row: RowDto) => {
      if (row.id === state.layout.rows[rowIndex].id) {
        return {
          ...row,
          cards: row.cards.map((c: CardDto) => c.id === card.id ? card : c)
        };
      }
      return row;
    });

    this.pageLayout.next({
      layout: {
        ...state.layout,
        rows: updatedRows
      },
      isDirty: true
    });
  }

  onCardDelete(card: CardDto) {
    const state = this.pageLayout.value;
    const rowIndex = state.layout.rows.findIndex((r: RowDto) => r.cards.some((c: CardDto) => c.id === card.id));
    if (rowIndex === -1) return;

    const updatedRows = state.layout.rows.map((row: RowDto) => {
      if (row.id === state.layout.rows[rowIndex].id) {
        return {
          ...row,
          cards: row.cards.filter((c: CardDto) => c.id !== card.id)
        };
      }
      return row;
    });

    this.pageLayout.next({
      layout: {
        ...state.layout,
        rows: updatedRows
      },
      isDirty: true
    });
  }
} 