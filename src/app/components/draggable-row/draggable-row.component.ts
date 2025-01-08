import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DynamicRow, DynamicCard, PlaceholderCard } from '@models/page-layout.models';
import { TranslateModule } from '@ngx-translate/core';
import { RowResizerComponent } from '@components/row-resizer/row-resizer.component';
import { PlaceholderCardComponent } from '@components/placeholder-card/placeholder-card.component';
import { PlaceholderCardConfigComponent } from '@components/placeholder-card-config/placeholder-card-config.component';

@Component({
  selector: 'app-draggable-row',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TranslateModule,
    RowResizerComponent,
    PlaceholderCardComponent,
    PlaceholderCardConfigComponent
  ],
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
  @Output() onCardEdit = new EventEmitter<DynamicCard>();
  @Output() onCardDelete = new EventEmitter<DynamicCard>();
  @Output() onCardUpdate = new EventEmitter<DynamicCard>();

  isResizing = false;
  editingCard: PlaceholderCard | null = null;

  getDropListId(): string {
    return `row-${this.row.id}`;
  }

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

  handleCardEdit(card: DynamicCard) {
    if (card.type === 'placeholder') {
      this.editingCard = card as PlaceholderCard;
    }
  }

  handleCardConfigSave(updatedCard: PlaceholderCard) {
    this.editingCard = null;
    this.onCardUpdate.emit(updatedCard);
  }

  handleCardConfigCancel() {
    this.editingCard = null;
  }

  handleHeightChange(deltaY: number) {
    const newHeight = Math.max(100, this.row.height + deltaY);
    this.onHeightChange.emit({ rowId: this.row.id, height: newHeight });
  }
} 
