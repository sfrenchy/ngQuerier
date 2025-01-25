import { Injectable } from '@angular/core';
import { OrderByParameterDto } from '../../models/api.models';
import { DatasourceConfig } from '../../models/datasource.models';

export interface TableState {
  columnWidths: { [columnKey: string]: number };
  filters: { [columnKey: string]: string[] };
  sorting: OrderByParameterDto[];
}

@Injectable({
  providedIn: 'root'
})
export class TableStateService {
  private getStorageKey(cardId: string, datasource: DatasourceConfig): string {
    // Extraire les valeurs nécessaires de l'objet datasource
    const connectionId = datasource.connection?.id || 'unknown';
    const controllerName = datasource.controller?.name || 'unknown';
    
    // Construire une clé propre
    return `querier_table_state_${cardId}_${connectionId}_${controllerName}`.toLowerCase();
  }

  loadState(cardId: string, datasource: DatasourceConfig): TableState | null {
    try {
      const key = this.getStorageKey(cardId, datasource);
      const storedState = localStorage.getItem(key);
      if (storedState) {
        const state = JSON.parse(storedState);
        // Convert filters back to arrays (they were Sets originally)
        return {
          ...state,
          filters: Object.fromEntries(
            Object.entries(state.filters || {}).map(([key, values]) => [key, values])
          )
        };
      }
    } catch (error) {
      console.error('Error loading table state:', error);
    }
    return null;
  }

  saveState(cardId: string, datasource: DatasourceConfig, state: Partial<TableState>): void {
    try {
      const key = this.getStorageKey(cardId, datasource);
      const currentState = this.loadState(cardId, datasource) || {
        columnWidths: {},
        filters: {},
        sorting: []
      };
      
      const newState = {
        ...currentState,
        ...state
      };

      localStorage.setItem(key, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving table state:', error);
    }
  }

  clearState(cardId: string, datasource: DatasourceConfig): void {
    try {
      const key = this.getStorageKey(cardId, datasource);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing table state:', error);
    }
  }
} 