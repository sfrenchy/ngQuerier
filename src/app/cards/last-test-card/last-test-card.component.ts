import { Component, Input } from '@angular/core';
import { Card } from '../card.decorator';
import { BaseCardComponent } from '../base-card.component';
import { CardDto, BaseCardConfig } from '@models/api.models';
import { LastTestCardConfigurationComponent } from './last-test-card-configuration.component';

export class LastTestCardDto implements BaseCardConfig {
  // Add your card specific properties here

  toJson(): any {
    const json = {
      // Add your properties here
    };
    return json;
  }
}

@Card({
  name: 'LastTest Card',
  icon: 'question', // Change this to your preferred icon
  configComponent: LastTestCardConfigurationComponent
})
@Component({
  selector: 'app-last-test-card',
  templateUrl: './last-test-card.component.html'
})
export class LastTestCardComponent extends BaseCardComponent<LastTestCardDto> {
  // Add your component logic here
} 