import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  template: `
    <div class="relative">
      <button 
        (click)="isOpen = !isOpen"
        class="flex items-center p-1.5 rounded-full hover:bg-background-hover transition-colors bg-background border border-border"
        [title]="getCurrentLanguage().name">
        <span class="text-lg leading-none">{{ getCurrentLanguage().flag }}</span>
      </button>

      <!-- Dropdown Menu -->
      <div *ngIf="isOpen" 
           class="absolute right-0 mt-2 py-1 bg-background rounded-lg shadow-lg z-50 border border-border">
        <button *ngFor="let lang of languages"
                (click)="setLanguage(lang.code)"
                class="block p-1.5 hover:bg-background-hover transition-colors w-full"
                [title]="lang.name">
          <span class="text-lg leading-none">{{ lang.flag }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [],
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class LanguageSelectorComponent {
  languages: Language[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];
  currentLang: string;
  isOpen = false;

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang();
  }

  getCurrentLanguage(): Language {
    return this.languages.find(lang => lang.code === this.currentLang) || this.languages[0];
  }

  setLanguage(code: string): void {
    this.currentLang = code;
    this.translate.use(code);
    localStorage.setItem('language', code);
    this.isOpen = false;
  }
} 