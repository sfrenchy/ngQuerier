import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDto, BaseCardConfig } from '@models/api.models';
import { uintToHex } from '../../shared/utils/color.utils';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.css'],
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class BaseCardComponent<T extends BaseCardConfig> implements OnInit, OnDestroy {
  @Input() card!: CardDto;
  @Input() isEditing: boolean = false;
  @Input() showFullscreenButton: boolean = false;
  @Input() height: number = 0;
  isFullscreen: boolean = false;

  @ViewChild('cardContainer') cardContainer!: ElementRef;

  @HostBinding('class') get hostClasses(): string {
    return 'flex flex-col h-full';
  }

  @Output() delete = new EventEmitter<void>();
  @Output() configure = new EventEmitter<void>();
  @Output() fullscreenChange = new EventEmitter<boolean>();

  constructor(
    protected translateService: TranslateService
  ) {}

  ngOnInit() {
    this.onHeightChange();
  }

  ngOnDestroy() {}

  protected onHeightChange() {
    if (this.isFullscreen) {
      this.fullscreenChange.emit(true);
    }
  }

  get backgroundColor(): string {
    return uintToHex(this.card.backgroundColor);
  }

  get textColor(): string {
    return uintToHex(this.card.textColor);
  }

  get headerTextColor(): string {
    return uintToHex(this.card.headerTextColor);
  }

  get headerBackgroundColor(): string {
    return uintToHex(this.card.headerBackgroundColor);
  }

  onConfigure() {
    this.configure.emit();
  }

  onDelete() {
    this.delete.emit();
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.fullscreenChange.emit(this.isFullscreen);
  }

  protected loadCardTranslations() {
    if (!this.translateService) return;

    // Get the translation path from the card decorator
    const cardType = (this.constructor as any).cardConfig.translationPath;

    // Initialize empty translation object for the card type
    this.translateService.setTranslation(
      this.translateService.currentLang,
      { [cardType]: {} },
      true
    );

    // Load card-specific translations from its i18n folder
    fetch(`assets/app/cards/${cardType}/i18n/${this.translateService.currentLang}.json`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(translations => {
        this.translateService?.setTranslation(
          this.translateService.currentLang,
          translations,
          true
        );
      })
      .catch(error => {
        console.warn(`No translations found for card type ${cardType}:`, error);
      });
  }
} 