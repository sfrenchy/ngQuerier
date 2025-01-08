import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlaceholderCard } from '@models/page-layout.models';
import { BaseCardConfigComponent } from '@components/base-card-config/base-card-config.component';

@Component({
  selector: 'app-placeholder-card-config',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-700">
          <h2 class="text-xl font-semibold text-gray-200">
            {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.TITLE' | translate }}
          </h2>
        </div>

        <!-- Content -->
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
                         [(ngModel)]="editedCard.titles['fr']"
                         class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500">
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-300">
                    {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.LABEL_EN' | translate }}
                  </label>
                  <input type="text"
                         [(ngModel)]="editedCard.titles['en']"
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
                  <select [(ngModel)]="editedCard.gridWidth"
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
                         [(ngModel)]="editedCard.backgroundColor"
                         class="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg px-2 cursor-pointer">
                </div>

                <!-- Text color -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-300">
                    {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.TEXT_COLOR' | translate }}
                  </label>
                  <input type="color"
                         [(ngModel)]="editedCard.textColor"
                         class="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg px-2 cursor-pointer">
                </div>

                <!-- Header background color -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-300">
                    {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.HEADER_BACKGROUND_COLOR' | translate }}
                  </label>
                  <input type="color"
                         [(ngModel)]="editedCard.headerBackgroundColor"
                         class="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg px-2 cursor-pointer">
                </div>

                <!-- Header text color -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-300">
                    {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.HEADER_TEXT_COLOR' | translate }}
                  </label>
                  <input type="color"
                         [(ngModel)]="editedCard.headerTextColor"
                         class="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg px-2 cursor-pointer">
                </div>
              </div>
            </div>
          </div>

          <!-- Placeholder specific configuration -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-200">
              {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.SPECIFIC_CONFIG' | translate }}
            </h3>
            <div class="pl-4 space-y-4">
              <div class="flex items-center gap-2">
                <input type="checkbox"
                       [(ngModel)]="editedCard.configuration.showHeader"
                       class="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-600">
                <label class="text-sm font-medium text-gray-300">
                  {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.SHOW_HEADER' | translate }}
                </label>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox"
                       [(ngModel)]="editedCard.configuration.showFooter"
                       class="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-600">
                <label class="text-sm font-medium text-gray-300">
                  {{ 'MENU.PAGES.LAYOUT.CARD_CONFIG.SHOW_FOOTER' | translate }}
                </label>
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
export class PlaceholderCardConfigComponent extends BaseCardConfigComponent<PlaceholderCard> {} 