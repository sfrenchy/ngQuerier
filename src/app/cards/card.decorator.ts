import {Type} from '@angular/core';
import {CardRegistry} from '@cards/card.registry';
import {BaseCardConfig} from '@models/api.models';
import {CardConfigFactory} from '@cards/card-config.factory';

export interface CardMetadata {
  name: string;
  icon: string;
  configComponent: Type<any>;
  configFactory: Type<CardConfigFactory<BaseCardConfig>>;
  defaultConfig: () => BaseCardConfig;
  translationPath: string;  // Path for translations
}

export interface RegisteredCardMetadata extends CardMetadata {
  type: Type<any>;
}

export interface CardConfig {
  name: string;
  icon: string;
  configComponent: Type<any>;
  configType: Type<BaseCardConfig>;
  configFactory: Type<CardConfigFactory<BaseCardConfig>>;
  defaultConfig: () => BaseCardConfig;
  translationPath: string;  // Path for translations
}

// Registre des composants décorés avec @Card
const cardRegistry: Type<any>[] = [];

export function Card(metadata: CardMetadata): ClassDecorator {
  return function (target: Function): any {
    // Ajouter le composant au registre
    cardRegistry.push(target as Type<any>);

    // Attacher les métadonnées à la classe
    (target as any).cardConfig = metadata;

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
