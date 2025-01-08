import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DynamicRow, DynamicCard } from '@models/page-layout.models';
import { TranslateModule } from '@ngx-translate/core';
import { RowResizerComponent } from '@components/row-resizer/row-resizer.component';

@Component({
  selector: 'app-draggable-row',
  standalone: true,
  imports: [CommonModule, DragDropModule, TranslateModule, RowResizerComponent],
  templateUrl: './draggable-row.component.html',
  styleUrls: ['./draggable-row.component.scss']
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
