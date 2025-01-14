import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CardDto, BaseCardConfig, TranslatableString } from '@models/api.models';

@Component({
  selector: 'app-base-card-config',
  template: '',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class BaseCardConfigComponent<T extends BaseCardConfig = BaseCardConfig> implements OnInit {
  @Input() card!: CardDto<T>;
  @Output() save = new EventEmitter<CardDto<T>>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  translations: TranslatableString[] = [];

  constructor(protected fb: FormBuilder) {}

  ngOnInit() {
    this.translations = this.card?.title || [];
    
    this.form = this.fb.group({
      gridWidth: [this.card?.gridWidth || 12],
      backgroundColor: [this.card?.backgroundColor || '#ffffff'],
      textColor: [this.card?.textColor || '#000000'],
      headerTextColor: [this.card?.headerTextColor || '#000000'],
      headerBackgroundColor: [this.card?.headerBackgroundColor || '#ffffff']
    });
  }

  onTranslationsChange(translations: TranslatableString[]) {
    this.translations = translations;
  }

  onSave() {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.save.emit({
        ...this.card,
        ...formValue,
        title: this.translations
      } as CardDto<T>);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
} 