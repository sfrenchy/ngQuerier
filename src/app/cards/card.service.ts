import { Injectable, Injector, Type } from '@angular/core';
import { CardMetadata } from '@cards/card.decorator';
import { CardRegistry } from '@cards/card.registry';
import { BaseCardConfig, CardDto } from '@models/api.models';
import { hexToUint, uintToHex } from '@shared/utils/color.utils';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(private injector: Injector) {}

  getAvailableCards(): CardMetadata[] {
    return CardRegistry.getAllCards();
  }

  getCardByType(type: string): Type<any> | undefined {
    const metadata = CardRegistry.getMetadata(type);
    return metadata?.type;
  }

  getConfigComponentByType(type: string): Type<any> | undefined {
    const metadata = CardRegistry.getMetadata(type);
    return metadata?.configComponent;
  }

  getConfigFactory(type: string): any {
    const metadata = CardRegistry.getMetadata(type);
    if (!metadata?.configFactory) return undefined;
    return this.injector.get(metadata.configFactory);
  }

  createCard(type: string): CardDto {
    const metadata = CardRegistry.getMetadata(type);
    const specificConfiguration = this.injector.get(metadata?.configFactory).createDefaultConfig();
    const newCard: CardDto = {
      id: 0,
      type: type,
      title: [{ languageCode: 'fr', value: 'Nouvelle carte' }],
      order: 0,
      gridWidth: 0,
      backgroundColor: hexToUint('#ffffff'),  // blanc
      textColor: hexToUint('#000000'),       // noir
      headerTextColor: hexToUint('#000000'), // noir
      headerBackgroundColor: hexToUint('#f3f4f6'), // gris clair
      rowId: 0,
      configuration: specificConfiguration,
      displayHeader: true,
      displayFooter: false,
      icon: 'fa-solid fa-circle-plus'
    };

    return newCard;
  }

  deserializeCardConfig(card: CardDto): CardDto {
    if (!card.configuration) return card;

    const factory = this.getConfigFactory(card.type);
    if (!factory) return card;

    return {
      ...card,
      configuration: factory.fromJson(card.configuration)
    };
  }
}
