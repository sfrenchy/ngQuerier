import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCardComponent } from '@cards/base/base-card.component';
import { Card } from '@cards/card.decorator';
import { HTMLContentCardConfigurationComponent } from './htmlcontent-card-configuration.component';
import { HTMLContentCardFactory } from './htmlcontent-card.factory';
import { HTMLContentCardConfig } from './htmlcontent-card.config';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

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
  standalone: true,
  imports: [CommonModule, BaseCardComponent, TranslateModule]
})
export class HTMLContentCardComponent extends BaseCardComponent<HTMLContentCardConfig> implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  currentLanguage: string;

  constructor(protected override translateService: TranslateService) {
    super(translateService);
    this.currentLanguage = this.translateService.currentLang;

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.currentLanguage = event.lang;
      });
  }

  getTranslatedHtml(): string {
    return this.card.configuration?.content.html?.find((t: { languageCode: string }) => t.languageCode === this.currentLanguage)?.value || '';
  }

  override ngOnInit() {
    super.ngOnInit();
    this.loadCardTranslations();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
