import { Injectable, Type } from '@angular/core';
import { BaseCardComponent } from './base-card.component';
import { CardMetadata, getCardMetadata } from './card.decorator';
import { BaseCardConfig, CardConfigFactory, CardDto, mapCardFromApi, mapCardToApi, mapCardsFromApi } from '@models/api.models';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseCardConfigComponent } from './base-card-config.component';

export interface CardType {
  type: string;
  title: string;
  component: Type<BaseCardComponent>;
  configComponent: Type<BaseCardConfigComponent>;
  icon: string;
  configFactory: CardConfigFactory<BaseCardConfig>;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private availableCards: CardType[] = [];
  private configFactories = new Map<string, CardConfigFactory<BaseCardConfig>>();

  constructor(private http: HttpClient) {}

  registerCardType(cardType: CardType) {
    this.availableCards.push(cardType);
    this.configFactories.set(cardType.type, cardType.configFactory);
  }

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

  getCards(): Observable<CardDto<BaseCardConfig>[]> {
    return this.http.get<any[]>('/api/cards').pipe(
      map(cards => cards.map(card => {
        const factory = this.configFactories.get(card.type);
        if (!factory) {
          throw new Error(`No configuration factory registered for card type: ${card.type}`);
        }
        return mapCardFromApi(card, factory);
      }))
    );
  }

  saveCard(card: CardDto<BaseCardConfig>): Observable<CardDto<BaseCardConfig>> {
    const cardData = mapCardToApi(card);
    return this.http.post<any>('/api/cards', cardData).pipe(
      map(response => {
        const factory = this.configFactories.get(response.type);
        if (!factory) {
          throw new Error(`No configuration factory registered for card type: ${response.type}`);
        }
        return mapCardFromApi(response, factory);
      })
    );
  }

  getConfigComponent(type: string): Type<BaseCardConfigComponent> | null {
    const cardType = this.availableCards.find(c => c.type === type);
    return cardType?.configComponent || null;
  }

  getCardMetadata(type: string): CardMetadata<any> | undefined {
    return this.availableCards.find(card => card.type === type);
  }
} 