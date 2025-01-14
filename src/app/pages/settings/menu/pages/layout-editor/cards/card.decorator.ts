import 'reflect-metadata';
import { Type } from '@angular/core';

export interface CardMetadata<TConfig = any> {
  type: Type<any>;
  configComponent: Type<any>;
  icon: string;
  name: string;
}

const CARD_METADATA_KEY = 'cardMetadata';

export function Card(metadata: CardMetadata) {
  return function (target: Type<any>) {
    Reflect.defineMetadata(CARD_METADATA_KEY, metadata, target);
    
    // Expose une méthode statique pour récupérer les métadonnées
    (target as any).getMetadata = () => Reflect.getMetadata(CARD_METADATA_KEY, target);
  };
} 