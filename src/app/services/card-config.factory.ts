import { Injectable } from '@angular/core';
import { BaseCardConfig, CardDto } from '@models/api.models';
import { CardValidationService } from './card-validation.service';

@Injectable({
  providedIn: 'root'
})
export abstract class CardConfigFactory<T extends BaseCardConfig> {
  constructor(protected validationService: CardValidationService) {}

  abstract createDefaultConfig(): T;

  validateConfig(config: T): boolean {
    // Base validation
    if (!this.validationService.validateConfig(config)) {
      return false;
    }

    // Derived classes can add their own validations
    return true;
  }

  protected createBaseConfig(): CardDto {
    return {
      id: 0,  // Will be set by backend
      type: '',  // Will be set by derived class
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
      icon: ''  // Will be filled by component
    };
  }
} 
