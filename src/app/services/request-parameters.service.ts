import {Injectable} from '@angular/core';
import {ColumnSearchDto, DataRequestParametersDto, OrderByParameterDto} from '../models/api.models';

const STORAGE_PREFIX = 'querier_filters_';

@Injectable({
  providedIn: 'root'
})
export class RequestParametersService {
  private getUserKey(): string {
    // TODO: Récupérer l'ID de l'utilisateur connecté depuis le service d'authentification
    return 'default_user';
  }

  private getStorageKey(cardId: number): string {
    return `${STORAGE_PREFIX}${this.getUserKey()}_${cardId}`;
  }

  // Méthodes de gestion des paramètres
  addColumnSearch(params: DataRequestParametersDto, search: ColumnSearchDto): DataRequestParametersDto {
    const existingSearchIndex = params.columnSearches.findIndex(s => s.column === search.column);
    const columnSearches = [...params.columnSearches];

    if (existingSearchIndex !== -1) {
      // Mettre à jour le filtre existant
      columnSearches[existingSearchIndex] = search;
    } else {
      // Ajouter un nouveau filtre
      columnSearches.push(search);
    }

    return {
      ...params,
      columnSearches
    };
  }

  removeColumnSearch(params: DataRequestParametersDto, column: string): DataRequestParametersDto {
    return {
      ...params,
      columnSearches: params.columnSearches.filter(s => s.column !== column)
    };
  }

  addOrderBy(params: DataRequestParametersDto, order: OrderByParameterDto): DataRequestParametersDto {
    const existingOrderIndex = params.orderBy.findIndex(o => o.column === order.column);
    const orderBy = [...params.orderBy];

    if (existingOrderIndex !== -1) {
      // Mettre à jour le tri existant
      orderBy[existingOrderIndex] = order;
    } else {
      // Ajouter un nouveau tri
      orderBy.push(order);
    }

    return {
      ...params,
      orderBy
    };
  }

  removeOrderBy(params: DataRequestParametersDto, column: string): DataRequestParametersDto {
    return {
      ...params,
      orderBy: params.orderBy.filter(o => o.column !== column)
    };
  }

  // Méthodes de persistance localStorage
  saveToLocalStorage(cardId: number, params: DataRequestParametersDto): void {
    try {
      const storageKey = this.getStorageKey(cardId);
      const dataToStore = {
        columnSearches: params.columnSearches,
        orderBy: params.orderBy
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving parameters to localStorage:', error);
    }
  }

  loadFromLocalStorage(cardId: number): DataRequestParametersDto | null {
    try {
      const storageKey = this.getStorageKey(cardId);
      const storedData = localStorage.getItem(storageKey);

      if (!storedData) {
        return null;
      }

      const parsedData = JSON.parse(storedData);
      return {
        pageNumber: 1,
        pageSize: 1000,
        globalSearch: '',
        columnSearches: parsedData.columnSearches || [],
        orderBy: parsedData.orderBy || []
      };
    } catch (error) {
      console.error('Error loading parameters from localStorage:', error);
      return null;
    }
  }

  clearLocalStorage(cardId: number): void {
    try {
      const storageKey = this.getStorageKey(cardId);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing parameters from localStorage:', error);
    }
  }
}
