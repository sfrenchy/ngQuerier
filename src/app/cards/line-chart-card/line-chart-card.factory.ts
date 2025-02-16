import {Injectable} from '@angular/core';
import {CardConfigFactory} from '@cards/card-config.factory';
import {CardValidationService} from '@cards/card-validation.service';
import {LineChartCardConfig} from './line-chart-card.models';
import {ValidationError, ValidationResult} from '@cards/validation/validation.models';
import {LocalDataSourceService} from '@cards/data-table-card/local-datasource.service';

@Injectable({
  providedIn: 'root'
})
export class LineChartCardConfigFactory extends CardConfigFactory<LineChartCardConfig> {
  constructor(protected override validationService: CardValidationService, private localDataSourceService: LocalDataSourceService) {
    super(validationService);
  }

  createDefaultConfig(): LineChartCardConfig {
    return new LineChartCardConfig();
  }

  override validateConfig(config: LineChartCardConfig): ValidationResult {
    const errors: ValidationError[] = [];

    // Validation de base existante
    if (!config.datasource) {
      errors.push({
        code: 'MISSING_DATASOURCE',
        message: 'LINE_CHART_CARD.ERRORS.MISSING_DATASOURCE',
        controlPath: 'datasource'
      });
      return {isValid: false, errors};
    }

    // Validation spécifique pour LocalDataTable
    if (config.datasource.type === 'LocalDataTable') {
      const cardId = config.datasource.localDataTable?.cardId;
      if (!cardId) {
        errors.push({
          code: 'MISSING_TABLE',
          message: 'LINE_CHART_CARD.ERRORS.MISSING_TABLE',
          controlPath: 'datasource.localDataTable.cardId'
        });
      } else {
        const schema = this.localDataSourceService.getTableSchema(cardId);
        if (!schema) {
          errors.push({
            code: 'TABLE_NOT_FOUND',
            message: 'LINE_CHART_CARD.ERRORS.TABLE_NOT_FOUND',
            controlPath: 'datasource.localDataTable.cardId'
          });
        } else {
          // Validation de l'axe X
          if (config.xAxisColumn) {
            const xAxisProp = schema.properties[config.xAxisColumn];
            if (!xAxisProp) {
              errors.push({
                code: 'INVALID_X_AXIS',
                message: 'LINE_CHART_CARD.ERRORS.INVALID_X_AXIS',
                controlPath: 'xAxisColumn'
              });
            }
          }

          // Validation des séries
          config.series?.forEach((series, index) => {
            const prop = schema.properties[series.dataColumn];
            if (!prop) {
              errors.push({
                code: 'INVALID_SERIES_COLUMN',
                message: 'LINE_CHART_CARD.ERRORS.INVALID_SERIES_COLUMN',
                controlPath: `series.${index}.dataColumn`
              });
            } else if (!['number', 'integer'].includes(prop.type)) {
              errors.push({
                code: 'INVALID_SERIES_COLUMN_TYPE',
                message: 'LINE_CHART_CARD.ERRORS.INVALID_SERIES_COLUMN_TYPE',
                controlPath: `series.${index}.dataColumn`
              });
            }
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
