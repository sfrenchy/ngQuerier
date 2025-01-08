import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DynamicRow, DynamicCard, PlaceholderCard } from '../../../../../models/page-layout.models';
import { PageLayoutService } from '../../../../../services/page-layout.service';
import { DraggableRowComponent } from '../../../../../components/draggable-row/draggable-row.component';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule, DragDropModule, DraggableRowComponent],
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

  ngOnInit() {
    this.pageLayoutService.loadPageLayout(1); // TODO: Get page ID from route
  }

  getRowDropListIds(): string[] {
    const layout = this.pageLayoutService.pageLayout$.value;
    if (!layout) return [];
    return layout.rows.map(row => `row-${row.id}`);
  }

  onDrop(event: any) {
    if (event.previousContainer.id === 'componentList' && event.container.id === 'layoutList') {
      const dropPoint = event.currentIndex;
      this.pageLayoutService.addRow(dropPoint);
    }
  }

  onCardDropped(event: { card: DynamicCard; rowId: number }) {
    this.pageLayoutService.addCardToRow(event.card, event.rowId);
  }

  onCardReordered(event: { rowId: number; cards: DynamicCard[] }) {
    this.pageLayoutService.updateRowCards(event.rowId, event.cards);
  }

  editRow(row: DynamicRow) {
    // TODO: Implement row editing dialog
    console.log('Edit row:', row);
  }

  deleteRow(row: DynamicRow) {
    this.pageLayoutService.deleteRow(row.id);
  }

  saveLayout() {
    this.pageLayoutService.saveLayout();
  }
} 