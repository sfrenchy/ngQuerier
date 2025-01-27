import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, map, of } from 'rxjs';
import { ChartState } from '@models/chart.models';
import { ApiService } from './api.service';
import { DatasourceConfig, ParameterValue } from '@models/datasource.models';

@Injectable({
  providedIn: 'root'
})
export class BaseChartService {
  protected stateMap = new Map<string, BehaviorSubject<ChartState>>();

  constructor(protected apiService: ApiService) {}

  protected getStateSubject(key: string): BehaviorSubject<ChartState> {
    if (!this.stateMap.has(key)) {
      this.stateMap.set(key, new BehaviorSubject<ChartState>({
        data: [],
        loading: false
      }));
    }
    return this.stateMap.get(key)!;
  }

  protected updateState(key: string, update: Partial<ChartState>) {
    const subject = this.getStateSubject(key);
    subject.next({ ...subject.value, ...update });
  }

  loadData(key: string, endpoint: string, params?: any): Observable<any[]> {
    this.updateState(key, { loading: true });

    return this.apiService.post(endpoint, params).pipe(
      map(response => {
        const data = this.transformResponse(response);
        const arrayData = Array.isArray(data) ? data : [];
        this.updateState(key, { data: arrayData, loading: false });
        return arrayData;
      }),
      catchError(error => {
        this.updateState(key, { 
          error: error.message || 'Une erreur est survenue lors du chargement des données',
          loading: false 
        });
        return of([]);
      })
    );
  }

  protected transformResponse(response: any): any[] {
    // Par défaut, retourne la réponse telle quelle
    // Les services dérivés peuvent surcharger cette méthode pour transformer les données
    return response;
  }

  getState(key: string): Observable<ChartState> {
    return this.getStateSubject(key).asObservable();
  }

  clearState(key: string) {
    if (this.stateMap.has(key)) {
      const subject = this.stateMap.get(key)!;
      subject.complete();
      this.stateMap.delete(key);
    }
  }

  loadDataFromConfig(config: { datasource: DatasourceConfig }): Observable<any[]> {
    if (!config.datasource || !config.datasource.controller?.route) {
      throw new Error('No datasource configuration provided');
    }

    const key = this.getConfigKey(config);
    const endpoint = config.datasource.controller.route.replace('api/v1/', '') + "/execute";
    const rawParams = config.datasource.procedureParameters || {};
    const params = this.extractParameterValues(rawParams);
    
    return this.loadData(key, endpoint, params);
  }

  protected getConfigKey(config: { datasource: DatasourceConfig }): string {
    if (!config.datasource.controller?.route) return '';
    const params = config.datasource.procedureParameters || {};
    return `${config.datasource.controller.route}-${JSON.stringify(params)}`;
  }

  protected extractParameterValues(params: Record<string, ParameterValue>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, param] of Object.entries(params)) {
      result[key] = param.value;
    }
    return result;
  }
} 