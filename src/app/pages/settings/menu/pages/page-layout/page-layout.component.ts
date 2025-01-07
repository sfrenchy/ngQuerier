import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-page-layout',
  template: `
    <div class="p-6">
      <div class="bg-gray-800 rounded-lg shadow-lg text-gray-100 p-6">
        <h2 class="text-2xl font-semibold mb-4">{{ 'MENU.PAGES.LAYOUT.TITLE' | translate }}</h2>
        <p class="text-gray-400">
          {{ 'MENU.PAGES.LAYOUT.COMING_SOON' | translate }}
        </p>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class PageLayoutComponent {} 