import { Type } from '@angular/core';
import { CardRegistry } from './card.registry';
import { BaseCardConfig } from '@models/api.models';

export interface CardMetadata {
  name: string;
  icon: string;
  configComponent?: Type<any>;
  defaultConfig?: () => BaseCardConfig;
}

export interface RegisteredCardMetadata extends CardMetadata {
  type: Type<any>;
}

// Registre des composants décorés avec @Card
const cardRegistry: Type<any>[] = [];

export function Card(metadata: CardMetadata): ClassDecorator {
  return function (target: Function): any {
    // Ajouter le composant au registre
    cardRegistry.push(target as Type<any>);

    // Enregistrer les métadonnées comme avant
    const type = metadata.name.toLowerCase();
    const registeredMetadata: RegisteredCardMetadata = {
      ...metadata,
      type: target as Type<any>
    };
    CardRegistry.register(type, registeredMetadata);
  };
}

// Fonction pour récupérer tous les composants décorés
export function getRegisteredCards(): Type<any>[] {
  return [...cardRegistry]; // Retourne une copie pour éviter les modifications externes
} 