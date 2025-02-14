import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutDto, RowDto } from '@models/api.models';
import { ILayoutRendererOptions } from './layout-renderer.interface';
import { DroppableRowComponent } from '../rows/droppable-row.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-layout-renderer',
  standalone: true,
  imports: [CommonModule, DroppableRowComponent, TranslateModule],
  templateUrl: './layout-renderer.component.html'
})
export class LayoutRendererComponent {
  @Input() layout!: LayoutDto;
  @Input() options: ILayoutRendererOptions = {
    mode: 'view',
    emptyMessage: 'LAYOUT.EMPTY_STATE.DROP_ROWS',
    showEmptyState: true,
    dragEnabled: false
  };

  @Output() cardDrop = new EventEmitter<{rowId: number, cardType?: string}>();
  @Output() configureCard = new EventEmitter<{rowId: number, cardId: number}>();
  @Output() deleteCard = new EventEmitter<{rowId: number, cardId: number}>();
  @Output() deleteRow = new EventEmitter<number>();
  @Output() startResize = new EventEmitter<any>();
  @Output() endResize = new EventEmitter<any>();
  @Output() rowDrop = new EventEmitter<RowDto>();

  isDraggingRow = false;
  isDraggingCard = false;

  onDragLeave(event: DragEvent) {
    if (this.options.mode !== 'edit' || !this.options.dragEnabled) return;
    event.preventDefault();
    event.stopPropagation();
  }

  onDragOver(event: DragEvent) {
    if (this.options.mode !== 'edit' || !this.options.dragEnabled) return;
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    if (this.options.mode !== 'edit' || !this.options.dragEnabled) return;
    event.preventDefault();
    event.stopPropagation();

    if (!event.dataTransfer) return;

    const type = event.dataTransfer.getData('text/plain');
    if (type === 'row') {
      const newRow: RowDto = {
        id: -1,
        order: this.layout.rows.length,
        height: 300,
        cards: []
      };

      this.rowDrop.emit(newRow);
    }
  }
}
