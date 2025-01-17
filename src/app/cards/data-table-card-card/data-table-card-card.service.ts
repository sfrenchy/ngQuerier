import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatasourceConfig } from '@models/datasource.models';
import { CardDatabaseService } from '@services/card-database.service';

interface DataState {
  items: any[];
  total: number;
  loading: boolean;
  config?: DatasourceConfig;
  pageNumber: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataTableCardCardService {
  private dataStateMap = new Map<string, BehaviorSubject<DataState>>();

  constructor(private cardDatabaseService: CardDatabaseService) {}

  private getStateKey(config: DatasourceConfig): string {
    return JSON.stringify(config);
  }

  private getOrCreateState(config: DatasourceConfig): BehaviorSubject<DataState> {
    const key = this.getStateKey(config);
    if (!this.dataStateMap.has(key)) {
      this.dataStateMap.set(key, new BehaviorSubject<DataState>({
        items: [],
        total: 0,
        loading: false,
        config,
        pageNumber: 1,
        pageSize: 10
      }));
    }
    return this.dataStateMap.get(key)!;
  }

  getData(config: DatasourceConfig): Observable<any[]> {
    return this.getOrCreateState(config).pipe(
      map(state => state.items)
    );
  }

  getTotal(config: DatasourceConfig): Observable<number> {
    return this.getOrCreateState(config).pipe(
      map(state => state.total)
    );
  }

  isLoading(config: DatasourceConfig): Observable<boolean> {
    return this.getOrCreateState(config).pipe(
      map(state => state.loading)
    );
  }

  loadData(config: DatasourceConfig, pageNumber: number = 1, pageSize: number = 10): void {
    const state$ = this.getOrCreateState(config);
    const currentState = state$.getValue();

    // Si les données sont déjà chargées, ne pas recharger
    if (currentState.items.length > 0 && 
        currentState.pageNumber === pageNumber && 
        currentState.pageSize === pageSize) {
      return;
    }

    state$.next({ ...currentState, loading: true });

    this.cardDatabaseService
      .fetchData(config, { pageNumber, pageSize })
      .subscribe({
        next: (response) => {
          state$.next({
            items: response.items,
            total: response.total,
            loading: false,
            config,
            pageNumber,
            pageSize
          });
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          state$.next({ ...currentState, loading: false });
        }
      });
  }

  clearData(config: DatasourceConfig): void {
    const key = this.getStateKey(config);
    this.dataStateMap.delete(key);
  }
} 