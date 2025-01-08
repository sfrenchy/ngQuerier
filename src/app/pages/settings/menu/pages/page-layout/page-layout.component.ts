import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PageLayoutService } from '../../../../../services/page-layout.service';
import { DraggableRowComponent } from '../../../../../components/draggable-row/draggable-row.component';
import { DynamicCard, PlaceholderCard, DynamicRow } from '../../../../../models/page-layout.models';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { PageLayout } from '../../../../../models/page-layout.models';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule, DragDropModule, DraggableRowComponent],
  templateUrl: './page-layout.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .layout-area {
      min-height: 200px;
      position: relative;
    }

    .layout-area.cdk-drop-list-dragging {
      border: 2px dashed theme('colors.blue.500');
      background-color: theme('colors.blue.500' / 10%);
    }

    .row-container {
      cursor: move;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .layout-area.cdk-drop-list-dragging-over {
      background-color: theme('colors.blue.500' / 10%);
      border: 2px dashed theme('colors.blue.500');
    }
  `]
})
export class PageLayoutComponent implements OnInit, OnDestroy {
  pageLayout$: BehaviorSubject<PageLayout | null>;
  private layoutSubscription: Subscription = new Subscription();
  
  availableCards: DynamicCard[] = [
    {
      id: 0,
      type: 'placeholder',
      order: 0,
      gridWidth: 6,
      titles: {},
      configuration: '',
      backgroundColor: 0,
      textColor: 0,
      headerBackgroundColor: 0,
      headerTextColor: 0
    } as PlaceholderCard
  ];

  constructor(
    private pageLayoutService: PageLayoutService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.pageLayout$ = new BehaviorSubject<PageLayout | null>(null);
  }

  ngOnInit() {
    const pageId = Number(this.route.snapshot.params['id']);
    this.pageLayoutService.loadPageLayout(pageId);

    // Subscribe to layout changes
    this.layoutSubscription = this.pageLayoutService.pageLayout$.subscribe(layout => {
      console.log('Layout updated:', JSON.stringify(layout, null, 2));
      this.pageLayout$.next(layout);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.layoutSubscription) {
      this.layoutSubscription.unsubscribe();
    }
  }

  onDrop(event: CdkDragDrop<any[]>) {
    console.log('Drop event:', event);
    console.log('Item data:', event.item.data);
    console.log('Previous container:', event.previousContainer.id);
    console.log('Target container:', event.container.id);
    console.log('Previous container data:', event.previousContainer.data);
    console.log('Target container data:', event.container.data);
    
    const pageId = Number(this.route.snapshot.params['id']);
    const layout = this.pageLayout$.value;
    if (!layout) return;

    console.log('Current layout:', JSON.stringify(layout, null, 2));

    if (event.previousContainer.id === 'componentList' && event.container.id === 'layoutList') {
      // Handle new row from component list
      console.log('Attempting to add new row...');
      const newRow: DynamicRow = {
        id: Date.now(),
        order: event.currentIndex,
        height: 500,
        cards: []
      };

      console.log('New row:', JSON.stringify(newRow, null, 2));

      const rows = [...layout.rows];
      rows.splice(event.currentIndex, 0, newRow);

      // Update order property
      const updatedRows = rows.map((row, index) => ({
        ...row,
        order: index
      }));

      console.log('Updated rows:', JSON.stringify(updatedRows, null, 2));
      this.pageLayoutService.updateRows(pageId, updatedRows);
      this.cdr.detectChanges();
    } else if (event.previousContainer === event.container) {
      // Handle row reordering
      if (event.previousIndex === event.currentIndex) return;

      const rows = [...layout.rows];
      moveItemInArray(rows, event.previousIndex, event.currentIndex);
      
      // Update order property
      const updatedRows = rows.map((row, index) => ({
        ...row,
        order: index
      }));

      this.pageLayoutService.updateRows(pageId, updatedRows);
      this.cdr.detectChanges();
    }
  }

  onCardDropped(event: { card: DynamicCard, rowId: number }) {
    this.pageLayoutService.addCardToRow(event.rowId, event.card);
  }

  editRow(row: DynamicRow) {
    // TODO: Implement row editing
    console.log('Edit row:', row);
  }

  deleteRow(row: DynamicRow) {
    // TODO: Implement row deletion
    console.log('Delete row:', row);
  }

  saveLayout() {
    const pageId = Number(this.route.snapshot.params['id']);
    this.pageLayoutService.saveLayout(pageId);
  }
} 