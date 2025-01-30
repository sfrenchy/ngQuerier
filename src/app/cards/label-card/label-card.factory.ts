import { Injectable } from '@angular/core';
import { CardConfigFactory } from '@cards/card-config.factory';
import { CardValidationService } from '@cards/card-validation.service';
import { LabelCardConfig } from './label-card.config';
import { TranslatableString } from '@models/api.models';
import { ValidationResult, ValidationError } from '@cards/validation/validation.models';

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

  override validateConfig(config: LabelCardConfig): ValidationResult {
    const errors: ValidationError[] = [];

    if (!config?.content?.text?.length) {
      errors.push({
        code: 'TEXT_REQUIRED',
        message: 'LABEL-CARD.ERRORS.TEXT_REQUIRED',
        controlPath: 'text'
      });
    }

    if (config?.content?.fontSize) {
      if (config.content.fontSize < 8 || config.content.fontSize > 72) {
        errors.push({
          code: 'INVALID_FONT_SIZE',
          message: 'LABEL-CARD.ERRORS.INVALID_FONT_SIZE',
          controlPath: 'fontSize'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
