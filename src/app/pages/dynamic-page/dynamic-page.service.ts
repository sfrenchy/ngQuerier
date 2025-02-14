import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {LayoutDto} from '@models/api.models';
import {ApiService} from '@services/api.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicPageService {
  constructor(
    private apiService: ApiService
  ) {
  }

  getLayout(pageId: number): Observable<LayoutDto> {
    return this.apiService.getLayout(pageId);
  }
}
