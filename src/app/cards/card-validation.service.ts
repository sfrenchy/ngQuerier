import {Injectable} from '@angular/core';
import {BaseCardConfig} from '@models/api.models';
import {DatasourceConfig} from '@models/datasource.models';

@Injectable({
  providedIn: 'root'
})
export class CardValidationService {
  validateConfig(config: BaseCardConfig): boolean {
    if (!config) return false;

    // Required fields validation
    // if (!config.toJson) {
    //   return false;
    // }

    return true;
  }

  validateDataConfig(config: DatasourceConfig): boolean {
    if (!config) return false;

    // Type validation
    if (!['API', 'EntityFramework', 'SQLQuery'].includes(config.type)) {
      return false;
    }

    // Type-specific validation
    switch (config.type) {
      case 'API':
        if (!config.controller) return false;
        break;
      case 'EntityFramework':
        if (!config.entity || !config.connection) return false;
        break;
      case 'SQLQuery':
        if (!config.query || !config.connection) return false;
        break;
    }

    // A stored procedure may or may not have parameters
    // Just check that if parameters exist, they are well-formed
    if (config.isStoredProcedure && config.procedureParameters) {
      // Check that each parameter has at least a name and type
      for (const param of Object.values(config.procedureParameters)) {
        if (!param.name || !param.type) {
          return false;
        }
      }
    }

    return true;
  }
}
