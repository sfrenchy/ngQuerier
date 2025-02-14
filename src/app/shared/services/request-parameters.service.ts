import {Injectable} from '@angular/core';
import {DataRequestParametersDto} from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class RequestParametersService {
  private readonly STORAGE_PREFIX = 'querier_params_';

  saveToLocalStorage(cardId: number, params: DataRequestParametersDto): void {
    const key = this.getStorageKey(cardId);
    localStorage.setItem(key, JSON.stringify(params));
  }

  loadFromLocalStorage(cardId: number): DataRequestParametersDto | null {
    const key = this.getStorageKey(cardId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as DataRequestParametersDto;
    } catch (error) {
      console.error('Error parsing stored parameters:', error);
      return null;
    }
  }

  clearFromLocalStorage(cardId: number): void {
    const key = this.getStorageKey(cardId);
    localStorage.removeItem(key);
  }

  private getStorageKey(cardId: number): string {
    // Inclure l'ID utilisateur quand il sera disponible
    return `${this.STORAGE_PREFIX}${cardId}`;
  }
}
