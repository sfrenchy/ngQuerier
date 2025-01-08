import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex justify-between items-center p-2"
         [style.background-color]="backgroundColor"
         [style.color]="textColor">
      <div class="flex items-center gap-2">
        <ng-content select="[dragHandle]"></ng-content>
        <h3 class="text-sm font-medium">{{ title }}</h3>
      </div>
      <div class="flex items-center gap-2">
        <button *ngIf="edit.observed" 
                (click)="edit.emit()"
                class="text-current hover:opacity-80">
          <i class="fas fa-cog"></i>
        </button>
        <button *ngIf="delete.observed"
                (click)="delete.emit()"
                class="text-current hover:opacity-80">
          <i class="fas fa-trash"></i>
        </button>
        <button *ngIf="fullScreen.observed"
                (click)="fullScreen.emit()"
                class="text-current hover:opacity-80">
          <i class="fas fa-expand"></i>
        </button>
      </div>
    </div>
  `
})
export class CardHeaderComponent {
  @Input() title = '';
  @Input() backgroundColor?: string;
  @Input() textColor?: string;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() fullScreen = new EventEmitter<void>();
} 