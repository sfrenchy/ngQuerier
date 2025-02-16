import {Injectable} from '@angular/core';
import {BaseChartService} from '@services/base-chart.service';
import {ApiService} from '@services/api.service';

@Injectable()
export class PieChartCardService extends BaseChartService {
  constructor(protected override apiService: ApiService) {
    super(apiService);
  }
}
