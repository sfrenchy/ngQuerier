import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CardDto } from '@models/api.models';
import { LastTestCardDto } from './last-test-card.component';

@Component({
  selector: 'app-last-test-card-configuration',
  templateUrl: './last-test-card-configuration.component.html'
})
export class LastTestCardConfigurationComponent {
  @Input() card!: CardDto<LastTestCardDto>;
  @Input() config?: LastTestCardDto;
  @Output() save = new EventEmitter<LastTestCardDto>();
} 