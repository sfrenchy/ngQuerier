import {Injectable} from '@angular/core';
import {CardConfigFactory} from '@cards/card-config.factory';
import {CardValidationService} from '@cards/card-validation.service';
import {PieChartCardConfig} from './pie-chart-card.models';
import {ValidationError, ValidationResult} from '@cards/validation/validation.models';

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
    if (!config.datasource) {
      errors.push({
        code: 'MISSING_DATASOURCE',
        message: 'DATA_TABLE_CARD.ERRORS.MISSING_DATASOURCE',
        controlPath: 'datasource'
      });
    } else {
      switch (config.datasource.type) {
        case 'API':
          if (!config.datasource.connection?.id || !config.datasource.controller?.route) {
            errors.push({
              code: 'INVALID_API_DATASOURCE',
              message: 'DATA_TABLE_CARD.ERRORS.INVALID_API_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        case 'SQLQuery':
          if (!config.datasource.query?.id) {
            errors.push({
              code: 'INVALID_SQL_QUERY_DATASOURCE',
              message: 'DATA_TABLE_CARD.ERRORS.INVALID_SQL_QUERY_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        case 'LocalDataTable':
          if (!config.datasource.localDataTable?.cardId) {
            errors.push({
              code: 'INVALID_LOCAL_DATA_TABLE_DATASOURCE',
              message: 'DATA_TABLE_CARD.ERRORS.INVALID_LOCAL_DATA_TABLE_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        case 'EntityFramework':
          if (!config.datasource.context || !config.datasource.entity) {
            errors.push({
              code: 'INVALID_ENTITY_FRAMEWORK_DATASOURCE',
              message: 'DATA_TABLE_CARD.ERRORS.INVALID_ENTITY_FRAMEWORK_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        default:
          errors.push({
            code: 'INVALID_DATASOURCE_TYPE',
            message: 'DATA_TABLE_CARD.ERRORS.INVALID_DATASOURCE_TYPE',
            controlPath: 'datasource.type'
          });
      }
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
