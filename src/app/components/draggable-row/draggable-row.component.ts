import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DynamicRow, DynamicCard } from '../../models/page-layout.models';
import { TranslateModule } from '@ngx-translate/core';
import { RowResizerComponent } from '../row-resizer/row-resizer.component';

@Component({
  selector: 'app-draggable-row',
  standalone: true,
  imports: [CommonModule, DragDropModule, TranslateModule, RowResizerComponent],
  template: `
    <div class="row-wrapper">
      <div class="row-container p-4 bg-gray-800 rounded-lg shadow relative group"
           cdkDrag
           [cdkDragDisabled]="isResizing">
        <!-- Row header -->
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <button class="text-gray-400 hover:text-white"
                    (click)="onEdit.emit()">
              <i class="fas fa-cog"></i>
            </button>
            <button class="text-gray-400 hover:text-white"
                    (click)="onDelete.emit()">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="text-gray-400">
            {{ row.height }}px
          </div>
        </div>

        <!-- Cards container -->
        <div class="cards-container"
             cdkDropList
             [id]="'row-' + row.id"
             [cdkDropListData]="row.cards"
             [cdkDropListConnectedTo]="['card-palette']"
             (cdkDropListDropped)="handleCardDrop($event)">
          <div class="flex gap-4 flex-wrap"
               [style.min-height.px]="row.height">
            <!-- Cards -->
            <ng-container *ngFor="let card of row.cards">
              <div class="card bg-gray-700 p-4 rounded"
                   [style.flex]="'0 0 ' + (card.gridWidth / 12 * 100) + '%'"
                   [style.max-width.%]="(card.gridWidth / 12 * 100)"
                   cdkDrag
                   [cdkDragData]="card">
                <div class="text-gray-200">{{ card.titles['fr'] || 'MENU.PAGES.LAYOUT.PLACEHOLDER_CARD' | translate }}</div>
              </div>
            </ng-container>

            <!-- Empty state / Drop zone -->
            <div *ngIf="row.cards.length === 0"
                 class="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-600 rounded">
              <span class="text-gray-400">{{ 'MENU.PAGES.LAYOUT.DROP_CARD_HERE' | translate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row resizer -->
      <app-row-resizer 
        [currentHeight]="row.height"
        (heightChange)="onHeightChange.emit({ rowId: row.id, height: $event })"
        (resizing)="isResizing = $event">
      </app-row-resizer>
    </div>
  `,
  styles: [`
    .row-wrapper {
      width: 100%;
    }

    .row-container {
      width: 100%;
      background-color: theme('colors.gray.800');
    }

    .cards-container {
      min-height: 100px;
      width: 100%;
    }

    .card {
      transition: all 0.2s ease-in-out;
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

    .cards-container.cdk-drop-list-dragging .card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class DraggableRowComponent {
  @Input() row!: DynamicRow;
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onCardDrop = new EventEmitter<{ card: DynamicCard, rowId: number }>();
  @Output() onCardReorder = new EventEmitter<{ rowId: number, cards: DynamicCard[] }>();
  @Output() onHeightChange = new EventEmitter<{ rowId: number, height: number }>();

  isResizing = false;

  handleCardDrop(event: CdkDragDrop<DynamicCard[]>) {
    if (event.previousContainer === event.container) {
      // Reordering within the same row
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.onCardReorder.emit({
        rowId: this.row.id,
        cards: event.container.data
      });
    } else {
      // Adding new card from palette
      const card = event.previousContainer.data[event.previousIndex];
      this.onCardDrop.emit({ card, rowId: this.row.id });
    }
  }

  handleHeightChange(deltaY: number) {
    const newHeight = Math.max(100, this.row.height + deltaY);
    this.onHeightChange.emit({ rowId: this.row.id, height: newHeight });
  }
} 
