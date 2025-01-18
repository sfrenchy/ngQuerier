import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDto } from '@models/api.models';

@Component({
  selector: 'app-card-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative h-full">
      <div *ngIf="isEditing" class="absolute right-2 top-2 flex gap-2 z-10">
        <button class="p-1 rounded hover:bg-gray-700 text-gray-600 hover:text-white" (click)="onConfigure()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        </button>
        <button class="p-1 rounded hover:bg-gray-700 text-gray-600 hover:text-white" (click)="onDelete()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <ng-content></ng-content>
    </div>
  `
})
export class CardWrapperComponent {
  @Input() card!: CardDto;
  @Input() isEditing = false;
  @Output() delete = new EventEmitter<void>();
  @Output() configure = new EventEmitter<void>();

  onDelete() {
    this.delete.emit();
  }

  onConfigure() {
    this.configure.emit();
  }
} 