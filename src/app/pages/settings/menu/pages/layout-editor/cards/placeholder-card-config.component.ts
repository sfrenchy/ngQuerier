import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseCardConfigComponent } from './base-card-config.component';
import { PlaceholderCardConfig } from '@models/api.models';
import { CardConfigService } from './card-config.service';
import { TranslatableStringFormComponent } from '@shared/components/translatable-string-form/translatable-string-form.component';

@Component({
  selector: 'app-placeholder-card-config',
  templateUrl: './placeholder-card-config.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, TranslatableStringFormComponent]
})
export class PlaceholderCardConfigComponent extends BaseCardConfigComponent<PlaceholderCardConfig> implements OnInit {
  labelControl = new FormControl('');

  constructor(
    private cardConfigService: CardConfigService,
    fb: FormBuilder
  ) {
    super(fb);
    this.translations = [];
  }

  override ngOnInit() {
    this.translations = Array.isArray(this.card?.title) ? [...this.card.title] : [];
    
    super.ngOnInit();
    
    if (this.card?.configuration?.label) {
      this.labelControl.setValue(this.card.configuration.label);
    }

    this.form.addControl('configuration', this.fb.group({
      label: this.labelControl
    }));
  }

  override onSave() {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.cardConfigService.emitSave({
        ...this.card,
        ...formValue,
        title: this.translations,
        configuration: {
          label: this.labelControl.value || ''
        }
      });
    }
  }

  override onCancel() {
    this.cardConfigService.emitCancel();
  }
} 