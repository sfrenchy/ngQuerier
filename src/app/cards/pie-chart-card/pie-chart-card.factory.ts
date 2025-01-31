import { Injectable } from '@angular/core';
import { CardConfigFactory } from '@cards/card-config.factory';
import { CardValidationService } from '@cards/card-validation.service';
import { PieChartCardConfig } from './pie-chart-card.models';
import { ValidationResult, ValidationError } from '@cards/validation/validation.models';

@Injectable({
  providedIn: 'root'
})
export class PieChartCardConfigFactory extends CardConfigFactory<PieChartCardConfig> {
  constructor(protected override validationService: CardValidationService) {
    super(validationService);
  }

  createDefaultConfig(): PieChartCardConfig {
    return new PieChartCardConfig();
  }

  override validateConfig(config: PieChartCardConfig): ValidationResult {
    const errors: ValidationError[] = [];

    // Validation de la datasource
    if (!config.datasource?.connection?.id || !config.datasource?.controller?.route) {
      errors.push({
        code: 'INVALID_DATASOURCE',
        message: 'PieChart.VALIDATION.INVALID_DATASOURCE',
        controlPath: 'datasource'
      });
    }

    // Validation de la colonne des étiquettes
    if (!config.labelColumn) {
      errors.push({
        code: 'REQUIRED_LABEL_COLUMN',
        message: 'PieChart.VALIDATION.REQUIRED_LABEL_COLUMN',
        controlPath: 'labelColumn'
      });
    }

    // Validation de la colonne des valeurs
    if (!config.valueColumn) {
      errors.push({
        code: 'REQUIRED_VALUE_COLUMN',
        message: 'PieChart.VALIDATION.REQUIRED_VALUE_COLUMN',
        controlPath: 'valueColumn'
      });
    }

    // Validation du rayon (optionnel mais doit être un pourcentage valide si présent)
    if (config.radius && !config.radius.match(/^\d+%$/)) {
      errors.push({
        code: 'INVALID_RADIUS',
        message: 'PieChart.VALIDATION.INVALID_RADIUS',
        controlPath: 'radius'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
