import { Injectable, Type } from '@angular/core';
import { CardMetadata } from './card.decorator';
import { CardRegistry } from './card.registry';

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
} 