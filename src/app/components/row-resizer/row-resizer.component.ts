import { Component, Output, EventEmitter, Input, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-row-resizer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row-resizer group/resizer"
         (mousedown)="startResize($event)">
      <div class="h-1 w-full group-hover/resizer:bg-blue-500/50 cursor-row-resize transition-colors"></div>
      <div class="absolute left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-400 rounded group-hover/resizer:bg-blue-500"></div>
    </div>
  `,
  styles: [`
    .row-resizer {
      position: relative;
      height: 8px;
      margin: -4px 0;
      cursor: row-resize;
      z-index: 10;
    }
  `]
})
export class RowResizerComponent {
  @Input() currentHeight!: number;
  @Output() heightChange = new EventEmitter<number>();
  @Output() resizing = new EventEmitter<boolean>();

  private startY = 0;
  private isResizing = false;
  private tempHeight = 0;
  private rowElement: HTMLElement | null = null;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  startResize(event: MouseEvent) {
    console.log('Start resize', { currentHeight: this.currentHeight });
    event.preventDefault();
    event.stopPropagation();  // Empêche la propagation vers le système de drag'n'drop
    
    this.startY = event.clientY;
    this.tempHeight = this.currentHeight;
    this.isResizing = true;
    this.resizing.emit(true);

    // Get the row element (parent of the resizer)
    this.rowElement = this.elementRef.nativeElement.parentElement?.querySelector('[style*="min-height"]') || null;

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.body.style.cursor = 'row-resize';
  }

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isResizing) return;

    event.preventDefault();
    event.stopPropagation();  // Empêche la propagation vers le système de drag'n'drop

    const deltaY = event.clientY - this.startY;
    this.tempHeight = Math.max(100, this.currentHeight + deltaY);
    
    // Update the row height visually during drag
    if (this.rowElement) {
      this.renderer.setStyle(this.rowElement, 'min-height', `${this.tempHeight}px`);
    }
    
    console.log('Mouse move', { deltaY, tempHeight: this.tempHeight });
  }

  private onMouseUp = () => {
    console.log('Mouse up', { finalHeight: this.tempHeight });
    this.isResizing = false;
    this.resizing.emit(false);
    
    // Emit the final height
    this.heightChange.emit(this.tempHeight);
    
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.body.style.cursor = '';
    this.rowElement = null;
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }
} 