import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">{{title}}</h3>
        </div>
          <ng-content></ng-content>
        
      </div>
      <div class="px-6 py-4 border-t flex justify-end gap-2">
          <ng-content select="[dialog-actions]"></ng-content>
        </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class DialogComponent {
  @Input() title!: string;
} 