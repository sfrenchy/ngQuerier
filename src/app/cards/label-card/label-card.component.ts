import { Component } from '@angular/core';
import { Card } from '@cards/card.decorator';
import { LabelCardConfigurationComponent } from './label-card-configuration.component';
import { BaseCardConfig } from '@models/api.models';
import { BaseCardComponent } from '@cards/base-card.component';
import { CommonModule } from '@angular/common';

export class LabelCardConfig extends BaseCardConfig {
  constructor(public label: string) {
    super();
  }

  toJson(): any {
    return {
      label: this.label
    };
  }

  static fromJson(json: any): LabelCardConfig {
    return new LabelCardConfig(json?.label || 'Label');
  }
}

@Card({
  name: 'Label',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
  </svg>`,
  configComponent: LabelCardConfigurationComponent,
  configType: LabelCardConfig,
  defaultConfig: () => new LabelCardConfig('Label'),
  translationPath: 'label-card'
})
@Component({
  selector: 'app-label-card',
  templateUrl: './label-card.component.html',
  standalone: true,
  imports: [CommonModule, BaseCardComponent]
})
export class LabelCardComponent extends BaseCardComponent<LabelCardConfig> {} 