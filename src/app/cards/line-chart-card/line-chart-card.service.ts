import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CardDatabaseService } from '@services/card-database.service';
import { LineChartCardConfig, ChartState } from './line-chart-card.models';
import { DataRequestParametersDto, OrderByParameterDto } from '@models/api.models';

interface ChartDataState {
  data: any[];
  loading: boolean;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LineChartCardService {
  private stateMap = new Map<string, BehaviorSubject<ChartDataState>>();
  private cacheMap = new Map<string, { 
    data: any[], 
    timestamp: number,
    parameters: DataRequestParametersDto 
  }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private cardDatabaseService: CardDatabaseService) {}

  private getStateKey(config: LineChartCardConfig): string {
    if (!config?.datasource?.connection?.id || !config?.datasource?.controller?.route) {
      return '';
    }
    return `${config.datasource.connection.id}_${config.datasource.controller.route}`;
  }

  private getOrCreateState(config: LineChartCardConfig): BehaviorSubject<ChartDataState> {
    const key = this.getStateKey(config);
    if (!this.stateMap.has(key)) {
      this.stateMap.set(key, new BehaviorSubject<ChartDataState>({
        data: [],
        loading: false
      }));
    }
    return this.stateMap.get(key)!;
  }

  getState(config: LineChartCardConfig): Observable<ChartState> {
    return this.getOrCreateState(config).asObservable().pipe(
      map(state => ({
        ...state,
        config: config.datasource
      }))
    );
  }

  invalidateCache(config: LineChartCardConfig): void {
    const key = this.getStateKey(config);
    this.cacheMap.delete(key);
  }

  loadData(config: LineChartCardConfig): void {
    if (!config?.datasource || !config.xAxisColumn) {
      return;
    }

    const key = this.getStateKey(config);
    const state = this.getOrCreateState(config);
    const currentCache = this.cacheMap.get(key);

    const parameters: DataRequestParametersDto = {
      pageNumber: 1,
      pageSize: 1000,
      orderBy: [{
        column: config.xAxisColumn,
        isDescending: false
      }],
      globalSearch: '',
      columnSearches: []
    };

    // Vérifier le cache
    if (currentCache && 
        Date.now() - currentCache.timestamp < this.CACHE_DURATION &&
        JSON.stringify(currentCache.parameters) === JSON.stringify(parameters)) {
      state.next({
        data: currentCache.data,
        loading: false
      });
      return;
    }

    state.next({ ...state.getValue(), loading: true });

    this.cardDatabaseService.fetchData(config.datasource, parameters).subscribe({
      next: (response) => {
        // Mettre à jour le cache
        this.cacheMap.set(key, {
          data: response.items,
          timestamp: Date.now(),
          parameters
        });

        state.next({
          data: response.items,
          loading: false
        });
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
        state.next({
          data: [],
          loading: false,
          error
        });
      }
    });
  }
} 