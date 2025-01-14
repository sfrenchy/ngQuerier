import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlaceholderCardConfig } from '@models/api.models';
import { CardConfigService } from './card-config.service';
import { BaseCardConfigComponent } from './base-card-config.component';

@Component({
  selector: 'app-placeholder-card-config',
  templateUrl: './placeholder-card-config.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PlaceholderCardConfigComponent extends BaseCardConfigComponent<PlaceholderCardConfig> {
  override form: FormGroup;
  labelControl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private cardConfigService: CardConfigService
  ) {
    super();
    this.form = this.fb.group({
      title: ['', []],
      gridWidth: [1, []],
      backgroundColor: ['#ffffff', []],
      config: this.fb.group({
        label: this.labelControl
      })
    });
  }

  onSave(formValue: any): void {
    if (this.form.valid) {
      const updatedCard = {
        ...this.card,
        ...formValue
      };
      this.save.emit(updatedCard);
      this.cardConfigService.emitSave(updatedCard);
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.cardConfigService.emitCancel();
  }
} 