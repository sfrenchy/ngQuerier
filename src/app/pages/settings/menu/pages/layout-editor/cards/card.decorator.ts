import { Type } from '@angular/core';
import { CardRegistry } from './card.registry';

export interface CardMetadata {
  name: string;
  icon: string;
  configComponent?: Type<any>;
}

export interface RegisteredCardMetadata extends CardMetadata {
  type: Type<any>;
}

export function Card(metadata: CardMetadata) {
  return function (target: Type<any>) {
    // Utiliser le type de la carte comme clé (en minuscules)
    const type = metadata.name.toLowerCase();
    const registeredMetadata: RegisteredCardMetadata = {
      ...metadata,
      type: target
    };
    CardRegistry.register(type, registeredMetadata);
    return target;
  };
} 