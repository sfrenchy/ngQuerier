import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseChartService } from '@services/base-chart.service';
import { ApiService } from '@services/api.service';
import { DatasourceConfig } from '@models/datasource.models';

@Injectable()
export class StackedBarAndLinesChartService extends BaseChartService {
  constructor(protected override apiService: ApiService) {
    super(apiService);
  }

  override loadData(key: string, endpoint: string, params?: any): Observable<any[]> {
    return super.loadData(key, endpoint, params);
  }

  override loadDataFromConfig(config: { datasource: DatasourceConfig }): Observable<any[]> {
    return super.loadDataFromConfig(config);
  }

  protected override transformResponse(response: any): any[] {
    // Si la réponse est déjà un tableau, on la retourne
    if (Array.isArray(response)) {
      return response;
    }
    // Si la réponse a une propriété items qui est un tableau, on retourne ce tableau
    if (response && Array.isArray(response.items)) {
      return response.items;
    }
    // Si la réponse a une propriété data qui est un tableau, on retourne ce tableau
    if (response && Array.isArray(response.data)) {
      return response.data;
    }
    // Si la réponse a une propriété results qui est un tableau, on retourne ce tableau
    if (response && Array.isArray(response.results)) {
      return response.results;
    }
    // Sinon on retourne un tableau vide
    console.warn('StackedBarAndLinesChartService.transformResponse - Unexpected response format:', response);
    return [];
  }
} 