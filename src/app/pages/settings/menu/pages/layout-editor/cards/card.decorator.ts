import { Type } from '@angular/core';
import { BaseCardComponent } from './base-card.component';

export interface CardMetadata {
  type: string;
  title: string;
  icon: string;
}

const CARD_METADATA_KEY = 'cardMetadata';

export function Card(metadata: CardMetadata): ClassDecorator {
  return function(target: any) {
    Reflect.defineMetadata(CARD_METADATA_KEY, metadata, target);
    return target;
  };
}

export function getCardMetadata(target: Type<BaseCardComponent>): CardMetadata | undefined {
  return Reflect.getMetadata(CARD_METADATA_KEY, target);
} 