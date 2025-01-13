import { Injectable, Type } from '@angular/core';
import { BaseCardComponent } from './base-card.component';
import { CardMetadata, getCardMetadata } from './card.decorator';

export interface CardType {
  type: string;
  title: string;
  component: Type<BaseCardComponent>;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private availableCards: CardType[] = [];

  async discoverCards(): Promise<CardType[]> {
    if (this.availableCards.length > 0) {
      return this.availableCards;
    }

    const modules = await Promise.all([
      import('./placeholder-card.component'),
      // Ajouter ici les autres composants de carte
    ]);

    modules.forEach(module => {
      const component = Object.values(module)[0] as Type<BaseCardComponent>;
      if (component.prototype instanceof BaseCardComponent) {
        const metadata = getCardMetadata(component);
        if (metadata) {
          this.availableCards.push({
            ...metadata,
            component
          });
        }
      }
    });

    return this.availableCards;
  }

  getCardComponent(type: string): Type<BaseCardComponent> | null {
    const cardType = this.availableCards.find(c => c.type === type);
    return cardType?.component || null;
  }
} 