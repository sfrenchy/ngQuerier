import { Injectable, Injector, Type } from '@angular/core';
import { CardMetadata } from '@cards/card.decorator';
import { CardRegistry } from '@cards/card.registry';
import { BaseCardConfig, CardDto } from '@models/api.models';

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