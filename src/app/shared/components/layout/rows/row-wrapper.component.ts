import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RowDto} from '@models/api.models';

@Component({
  selector: 'app-row-wrapper',
  templateUrl: './row-wrapper.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class RowWrapperComponent implements OnDestroy, OnInit {
  @Input() row!: RowDto;
  @Input() isEditing = false;

  @Input() set height(value: number) {
    this._height = value;
  }

  get height(): number {
    return this._height;
  }

  private _height = 0;

  @Output() delete = new EventEmitter<void>();
  @Output() configure = new EventEmitter<void>();
  @Output() startResize = new EventEmitter<{ event: MouseEvent, rowId: number }>();
  @Output() endResize = new EventEmitter<{ rowId: number, newHeight: number }>();

  private readonly MIN_HEIGHT = 100;
  private isResizing = false;
  private resizeGhost: HTMLElement | null = null;
  private initialHeight = 0;
  private initialY = 0;

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit() {
    if (this.row.height && this._height === 0) {
      this._height = this.row.height;
    }
  }

  onDelete() {
    this.delete.emit();
  }

  onConfigure() {
    this.configure.emit();
  }

  onResizeStart(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;

    // Créer le ghost
    this.resizeGhost = document.createElement('div');
    this.resizeGhost.className = 'resize-ghost';

    // Récupérer les dimensions de la row
    const rowElement = this.elementRef.nativeElement.querySelector('.row') as HTMLElement;
    const rect = rowElement.getBoundingClientRect();

    // Initialiser les valeurs
    this.initialHeight = rect.height;
    this.initialY = event.clientY;

    // Positionner le ghost
    this.resizeGhost.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background-color: rgba(59, 130, 246, 0.1);
      border: 2px dashed rgb(59, 130, 246);
      border-radius: 0.5rem;
      pointer-events: none;
      z-index: 9999;
      transition: height 0.05s linear;
      will-change: height;
    `;

    document.body.appendChild(this.resizeGhost);

    // Ajouter les écouteurs
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);

    this.startResize.emit({
      event,
      rowId: this.row.id
    });
  }

  private onResizeMove = (event: MouseEvent) => {
    if (!this.resizeGhost) return;

    const deltaY = event.clientY - this.initialY;
    const newHeight = Math.max(this.MIN_HEIGHT, this.initialHeight + deltaY);
    this.resizeGhost.style.height = `${newHeight}px`;
  }

  private onResizeEnd = (event: MouseEvent) => {
    if (!this.resizeGhost) return;

    const deltaY = event.clientY - this.initialY;
    const newHeight = Math.max(this.MIN_HEIGHT, Math.round(this.initialHeight + deltaY));

    // Nettoyer
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
    this.resizeGhost.remove();
    this.resizeGhost = null;
    this.isResizing = false;

    this.endResize.emit({
      rowId: this.row.id,
      newHeight
    });
  }

  ngOnDestroy() {
    if (this.isResizing) {
      document.removeEventListener('mousemove', this.onResizeMove);
      document.removeEventListener('mouseup', this.onResizeEnd);
      if (this.resizeGhost) {
        this.resizeGhost.remove();
      }
    }
  }
}
