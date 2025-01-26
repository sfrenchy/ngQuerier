import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatasourceService } from '@shared/components/datasource-configuration/datasource.service';
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

  constructor(private datasourceService: DatasourceService) {}

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

  loadData(config: LineChartCardConfig): void {
    if (!config?.datasource) {
      return;
    }

    const state = this.getOrCreateState(config);
    state.next({ ...state.getValue(), loading: true });

    // Paramètres par défaut pour la requête
    const parameters: DataRequestParametersDto = {
      pageNumber: 1,
      pageSize: 1000, // On récupère plus de données pour les graphiques
      orderBy: [],
      globalSearch: '',
      columnSearches: []
    };

    this.datasourceService.fetchData(config.datasource, parameters).subscribe({
      next: (response) => {
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