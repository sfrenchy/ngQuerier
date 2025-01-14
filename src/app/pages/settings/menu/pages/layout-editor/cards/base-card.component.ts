import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { CardDto, BaseCardConfig } from '@models/api.models';
import { CardConfigDialogComponent } from './card-config-dialog.component';

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  standalone: true,
  imports: [CommonModule, CardConfigDialogComponent]
})
export class BaseCardComponent<T extends BaseCardConfig = BaseCardConfig> {
  @Input() card!: CardDto<T>;
  @Input() config!: T;
  @Output() delete = new EventEmitter<void>();
  @Output() configurationChange = new EventEmitter<CardDto<T>>();

  showConfigDialog = false;

  constructor(private translate: TranslateService) {}

  getTitle(): string {
    const currentLangTitle = this.card.title.find(t => t.languageCode === this.translate.currentLang);
    if (currentLangTitle) {
      return currentLangTitle.value;
    }
    
    const frTitle = this.card.title.find(t => t.languageCode === 'fr');
    if (frTitle) {
      return frTitle.value;
    }

    return 'Sans titre';
  }

  onConfigureClick() {
    this.showConfigDialog = true;
  }

  onDeleteClick() {
    this.delete.emit();
  }

  onConfigSave(updatedCard: CardDto<BaseCardConfig>) {
    this.showConfigDialog = false;
    this.configurationChange.emit(updatedCard as unknown as CardDto<T>);
  }

  onConfigCancel() {
    this.showConfigDialog = false;
  }
} 