import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PlaceholderCard } from '@models/page-layout.models';
import { TranslateModule } from '@ngx-translate/core';
import { RowResizerComponent } from '@components/row-resizer/row-resizer.component';
import { PlaceholderCardComponent } from '@components/placeholder-card/placeholder-card.component';
import { PlaceholderCardConfigComponent } from '@components/placeholder-card-config/placeholder-card-config.component';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { CardDto, RowDto } from '@models/api.models';

@Component({
  selector: 'app-draggable-row',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TranslateModule,
    RowResizerComponent,
    PlaceholderCardComponent,
    PlaceholderCardConfigComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './draggable-row.component.html',
  styleUrls: ['./draggable-row.component.scss']
})
export class DraggableRowComponent {
  @Input() row!: RowDto;
  @Input() isEditing = false;
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onCardDrop = new EventEmitter<{ card: CardDto; rowId: number }>();
  @Output() onCardReorder = new EventEmitter<{ rowId: number; cards: CardDto[] }>();
  @Output() onHeightChange = new EventEmitter<{ rowId: number; height: number }>();
  @Output() onCardUpdate = new EventEmitter<CardDto>();
  @Output() onCardDelete = new EventEmitter<CardDto>();

  editingCard: PlaceholderCard | null = null;
  showDeleteConfirmation = false;
  cardToDelete: CardDto | null = null;
  isResizing = false;
  isDragging = false;

  getDropListId(): string {
    return `row-${this.row.id}`;
  }

  handleDragStart(event: any) {
    this.isDragging = true;
  }

  handleDragEnd(event: any) {
    this.isDragging = false;
  }

  handleCardDrop(event: CdkDragDrop<CardDto[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.onCardReorder.emit({
        rowId: this.row.id,
        cards: event.container.data
      });
    } else {
      const card = event.previousContainer.data[event.previousIndex];
      this.onCardDrop.emit({ card, rowId: this.row.id });
    }
  }

  handleCardEdit(card: CardDto) {
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

  handleCardDelete(card: CardDto) {
    this.cardToDelete = card;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete() {
    if (this.cardToDelete) {
      this.onCardDelete.emit(this.cardToDelete);
      this.resetDeleteState();
    }
  }

  onCancelDelete() {
    this.resetDeleteState();
  }

  private resetDeleteState() {
    this.showDeleteConfirmation = false;
    this.cardToDelete = null;
  }
} 
