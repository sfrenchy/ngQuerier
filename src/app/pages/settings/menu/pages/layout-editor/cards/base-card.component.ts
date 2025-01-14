import { Component, Input } from '@angular/core';
import { BaseCardConfig, CardDto } from '@models/api.models';

@Component({
  template: ''
})
export abstract class BaseCardComponent<T extends BaseCardConfig = BaseCardConfig> {
  @Input() card!: CardDto<T>;
  @Input() config!: T;
} 