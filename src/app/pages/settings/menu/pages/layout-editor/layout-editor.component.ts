import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, DragDropModule, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
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

  canDrop = (drag: CdkDrag, drop: CdkDropList) => {
    // Autoriser le drop uniquement si on déplace une ligne depuis la toolbox
    return drag.data === 'row';
  };

  onRowDrop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.layout.rows, event.previousIndex, event.currentIndex);
      // Mettre à jour l'ordre des lignes
      this.layout.rows.forEach((row: RowDto, index: number) => {
        row.order = index + 1;
      });
    } else if (event.previousContainer.data === 'row') {
      // Ajouter une nouvelle ligne
      const newRow: RowDto = {
        id: this.nextRowId++,
        order: this.layout.rows.length + 1,
        height: 100,
        cards: []
      };
      
      // Insérer la nouvelle ligne à la position du drop
      this.layout.rows.splice(event.currentIndex, 0, newRow);
      
      // Mettre à jour l'ordre des lignes
      this.layout.rows.forEach((row: RowDto, index: number) => {
        row.order = index + 1;
      });
    }
  }

  deleteRow(rowId: number): void {
    const index = this.layout.rows.findIndex(row => row.id === rowId);
    if (index !== -1) {
      this.layout.rows.splice(index, 1);
      // Mettre à jour l'ordre des lignes
      this.layout.rows.forEach((row: RowDto, idx: number) => {
        row.order = idx + 1;
      });
    }
  }

  startResize(event: MouseEvent, rowId: number): void {
    this.resizing = true;
    this.currentRowId = rowId;
    this.startY = event.clientY;
    const row = this.layout.rows.find(r => r.id === rowId);
    if (row) {
      this.startHeight = row.height;
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.resizing || this.currentRowId === null) return;

    const deltaY = event.clientY - this.startY;
    const row = this.layout.rows.find(r => r.id === this.currentRowId);
    if (row) {
      const newHeight = Math.max(50, this.startHeight + deltaY);
      row.height = newHeight;
    }
  }

  private onMouseUp(): void {
    this.resizing = false;
    this.currentRowId = null;
  }
}
