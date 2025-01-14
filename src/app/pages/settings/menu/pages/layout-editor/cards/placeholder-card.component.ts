import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCardComponent } from './base-card.component';
import { Card } from './card.decorator';
import { PlaceholderCardConfig } from '@models/api.models';

@Card({
  type: 'placeholder',
  title: 'Placeholder',
  icon: 'M4 5a2 2 0 012-2h6a2 2 0 012 2v2H4V5zm8 4H4v6a2 2 0 002 2h6a2 2 0 002-2V9h-2z',
  configFactory: PlaceholderCardConfig.fromJson
})
@Component({
  selector: 'app-placeholder-card',
  template: `
    <div class="h-full flex items-center justify-center">
      <span class="text-gray-500">{{label}}</span>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class PlaceholderCardComponent extends BaseCardComponent<PlaceholderCardConfig> {
  get label(): string {
    return this.config?.label || 'Placeholder';
  }
} 