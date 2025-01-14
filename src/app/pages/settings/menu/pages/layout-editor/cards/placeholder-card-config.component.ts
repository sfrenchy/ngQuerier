import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseCardConfigComponent } from './base-card-config.component';
import { PlaceholderCardConfig } from '@models/api.models';

@Component({
  selector: 'app-placeholder-card-config',
  templateUrl: './placeholder-card-config.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PlaceholderCardConfigComponent extends BaseCardConfigComponent<PlaceholderCardConfig> {
  override getSpecificControls() {
    return {
      config: this.fb.group({
        label: [this.card.config?.label || '', []]
      })
    };
  }
} 