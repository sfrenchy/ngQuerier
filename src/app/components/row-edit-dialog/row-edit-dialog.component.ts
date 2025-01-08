import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicRow } from '../../models/page-layout.models';

@Component({
  selector: 'app-row-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-200 mb-6">
            {{ 'MENU.PAGES.LAYOUT.EDIT_ROW' | translate }}
          </h2>

          <div class="space-y-4">
            <!-- Height -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">
                {{ 'MENU.PAGES.LAYOUT.ROW_HEIGHT' | translate }}
              </label>
              <div class="flex items-center">
                <input type="number"
                       [(ngModel)]="rowData.height"
                       min="100"
                       step="10"
                       class="block w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500">
                <span class="ml-2 text-gray-400">px</span>
              </div>
            </div>

            <!-- Alignment -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">
                {{ 'MENU.PAGES.LAYOUT.ROW_ALIGNMENT' | translate }}
              </label>
              <select [(ngModel)]="rowData.alignment"
                      class="block w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500">
                <option value="start">{{ 'MENU.PAGES.LAYOUT.ALIGNMENT_START' | translate }}</option>
                <option value="center">{{ 'MENU.PAGES.LAYOUT.ALIGNMENT_CENTER' | translate }}</option>
                <option value="end">{{ 'MENU.PAGES.LAYOUT.ALIGNMENT_END' | translate }}</option>
              </select>
            </div>

            <!-- Spacing -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">
                {{ 'MENU.PAGES.LAYOUT.ROW_SPACING' | translate }}
              </label>
              <input type="number"
                     [(ngModel)]="rowData.spacing"
                     min="0"
                     max="8"
                     step="1"
                     class="block w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500">
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 px-6 py-4 bg-gray-900 rounded-b-lg">
          <button (click)="onCancel.emit()"
                  class="px-4 py-2 text-gray-300 hover:text-white">
            {{ 'COMMON.CANCEL' | translate }}
          </button>
          <button (click)="onSave.emit(rowData)"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {{ 'COMMON.SAVE' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class RowEditDialogComponent {
  @Input() row!: DynamicRow;
  @Output() onSave = new EventEmitter<DynamicRow>();
  @Output() onCancel = new EventEmitter<void>();

  rowData!: DynamicRow;

  ngOnInit() {
    // Clone the input row to avoid modifying it directly
    this.rowData = { ...this.row };
  }
} 