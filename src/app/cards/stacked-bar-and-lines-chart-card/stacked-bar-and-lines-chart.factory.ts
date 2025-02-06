import { Injectable } from '@angular/core';
import { CardConfigFactory } from '@cards/card-config.factory';
import { CardValidationService } from '@cards/card-validation.service';
import { StackedBarAndLinesChartCardConfig } from './stacked-bar-and-lines-chart.models';
import { ValidationResult, ValidationError } from '@cards/validation/validation.models';

@Injectable({
  providedIn: 'root'
})
export class StackedBarAndLinesChartConfigFactory extends CardConfigFactory<StackedBarAndLinesChartCardConfig> {
  constructor(protected override validationService: CardValidationService) {
    super(validationService);
  }

  createDefaultConfig(): StackedBarAndLinesChartCardConfig {
    return new StackedBarAndLinesChartCardConfig();
  }

  override validateConfig(config: StackedBarAndLinesChartCardConfig): ValidationResult {
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
        message: 'stacked-bar-and-lines-chart-card.VALIDATION.REQUIRED_X_AXIS',
        controlPath: 'xAxisColumn'
      });
    }

    // Validation des séries de barres
    if (!config.barSeries || config.barSeries.length === 0) {
      errors.push({
        code: 'REQUIRED_BAR_SERIES',
        message: 'stacked-bar-and-lines-chart-card.VALIDATION.REQUIRED_BAR_SERIES',
        controlPath: 'barSeries'
      });
    } else {
      config.barSeries.forEach((series, index) => {
        // Validation du nom de la série
        if (!series.name) {
          errors.push({
            code: 'REQUIRED_BAR_SERIES_NAME',
            message: 'stacked-bar-and-lines-chart-card.VALIDATION.REQUIRED_BAR_SERIES_NAME',
            controlPath: `barSeries.${index}.name`
          });
        }

        // Validation de la colonne de données
        if (!series.dataColumn) {
          errors.push({
            code: 'REQUIRED_BAR_SERIES_COLUMN',
            message: 'stacked-bar-and-lines-chart-card.VALIDATION.REQUIRED_BAR_SERIES_COLUMN',
            controlPath: `barSeries.${index}.dataColumn`
          });
        }

        // Validation de la largeur des barres
        if (series.barWidth && (series.barWidth <= 0 || series.barWidth > 100)) {
          errors.push({
            code: 'INVALID_BAR_WIDTH',
            message: 'stacked-bar-and-lines-chart-card.VALIDATION.INVALID_BAR_WIDTH',
            controlPath: `barSeries.${index}.barWidth`
          });
        }
      });
    }

    // Validation des séries de lignes (optionnelles)
    if (config.lineSeries && config.lineSeries.length > 0) {
      config.lineSeries.forEach((series, index) => {
        // Validation du nom de la série
        if (!series.name) {
          errors.push({
            code: 'REQUIRED_LINE_SERIES_NAME',
            message: 'stacked-bar-and-lines-chart-card.VALIDATION.REQUIRED_LINE_SERIES_NAME',
            controlPath: `lineSeries.${index}.name`
          });
        }

        // Validation de la colonne de données
        if (!series.dataColumn) {
          errors.push({
            code: 'REQUIRED_LINE_SERIES_COLUMN',
            message: 'stacked-bar-and-lines-chart-card.VALIDATION.REQUIRED_LINE_SERIES_COLUMN',
            controlPath: `lineSeries.${index}.dataColumn`
          });
        }

        // Validation de la taille des symboles
        if (series.showSymbol && series.symbolSize !== undefined && (series.symbolSize <= 0 || series.symbolSize > 20)) {
          errors.push({
            code: 'INVALID_SYMBOL_SIZE',
            message: 'stacked-bar-and-lines-chart-card.VALIDATION.INVALID_SYMBOL_SIZE',
            controlPath: `lineSeries.${index}.symbolSize`
          });
        }

        // Validation de l'opacité de la zone
        if (series.areaStyle?.opacity !== undefined && (series.areaStyle.opacity < 0 || series.areaStyle.opacity > 1)) {
          errors.push({
            code: 'INVALID_AREA_OPACITY',
            message: 'stacked-bar-and-lines-chart-card.VALIDATION.INVALID_AREA_OPACITY',
            controlPath: `lineSeries.${index}.areaStyle.opacity`
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
