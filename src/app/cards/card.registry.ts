import { Type } from '@angular/core';
import { RegisteredCardMetadata } from './card.decorator';

export class CardRegistry {
  private static registry = new Map<string, RegisteredCardMetadata>();

  static register(name: string, metadata: RegisteredCardMetadata) {
    console.log('[CardRegistry] Registering card:', name, metadata);
    this.registry.set(name, metadata);
  }

  static getMetadata(name: string): RegisteredCardMetadata | undefined {
    console.log('[CardRegistry] Getting metadata for:', name);
    console.log('[CardRegistry] Available cards:', Array.from(this.registry.entries()));
    return this.registry.get(name);
  }

  static getAllCards(): RegisteredCardMetadata[] {
    console.log('[CardRegistry] Getting all cards:', Array.from(this.registry.values()));
    return Array.from(this.registry.values());
  }
} 