import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DynamicRow, DynamicCard, PlaceholderCard } from '@models/page-layout.models';
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
  constructor(private pageLayoutService: PageLayoutService) {
    this.pageLayout$ = this.pageLayoutService.pageLayout$;
  }

  pageLayout$;
  availableCards: DynamicCard[] = [
    {
      type: 'placeholder',
      id: 0,
      order: 0,
      gridWidth: 4,
      titles: {
        fr: 'Carte placeholder',
        en: 'Placeholder card'
      }
    } as PlaceholderCard
  ];

  editingRow: DynamicRow | null = null;

  ngOnInit() {
    this.pageLayoutService.loadPageLayout(1); // TODO: Get page ID from route
  }

  getRowDropListIds(): string[] {
    const layout = this.pageLayoutService.pageLayout$.value;
    if (!layout) return [];
    return layout.rows.map(row => `row-${row.id}`);
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer.id === 'componentList') {
      const layout = this.pageLayoutService.pageLayout$.value;
      let dropIndex = layout.rows.length;  // Par défaut, ajouter à la fin

      // Si c'est la zone vide initiale, ajouter en première position
      if (event.container.id === 'emptyDropZone') {
        dropIndex = 0;
      }

      this.pageLayoutService.addRow(dropIndex);
    }
  }

  onCardDropped(event: { card: DynamicCard; rowId: number }) {
    this.pageLayoutService.addCardToRow(event.card, event.rowId);
  }

  onCardReordered(event: { rowId: number; cards: DynamicCard[] }) {
    this.pageLayoutService.updateRowCards(event.rowId, event.cards);
  }

  onRowHeightChange(event: { rowId: number; height: number }) {
    const layout = this.pageLayoutService.pageLayout$.value;
    const row = layout.rows.find(r => r.id === event.rowId);
    if (!row) return;

    this.pageLayoutService.updateRow({
      ...row,
      height: event.height
    });
  }

  editRow(row: DynamicRow) {
    this.editingRow = row;
  }

  onRowEditSave(updatedRow: DynamicRow) {
    this.pageLayoutService.updateRow(updatedRow);
    this.editingRow = null;
  }

  onRowEditCancel() {
    this.editingRow = null;
  }

  deleteRow(row: DynamicRow) {
    this.pageLayoutService.deleteRow(row.id);
  }

  saveLayout() {
    this.pageLayoutService.saveLayout();
  }
} 