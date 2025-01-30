import { Injectable, Injector, Type } from '@angular/core';
import { ICard } from '@models/card.interface';
import { CardConfigFactory } from './card-config.factory';
import { BaseCardConfig } from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CardRegistryService {
  private cards = new Map<string, ICard>();

  constructor(private injector: Injector) {}

  registerCard(card: ICard) {
    this.cards.set(card.type, card);
  }

  getCard(type: string): ICard | undefined {
    return this.cards.get(type);
  }

  getConfigFactory(type: string): CardConfigFactory<BaseCardConfig> | undefined {
    const card = this.getCard(type);
    if (!card) return undefined;
    
    return this.injector.get(card.configFactory);
  }

  getAvailableCardTypes(): string[] {
    return Array.from(this.cards.keys());
  }
} 