import { Type } from '@angular/core';
import { BaseCardComponent } from './base-card.component';
import { BaseCardConfig, CardConfigFactory } from '@models/api.models';
import { BaseCardConfigComponent } from './base-card-config.component';

export interface CardMetadata<T extends BaseCardConfig = BaseCardConfig> {
  type: string;
  title: string;
  icon: string;
  configComponent: Type<BaseCardConfigComponent<T>>;
  configFactory: CardConfigFactory<T>;
}

const CARD_METADATA_KEY = 'cardMetadata';

export function Card<T extends BaseCardConfig>(metadata: CardMetadata<T>): ClassDecorator {
  return function(target: any) {
    Reflect.defineMetadata(CARD_METADATA_KEY, metadata, target);
    return target;
  };
}

export function getCardMetadata(target: Type<BaseCardComponent>): CardMetadata | undefined {
  return Reflect.getMetadata(CARD_METADATA_KEY, target);
} 