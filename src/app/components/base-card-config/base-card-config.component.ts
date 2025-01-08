import { Component, Directive, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicCard } from '@models/page-layout.models';

@Component({
  selector: 'app-base-card-config',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div [class]="isFullscreen ? 'fixed inset-4 bg-gray-800 rounded-lg shadow-xl flex flex-col' : 'bg-gray-800 rounded-lg shadow-xl w-full max-w-lg'">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-200">
            {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.TITLE' | translate }}
          </h2>
          <button (click)="toggleFullscreen()"
                  class="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700 focus:outline-none">
            <svg *ngIf="!isFullscreen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <svg *ngIf="isFullscreen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 16V6m0 0h4M6 6l5 5m7-5h-4m4 0v4m0-4l-5 5m0 6l5-5m-5 5v-4m0 4h4m-4 0l-5-5M6 16h4m-4 0v-4" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6 space-y-6">
            <!-- Common configuration -->
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-200">
                {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.COMMON_CONFIG' | translate }}
              </h3>

              <!-- Labels -->
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-300">
                  {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.APPEARANCE' | translate }}
                </h4>
                <div class="space-y-4 pl-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300">
                      {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.LABEL_FR' | translate }}
                    </label>
                    <input type="text"
                           [(ngModel)]="editedCard.configuration.titles['fr']"
                           class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500">
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300">
                      {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.LABEL_EN' | translate }}
                    </label>
                    <input type="text"
                           [(ngModel)]="editedCard.configuration.titles['en']"
                           class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500">
                  </div>
                </div>
              </div>

              <!-- Layout -->
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-300">
                  {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.LAYOUT' | translate }}
                </h4>
                <div class="space-y-4 pl-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300">
                      {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.GRID_WIDTH' | translate }}
                    </label>
                    <select [(ngModel)]="editedCard.width"
                            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500">
                      <option [value]="3">{{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.GRID_WIDTH_25' | translate }}</option>
                      <option [value]="4">{{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.GRID_WIDTH_33' | translate }}</option>
                      <option [value]="6">{{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.GRID_WIDTH_50' | translate }}</option>
                      <option [value]="8">{{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.GRID_WIDTH_66' | translate }}</option>
                      <option [value]="9">{{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.GRID_WIDTH_75' | translate }}</option>
                      <option [value]="12">{{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.GRID_WIDTH_100' | translate }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Colors -->
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-300">
                  {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.COLORS' | translate }}
                </h4>
                <div class="grid grid-cols-2 gap-4 pl-4">
                  <!-- Background color -->
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300">
                      {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.BACKGROUND_COLOR' | translate }}
                    </label>
                    <input type="color"
                           [(ngModel)]="editedCard.configuration.backgroundColor"
                           class="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg px-2 cursor-pointer">
                  </div>

                  <!-- Text color -->
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300">
                      {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.TEXT_COLOR' | translate }}
                    </label>
                    <input type="color"
                           [(ngModel)]="editedCard.configuration.textColor"
                           class="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg px-2 cursor-pointer">
                  </div>

                  <!-- Header background color -->
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300">
                      {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.HEADER_BACKGROUND_COLOR' | translate }}
                    </label>
                    <input type="color"
                           [(ngModel)]="editedCard.configuration.headerBackgroundColor"
                           class="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg px-2 cursor-pointer">
                  </div>

                  <!-- Header text color -->
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300">
                      {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.HEADER_TEXT_COLOR' | translate }}
                    </label>
                    <input type="color"
                           [(ngModel)]="editedCard.configuration.headerTextColor"
                           class="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg px-2 cursor-pointer">
                  </div>
                </div>
              </div>
            </div>

            <!-- Specific configuration -->
            <div class="space-y-4" *ngIf="buildSpecificConfig()">
              <h3 class="text-lg font-medium text-gray-200">
                {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.SPECIFIC_CONFIG' | translate }}
              </h3>
              <div class="pl-4">
                <ng-content></ng-content>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-900 rounded-b-lg flex justify-end gap-3">
          <button (click)="cancel.emit()"
                  class="px-4 py-2 text-gray-300 hover:text-white">
            {{ 'COMMON.CANCEL' | translate }}
          </button>
          <button (click)="save.emit(editedCard)"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {{ 'COMMON.SAVE' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class BaseCardConfigComponent<T extends DynamicCard> {
  @Input() card!: T;
  @Output() save = new EventEmitter<T>();
  @Output() cancel = new EventEmitter<void>();

  editedCard!: T;
  isFullscreen = false;

  ngOnInit() {
    // Clone the card to avoid modifying the original
    this.editedCard = {
      ...this.card,
      configuration: { ...this.card.configuration }
    };
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  protected buildSpecificConfig(): boolean {
    return false;
  }
} 