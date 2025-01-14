import { Component, Input } from '@angular/core';
import { CardDto } from '@models/api.models';

@Component({
  template: ''
})
export abstract class BaseCardComponent {
  @Input() card!: CardDto;
  @Input() config: any;
} 