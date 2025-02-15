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
    console.log('Validation - config reçue:', config); // Debug

    const errors: ValidationError[] = [];

    // Validation de la datasource
    if (!config.datasource) {
      errors.push({
        code: 'MISSING_DATASOURCE',
        message: 'PieChart.VALIDATION.INVALID_DATASOURCE',
        controlPath: 'datasource'
      });
    } else {
      console.log('Validation - type de datasource:', config.datasource.type); // Debug
      console.log('Validation - query:', config.datasource.query); // Debug

      // Vérifier d'abord si les colonnes sont sélectionnées
      const hasRequiredColumns = config.labelColumn && config.valueColumn;

      switch (config.datasource.type) {
        case 'API':
          if (!config.datasource.connection?.id || !config.datasource.controller?.route) {
            errors.push({
              code: 'INVALID_API_DATASOURCE',
              message: 'PieChart.VALIDATION.INVALID_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        case 'SQLQuery':
          // Pour une requête SQL, on vérifie seulement si une requête est sélectionnée
          if (!config.datasource.query?.id) {
            errors.push({
              code: 'INVALID_SQL_QUERY_DATASOURCE',
              message: 'PieChart.VALIDATION.INVALID_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        case 'LocalDataTable':
          if (!config.datasource.localDataTable?.cardId) {
            errors.push({
              code: 'INVALID_LOCAL_DATA_TABLE_DATASOURCE',
              message: 'PieChart.VALIDATION.INVALID_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        case 'EntityFramework':
          if (!config.datasource.context || !config.datasource.entity) {
            errors.push({
              code: 'INVALID_ENTITY_FRAMEWORK_DATASOURCE',
              message: 'PieChart.VALIDATION.INVALID_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        default:
          errors.push({
            code: 'INVALID_DATASOURCE_TYPE',
            message: 'PieChart.VALIDATION.INVALID_DATASOURCE',
            controlPath: 'datasource.type'
          });
      }

      // Si la source de données est valide, vérifier les colonnes
      if (errors.length === 0) {
        if (!config.labelColumn) {
          errors.push({
            code: 'REQUIRED_LABEL_COLUMN',
            message: 'PieChart.VALIDATION.REQUIRED_LABEL_COLUMN',
            controlPath: 'labelColumn'
          });
        }
        if (!config.valueColumn) {
          errors.push({
            code: 'REQUIRED_VALUE_COLUMN',
            message: 'PieChart.VALIDATION.REQUIRED_VALUE_COLUMN',
            controlPath: 'valueColumn'
          });
        }
      }
    }

    // Validation du rayon (optionnel)
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
