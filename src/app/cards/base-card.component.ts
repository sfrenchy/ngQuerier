import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDto, BaseCardConfig } from '@models/api.models';
import { uintToHex } from '../shared/utils/color.utils';
import { CardDatabaseService } from '../services/card-database.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.css'],
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class BaseCardComponent<T extends BaseCardConfig = BaseCardConfig> implements OnInit, OnDestroy {
  @Input() card!: CardDto;
  @Input() isEditing: boolean = false;
  @Input() showFullscreenButton: boolean = false;
  protected _height: number = 0;
  isFullscreen: boolean = false;

  @ViewChild('cardContainer') cardContainer!: ElementRef;

  @Input()
  set height(value: number) {
    if (this._height !== value) {
      this._height = value;
      this.onHeightChange();
    }
  }
  get height(): number {
    return this._height;
  }

  protected _isResizing = false;
  @Input() 
  get isResizing(): boolean {
    return this._isResizing;
  }
  set isResizing(value: boolean) {
    this._isResizing = value;
  }

  @Output() delete = new EventEmitter<void>();
  @Output() configure = new EventEmitter<void>();
  @Output() fullscreenChange = new EventEmitter<boolean>();

  constructor(
    protected cardDatabaseService?: CardDatabaseService,
    protected translateService?: TranslateService
  ) {}

  ngOnInit() {
    // Only load translations for derived components
    if (this.constructor !== BaseCardComponent) {
      this.loadCardTranslations();
    }
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

    // Get the actual class name (works with inherited classes)
    const className = this.constructor.name;
    
    // Remove any number suffix and 'Component' from the name
    const baseName = className.replace(/Component\d*$/, '');
    
    // Convert from PascalCase to kebab-case
    const cardType = baseName
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();

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
          { [cardType]: translations },
          true
        );
      })
      .catch(error => {
        console.warn(`No translations found for card type ${cardType}:`, error);
      });
  }
} 