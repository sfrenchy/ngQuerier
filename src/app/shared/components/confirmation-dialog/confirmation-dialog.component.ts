import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface ConfirmationDialogData {
  titleKey?: string;
  messageKey: string;
  messageParams?: { [key: string]: string | number | undefined };
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 class="text-xl font-semibold text-gray-100 mb-4">
          {{ (titleKey || 'COMMON.CONFIRMATION.TITLE') | translate }}
        </h2>
        <p class="text-gray-300 mb-6">
          {{ messageKey | translate:messageParams }}
        </p>
        <div class="flex justify-end gap-4">
          <button
            type="button"
            class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            (click)="onCancel()"
          >
            {{ 'COMMON.CANCEL' | translate }}
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            (click)="onConfirm()"
          >
            {{ 'COMMON.DELETE' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  @Input() titleKey?: string;
  @Input() messageKey!: string;
  @Input() messageParams?: { [key: string]: string | number | undefined };
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
} 