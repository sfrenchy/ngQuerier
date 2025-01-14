import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCardComponent } from './base-card.component';
import { PlaceholderCardConfig } from '@models/api.models';
import { Card } from './card.decorator';
import { PlaceholderCardConfigComponent } from './placeholder-card-config.component';
import { CardConfigDialogComponent } from './card-config-dialog.component';

@Card<PlaceholderCardConfig>({
  type: 'placeholder',
  title: 'Placeholder',
  icon: 'M4 5a2 2 0 012-2h6a2 2 0 012 2v2H4V5zm8 4H4v6a2 2 0 002 2h6a2 2 0 002-2V9h-2z',
  configComponent: PlaceholderCardConfigComponent,
  configFactory: PlaceholderCardConfig.fromJson
})
@Component({
  selector: 'app-placeholder-card',
  templateUrl: './placeholder-card.component.html',
  standalone: true,
  imports: [CommonModule, CardConfigDialogComponent]
})
export class PlaceholderCardComponent extends BaseCardComponent<PlaceholderCardConfig> {
  get label(): string {
    return this.config.label || 'Placeholder';
  }
} 