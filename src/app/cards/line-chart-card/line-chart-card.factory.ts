import { Injectable } from '@angular/core';
import { CardConfigFactory } from '@cards/card-config.factory';
import { CardValidationService } from '@cards/card-validation.service';
import { LineChartCardConfig } from './line-chart-card.models';
import { ValidationResult, ValidationError } from '@cards/validation/validation.models';

@Injectable({
  providedIn: 'root'
})
export class LineChartCardConfigFactory extends CardConfigFactory<LineChartCardConfig> {
  constructor(protected override validationService: CardValidationService) {
    super(validationService);
  }

  createDefaultConfig(): LineChartCardConfig {
    return new LineChartCardConfig();
  }

  override validateConfig(config: LineChartCardConfig): ValidationResult {
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

    // Validation de l'axe X
    if (!config.xAxisColumn) {
      errors.push({
        code: 'REQUIRED_X_AXIS',
        message: 'line-chart-card.CONFIGURATION.VALIDATION.REQUIRED_X_AXIS',
        controlPath: 'xAxisColumn'
      });
    }

    // Validation des séries
    if (!config.series || config.series.length === 0) {
      errors.push({
        code: 'REQUIRED_SERIES',
        message: 'line-chart-card.CONFIGURATION.VALIDATION.REQUIRED_SERIES',
        controlPath: 'series'
      });
    } else {
      config.series.forEach((series, index) => {
        // Validation du nom de la série
        if (!series.name) {
          errors.push({
            code: 'REQUIRED_SERIES_NAME',
            message: 'line-chart-card.CONFIGURATION.VALIDATION.REQUIRED_SERIES_NAME',
            controlPath: `series.${index}.name`
          });
        }

        // Validation de la colonne de données
        if (!series.dataColumn) {
          errors.push({
            code: 'REQUIRED_SERIES_COLUMN',
            message: 'line-chart-card.CONFIGURATION.VALIDATION.REQUIRED_SERIES_COLUMN',
            controlPath: `series.${index}.dataColumn`
          });
        }

        // Validation de la taille des symboles
        if (series.showSymbol && (series.symbolSize ?? 0) <= 0) {
          errors.push({
            code: 'INVALID_SYMBOL_SIZE',
            message: 'line-chart-card.CONFIGURATION.VALIDATION.INVALID_SYMBOL_SIZE',
            controlPath: `series.${index}.symbolSize`
          });
        }

        // Validation de l'opacité de la zone
        if (series.areaStyle && (series.areaStyle.opacity < 0 || series.areaStyle.opacity > 1)) {
          errors.push({
            code: 'INVALID_AREA_OPACITY',
            message: 'line-chart-card.CONFIGURATION.VALIDATION.INVALID_AREA_OPACITY',
            controlPath: `series.${index}.areaStyle.opacity`
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
