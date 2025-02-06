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
        message: 'LINE_CHART_CARD.ERRORS.MISSING_DATASOURCE',
        controlPath: 'datasource'
      });
    } else {
      // Validation spécifique selon le type de source
      switch (config.datasource.type) {
        case 'API':
          if (!config.datasource.connection?.id || !config.datasource.controller?.route) {
            errors.push({
              code: 'INVALID_API_DATASOURCE',
              message: 'LINE_CHART_CARD.ERRORS.INVALID_API_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        case 'SQLQuery':
          if (!config.datasource.query?.id) {
            errors.push({
              code: 'INVALID_SQL_QUERY_DATASOURCE',
              message: 'LINE_CHART_CARD.ERRORS.INVALID_SQL_QUERY_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        case 'EntityFramework':
          if (!config.datasource.context || !config.datasource.entity) {
            errors.push({
              code: 'INVALID_ENTITY_FRAMEWORK_DATASOURCE',
              message: 'LINE_CHART_CARD.ERRORS.INVALID_ENTITY_FRAMEWORK_DATASOURCE',
              controlPath: 'datasource'
            });
          }
          break;
        case 'LocalDataTable':
          if (!config.datasource.localDataTable?.cardId) {
            errors.push({
              code: 'INVALID_LOCAL_TABLE_DATASOURCE',
              message: 'LINE_CHART_CARD.ERRORS.INVALID_LOCAL_TABLE_DATASOURCE',
              controlPath: 'datasource.localDataTable.cardId'
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

    // Validation des colonnes et séries
    if (!config.xAxisColumn) {
      errors.push({
        code: 'MISSING_X_AXIS_COLUMN',
        message: 'LINE_CHART_CARD.ERRORS.MISSING_X_AXIS_COLUMN',
        controlPath: 'xAxisColumn'
      });
    }

    if (!config.series || config.series.length === 0) {
      errors.push({
        code: 'NO_SERIES_DEFINED',
        message: 'LINE_CHART_CARD.ERRORS.NO_SERIES_DEFINED',
        controlPath: 'series'
      });
    } else {
      config.series.forEach((series, index) => {
        if (!series.name || !series.dataColumn) {
          errors.push({
            code: 'INVALID_SERIES_CONFIG',
            message: 'LINE_CHART_CARD.ERRORS.INVALID_SERIES_CONFIG',
            controlPath: `series[${index}]`
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
