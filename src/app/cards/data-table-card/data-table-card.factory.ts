import { Injectable } from '@angular/core';
import { CardConfigFactory } from '@cards/card-config.factory';
import { CardValidationService } from '@cards/card-validation.service';
import { DataTableCardConfig } from './data-table-card.models';
import { ValidationResult, ValidationError } from '@cards/validation/validation.models';

@Injectable({
  providedIn: 'root'
})
export class DataTableCardConfigFactory extends CardConfigFactory<DataTableCardConfig> {
  constructor(protected override validationService: CardValidationService) {
    super(validationService);
  }

  createDefaultConfig(): DataTableCardConfig {
    return new DataTableCardConfig();
  }

  override validateConfig(config: DataTableCardConfig): ValidationResult {
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
        case 'LocalDataTable':
          if (!config.datasource.localDataTable?.cardId) {
            errors.push({
              code: 'INVALID_LOCAL_TABLE_DATASOURCE',
              message: 'DATA_TABLE_CARD.ERRORS.INVALID_LOCAL_TABLE_DATASOURCE',
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

    // Validation des colonnes
    if (config.columns) {
      config.columns.forEach((column, index) => {
        if (!column.key) {
          errors.push({
            code: 'COLUMN_KEY_REQUIRED',
            message: 'DATA_TABLE_CARD.ERRORS.COLUMN_KEY_REQUIRED',
            controlPath: `columns.${index}.key`
          });
        }

        if (column.decimals !== undefined && column.decimals < 0) {
          errors.push({
            code: 'INVALID_DECIMALS',
            message: 'DATA_TABLE_CARD.ERRORS.INVALID_DECIMALS',
            controlPath: `columns.${index}.decimals`
          });
        }
      });
    }

    // Validation des couleurs dans visualConfig
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(config.visualConfig.headerBackgroundColor)) {
      errors.push({
        code: 'INVALID_COLOR',
        message: 'DATA_TABLE_CARD.ERRORS.INVALID_HEADER_BG_COLOR',
        controlPath: 'visualConfig.headerBackgroundColor'
      });
    }

    if (!colorRegex.test(config.visualConfig.rowBackgroundColor)) {
      errors.push({
        code: 'INVALID_COLOR',
        message: 'DATA_TABLE_CARD.ERRORS.INVALID_ROW_BG_COLOR',
        controlPath: 'visualConfig.rowBackgroundColor'
      });
    }

    // Validation de la configuration CRUD
    if (config.crudConfig.canAdd || config.crudConfig.canUpdate || config.crudConfig.canDelete) {
      if (!config.datasource?.connection?.id) {
        errors.push({
          code: 'CRUD_REQUIRES_DATASOURCE',
          message: 'DATA_TABLE_CARD.ERRORS.CRUD_REQUIRES_DATASOURCE',
          controlPath: 'crudConfig'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
