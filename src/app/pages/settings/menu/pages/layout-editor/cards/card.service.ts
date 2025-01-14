import { Injectable, Type } from '@angular/core';
import { CardMetadata } from './card.decorator';
import { LabelCardComponent } from './label-card/label-card.component';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly cardTypes: Type<any>[] = [
    LabelCardComponent
  ];

  getAvailableCards(): CardMetadata[] {
    return this.cardTypes
      .map(type => (type as any).getMetadata?.())
      .filter((metadata): metadata is CardMetadata => !!metadata);
  }

  getCardByType(type: string): Type<any> | undefined {
    return this.cardTypes.find(cardType => 
      cardType.name === type
    );
  }

  getConfigComponentByType(type: string): Type<any> | undefined {
    const cardType = this.getCardByType(type);
    if (!cardType) return undefined;

    const metadata = (cardType as any).getMetadata?.();
    return metadata?.configComponent;
  }
} 