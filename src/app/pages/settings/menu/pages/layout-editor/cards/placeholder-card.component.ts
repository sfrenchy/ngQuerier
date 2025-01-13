import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseCardComponent } from './base-card.component';
import { Card } from './card.decorator';

interface PlaceholderConfig {
  label: string;
}

@Card({
  type: 'placeholder',
  title: 'Placeholder',
  icon: 'M4 5a2 2 0 012-2h6a2 2 0 012 2v2H4V5zm8 4H4v6a2 2 0 002 2h6a2 2 0 002-2V9h-2z'
})
@Component({
  selector: 'app-placeholder-card',
  template: `
    <div class="flex items-center justify-center h-full text-gray-500">
      {{label}}
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class PlaceholderCardComponent extends BaseCardComponent {
  get label(): string {
    return (this.card.config as PlaceholderConfig)?.label || 'Placeholder';
  }

  override getConfigForm(): FormGroup {
    return new FormBuilder().group({
      label: [this.label, Validators.required]
    });
  }

  override getCardType(): string {
    return 'placeholder';
  }
} 