import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutDto, RowDto } from '../../../../../models/api.models';

@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.css'],
  standalone: true,
  imports: [CommonModule, DragDropModule]
})
export class LayoutEditorComponent implements OnInit, OnDestroy {
  layout: LayoutDto = {
    pageId: 0,
    rows: []
  };

  nextRowId = 1;
  private resizing = false;
  private currentRowId: number | null = null;
  private startY = 0;
  private startHeight = 0;

  constructor() { }

  ngOnInit(): void {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  onRowDrop(event: CdkDragDrop<RowDto[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.layout.rows, event.previousIndex, event.currentIndex);
      // Mettre à jour l'ordre des lignes
      this.layout.rows.forEach((row: RowDto, index: number) => {
        row.order = index + 1;
      });
    } else {
      // Ajouter une nouvelle ligne
      const newRow: RowDto = {
        id: this.nextRowId++,
        order: this.layout.rows.length + 1,
        height: 300,
        cards: []
      };
      this.layout.rows.splice(event.currentIndex, 0, newRow);
    }
  }

  startResize(event: MouseEvent, rowId: number) {
    this.resizing = true;
    this.currentRowId = rowId;
    this.startY = event.clientY;
    const row = this.layout.rows.find((r: RowDto) => r.id === rowId);
    if (row) {
      this.startHeight = row.height;
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.resizing || this.currentRowId === null) return;

    const deltaY = event.clientY - this.startY;
    const newHeight = Math.max(300, this.startHeight + deltaY);
    
    const row = this.layout.rows.find((r: RowDto) => r.id === this.currentRowId);
    if (row) {
      row.height = newHeight;
    }
  }

  private onMouseUp() {
    this.resizing = false;
    this.currentRowId = null;
  }

  deleteRow(rowId: number) {
    const index = this.layout.rows.findIndex((r: RowDto) => r.id === rowId);
    if (index !== -1) {
      this.layout.rows.splice(index, 1);
      // Mettre à jour l'ordre des lignes
      this.layout.rows.forEach((row: RowDto, idx: number) => {
        row.order = idx + 1;
      });
    }
  }
}
