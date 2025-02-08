import { TranslatableString } from './../../models/api.models';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Card } from '@cards/card.decorator';
import { LabelCardConfigurationComponent } from './label-card-configuration.component';
import { BaseCardComponent } from '@cards/base/base-card.component';
import { CommonModule } from '@angular/common';
import { LabelCardConfigFactory } from './label-card.factory';
import { LabelCardConfig } from './label-card.config';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { CardConfigAdapterService } from '@cards/card-config-adapter.service';
@Card({
  name: 'Label',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
  </svg>`,
  configComponent: LabelCardConfigurationComponent,
  configFactory: LabelCardConfigFactory,
  defaultConfig: () => new LabelCardConfig(),
  translationPath: 'label-card'
})
@Component({
  selector: 'app-label-card',
  templateUrl: './label-card.component.html',
  standalone: true,
  imports: [CommonModule, BaseCardComponent, TranslateModule]
})
export class LabelCardComponent extends BaseCardComponent<LabelCardConfig> implements OnInit, OnDestroy{
  constructor(
    protected override translateService: TranslateService,
    protected override cardConfigAdapter: CardConfigAdapterService,
    private cdr: ChangeDetectorRef
  ) {
    super(translateService, cardConfigAdapter);
    this.currentLanguage = this.translateService.currentLang;

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.currentLanguage = event.lang;
        this.cdr.detectChanges();
      });
  }

  destroy$ = new Subject<void>();
  currentLanguage: string;

  getTranslatedText(): string {
    return this.card.configuration?.content.text.find((t: TranslatableString) => t.languageCode === this.currentLanguage)?.value || this.card.configuration?.content.text[0].value || 'Label';
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

