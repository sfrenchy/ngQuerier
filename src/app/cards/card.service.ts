import { Injectable, Type } from '@angular/core';
import { CardMetadata } from './card.decorator';
import { CardRegistry } from './card.registry';
import { BaseCardConfig, CardDto } from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CardService {
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

  deserializeCardConfig(card: CardDto): CardDto {
    if (!card.configuration) return card;

    const metadata = CardRegistry.getMetadata(card.type);
    if (!metadata?.type) return card;

    const cardType = metadata.type as any;
    if (typeof cardType.fromJson === 'function') {
      return {
        ...card,
        configuration: cardType.fromJson(card.configuration)
      };
    }

    return card;
  }
} 