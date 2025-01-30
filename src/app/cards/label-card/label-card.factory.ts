import { Injectable } from '@angular/core';
import { CardConfigFactory } from '@services/card-config.factory';
import { CardValidationService } from '@services/card-validation.service';
import { LabelCardConfig } from './label-card.config';

@Injectable({
  providedIn: 'root'
})
export class LabelCardConfigFactory extends CardConfigFactory<LabelCardConfig> {
  constructor(protected override validationService: CardValidationService) {
    super(validationService);
  }

  createDefaultConfig(): LabelCardConfig {
    return new LabelCardConfig();
  }

  override validateConfig(config: LabelCardConfig): boolean {
    if (!super.validateConfig(config)) return false;
    return !!config.content && Array.isArray(config.content.text);
  }
} 