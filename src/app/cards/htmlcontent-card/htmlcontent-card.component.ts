import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseCardComponent } from '@cards/base/base-card.component';
import { Card } from '@cards/card.decorator';
import { HTMLContentCardConfigurationComponent } from './htmlcontent-card-configuration.component';
import { HTMLContentCardFactory } from './htmlcontent-card.factory';
import { HTMLContentCardConfig } from './htmlcontent-card.config';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { AngularEditorModule, AngularEditorConfig } from '@kolkov/angular-editor';
import { CardDto } from '@models/api.models';

@Card({
  name: 'HTML Content',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
  </svg>`,
  configComponent: HTMLContentCardConfigurationComponent,
  configFactory: HTMLContentCardFactory,
  defaultConfig: () => new HTMLContentCardConfig(),
  translationPath: 'htmlcontent-card'
})
@Component({
  selector: 'app-htmlcontent-card',
  templateUrl: './htmlcontent-card.component.html',
  styleUrls: ['./htmlcontent-card.component.scss'],
  standalone: true,
  imports: [CommonModule, BaseCardComponent, TranslateModule, AngularEditorModule, FormsModule]
})
export class HTMLContentCardComponent extends BaseCardComponent<HTMLContentCardConfig> implements OnInit, OnDestroy, OnChanges {
  destroy$ = new Subject<void>();
  currentLanguage: string;
  htmlContent = '';

  viewerConfig: AngularEditorConfig = {
    editable: false,
    showToolbar: false,
    translate: 'no',
    enableToolbar: false,
    sanitize: false,
    height: 'auto',
    minHeight: '0',
    outline: false,
  };

  constructor(protected override translateService: TranslateService) {
    super(translateService);
    this.currentLanguage = this.translateService.currentLang;

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.currentLanguage = event.lang;
        if (this.card) {
          this.updateHtmlContent();
        }
      });
  }

  override ngOnInit() {
    super.ngOnInit();
    this.loadCardTranslations();
    if (this.card) {
      this.updateHtmlContent();
      this.updateEditorBackground();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['card'] && !changes['card'].firstChange) {
      this.updateHtmlContent();
      this.updateEditorBackground();
    }
  }

  private updateHtmlContent() {
    if (this.card?.configuration) {
      this.htmlContent = this.card.configuration.content.html?.find(
        (t: { languageCode: string }) => t.languageCode === this.currentLanguage
      )?.value || '';
    }
  }

  private getBackgroundColor(): string {
    const r = (this.card.backgroundColor >> 16) & 255;
    const g = (this.card.backgroundColor >> 8) & 255;
    const b = this.card.backgroundColor & 255;
    return `rgb(${r} ${g} ${b})`;
  }

  private updateEditorBackground() {
    if (this.card?.backgroundColor) {
      const r = (this.card.backgroundColor >> 16) & 255;
      const g = (this.card.backgroundColor >> 8) & 255;
      const b = this.card.backgroundColor & 255;
      document.documentElement.style.setProperty('--editor-bg-color', `rgb(${r} ${g} ${b})`);

      // Calcul de la luminosité pour déterminer si le texte doit être clair ou foncé
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const textColor = luminance > 0.5 ? 'rgb(17 24 39)' : 'rgb(209 213 219)';
      document.documentElement.style.setProperty('--editor-text-color', textColor);
    } else {
      document.documentElement.style.setProperty('--editor-bg-color', 'rgb(17 24 39)');
      document.documentElement.style.setProperty('--editor-text-color', 'rgb(209 213 219)');
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
