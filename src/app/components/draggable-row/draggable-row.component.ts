import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DynamicRow, DynamicCard } from '../../models/page-layout.models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-draggable-row',
  standalone: true,
  imports: [CommonModule, DragDropModule, TranslateModule],
  template: `
    <div class="row-container p-4 my-2 bg-gray-800 rounded-lg shadow"
         cdkDropList
         [cdkDropListData]="row.cards"
         (cdkDropListDropped)="handleCardDrop($event)"
         [cdkDropListConnectedTo]="['card-palette']">
      <div class="flex justify-between items-center mb-2">
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

      <div class="flex gap-4 items-stretch"
           [style.height.px]="row.height">
        <ng-container *ngFor="let card of row.cards">
          <div class="card bg-gray-700 p-4 rounded"
               [style.flex-basis.%]="(card.gridWidth / 12) * 100"
               cdkDrag>
            <div class="text-gray-200">{{ 'MENU.PAGES.LAYOUT.PLACEHOLDER_CARD' | translate }}</div>
          </div>
        </ng-container>

        <!-- Drop zone for new cards -->
        <div *ngIf="row.cards.length === 0"
             class="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-600 rounded">
          <span class="text-gray-400">{{ 'MENU.PAGES.LAYOUT.DROP_CARD_HERE' | translate }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .row-container {
      min-height: 100px;
      width: 100%;
      background-color: theme('colors.gray.800');
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class DraggableRowComponent {
  @Input() row!: DynamicRow;
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onCardDrop = new EventEmitter<{ card: DynamicCard, rowId: number }>();

  handleCardDrop(event: CdkDragDrop<DynamicCard[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const card = event.previousContainer.data[event.previousIndex];
      this.onCardDrop.emit({ card, rowId: this.row.id });
    }
  }
} 