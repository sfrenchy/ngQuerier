import { Component, Input, Output, EventEmitter, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TranslatableStringFormComponent } from '@shared/components/translatable-string-form/translatable-string-form.component';
import { BaseCardConfig, CardDto, TranslatableString } from '@models/api.models';
import { CardService } from './card.service';

@Component({
  selector: 'app-base-card-config',
  templateUrl: './base-card-config.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, TranslatableStringFormComponent]
})
export abstract class BaseCardConfigComponent<T extends BaseCardConfig = BaseCardConfig> implements OnInit {
  @Input() card!: CardDto<T>;
  @Output() save = new EventEmitter<CardDto<T>>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  translations: TranslatableString[] = [];
  isGeneralExpanded = true;
  isSpecificExpanded = true;
  specificConfigComponent: any;

  constructor(
    protected fb: FormBuilder,
    protected cardService: CardService,
    public injector: Injector
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      gridWidth: [this.card.gridWidth || 6],
      backgroundColor: [this.card.backgroundColor || '#ffffff'],
      textColor: [this.card.textColor || '#000000'],
      headerBackgroundColor: [this.card.headerBackgroundColor || '#ffffff'],
      headerTextColor: [this.card.headerTextColor || '#000000'],
      configuration: this.fb.group({})
    });

    if (this.card.title) {
      this.translations = this.card.title;
    }
  }

  onTranslationsChange(translations: any[]) {
    this.translations = translations;
  }

  onSave() {
    if (this.form.valid) {
      this.save.emit({
        ...this.card,
        title: this.translations,
        ...this.form.value
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
} 