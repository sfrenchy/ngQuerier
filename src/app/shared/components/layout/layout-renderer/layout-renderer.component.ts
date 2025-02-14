import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutDto } from '@models/api.models';
import { ILayoutRendererOptions } from './layout-renderer.interface';
import { DroppableRowComponent } from '../rows/droppable-row.component';

@Component({
  selector: 'app-layout-renderer',
  standalone: true,
  imports: [CommonModule, DroppableRowComponent],
  templateUrl: './layout-renderer.component.html'
})
export class LayoutRendererComponent {
  @Input() layout!: LayoutDto;
  @Input() options: ILayoutRendererOptions = {
    mode: 'view',
    emptyMessage: 'Glissez-déposez des lignes depuis la toolbox',
    showEmptyState: true,
    dragEnabled: false
  };

  @Output() cardDrop = new EventEmitter<any>();
  @Output() configureCard = new EventEmitter<{rowId: string, cardId: string}>();
  @Output() deleteCard = new EventEmitter<{rowId: string, cardId: string}>();
  @Output() deleteRow = new EventEmitter<string>();
  @Output() startResize = new EventEmitter<any>();
  @Output() endResize = new EventEmitter<any>();

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
  }
}
