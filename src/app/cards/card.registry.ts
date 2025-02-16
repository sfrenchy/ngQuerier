import {Injectable} from '@angular/core';
import {RegisteredCardMetadata} from './card.decorator';

@Injectable({
  providedIn: 'root'
})
export class CardRegistry {
  private static registry = new Map<string, RegisteredCardMetadata>();

  static register(name: string, metadata: RegisteredCardMetadata) {
    this.registry.set(name, metadata);
  }

  static getMetadata(name: string): RegisteredCardMetadata | undefined {
    return this.registry.get(name);
  }

  static getAllCards(): RegisteredCardMetadata[] {
    return Array.from(this.registry.values());
  }
}
