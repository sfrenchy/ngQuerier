import {Injectable} from '@angular/core';
import {BaseCardConfig, CardDto} from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CardConfigAdapterService {
  toCardDto<T extends BaseCardConfig>(config: T): CardDto<T> {
    // Configuration is already in the right format as it extends BaseCardConfig
    // We just need to convert it to CardDto
    return {
      id: 0,  // Will be set by backend
      type: config.constructor.name.toLowerCase().replace('config', ''),
      title: [],  // Will be filled by component
      order: 0,  // Managed by layout editor
      gridWidth: 4,  // Default value
      backgroundColor: 0x1f2937,  // Default value
      textColor: 0xffffff,  // Default value
      headerTextColor: 0xffffff,  // Default value
      headerBackgroundColor: 0x1f2937,  // Default value
      rowId: 0,  // Managed by layout editor
      displayHeader: true,  // Default value
      displayFooter: false,  // Default value
      icon: '',  // Will be filled by component
      configuration: config  // Specific configuration
    };
  }

  fromCardDto<T extends BaseCardConfig>(dto: CardDto<T>): T {
    // Specific configuration is already in the right format
    // as it extends BaseCardConfig
    return dto.configuration as T;
  }
}

