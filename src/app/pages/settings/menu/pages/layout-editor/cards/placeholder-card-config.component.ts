import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BaseCardConfigComponent } from './base-card-config.component';
import { PlaceholderCardConfig, CardDto } from '@models/api.models';
import { CardConfigService } from './card-config.service';

@Component({
  selector: 'app-placeholder-card-config',
  templateUrl: './placeholder-card-config.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseCardConfigComponent, TranslateModule]
})
export class PlaceholderCardConfigComponent extends BaseCardConfigComponent<PlaceholderCardConfig> implements OnInit {
  labelControl = new FormControl('');

  constructor(
    private cardConfigService: CardConfigService,
    private fb: FormBuilder
  ) {
    super();
  }

  ngOnInit() {
    if (this.card?.config?.label) {
      this.labelControl.setValue(this.card.config.label);
    }

    this.form = this.fb.group({
      title: [this.card?.title || ''],
      gridWidth: [this.card?.gridWidth || 12],
      backgroundColor: [this.card?.backgroundColor || '#ffffff'],
      config: this.fb.group({
        label: this.labelControl
      })
    });
  }

  onSave() {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.cardConfigService.emitSave({
        ...this.card,
        ...formValue,
        config: {
          label: this.labelControl.value || ''
        }
      } as CardDto<PlaceholderCardConfig>);
    }
  }

  onCancel() {
    this.cardConfigService.emitCancel();
  }
} 