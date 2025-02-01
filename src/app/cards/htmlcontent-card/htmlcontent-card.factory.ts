import { Injectable } from '@angular/core';
import { CardConfigFactory } from '@cards/card-config.factory';
import { CardValidationService } from '@cards/card-validation.service';
import { HTMLContentCardConfig } from './htmlcontent-card.config';
import { ValidationResult, ValidationError } from '@cards/validation/validation.models';
import { HTMLContentCardComponent } from './htmlcontent-card.component';
import { HTMLContentCardConfigurationComponent } from './htmlcontent-card-configuration.component';

@Injectable({
  providedIn: 'root'
})
export class HTMLContentCardFactory extends CardConfigFactory<HTMLContentCardConfig> {
  constructor(protected override validationService: CardValidationService) {
    super(validationService);
  }

  type = 'htmlcontent';

  getComponent() {
    return HTMLContentCardComponent;
  }

  getConfigurationComponent() {
    return HTMLContentCardConfigurationComponent;
  }

  createDefaultConfig(): HTMLContentCardConfig {
    return new HTMLContentCardConfig();
  }

  override validateConfig(config: HTMLContentCardConfig): ValidationResult {
    const errors: ValidationError[] = [];

    if (!config?.content?.html?.length) {
      errors.push({
        code: 'NO_CONTENT',
        message: 'HTMLCONTENT_CARD.ERRORS.NO_CONTENT',
        controlPath: 'html'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
