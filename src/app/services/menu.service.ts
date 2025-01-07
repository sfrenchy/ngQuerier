import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuCategory } from '@models/api.models';
import { ApiService } from '@services/api.service';
import { ApiEndpoints } from '@services/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor(private apiService: ApiService) { }

  getMenuCategories(): Observable<MenuCategory[]> {
    return this.apiService.get<MenuCategory[]>(ApiEndpoints.menuCategories);
  }

  getMenuCategory(id: number): Observable<MenuCategory> {
    const endpoint = ApiEndpoints.menuCategoryById.replace('{id}', id.toString());
    return this.apiService.get<MenuCategory>(endpoint);
  }

  createMenuCategory(category: Partial<MenuCategory>): Observable<MenuCategory> {
    return this.apiService.post<MenuCategory>(ApiEndpoints.menuCategories, category);
  }

  updateMenuCategory(id: number, category: MenuCategory): Observable<MenuCategory> {
    const endpoint = ApiEndpoints.menuCategoryById.replace('{id}', id.toString());
    return this.apiService.put<MenuCategory>(endpoint, category);
  }

  deleteMenuCategory(id: number): Observable<void> {
    const endpoint = ApiEndpoints.menuCategoryById.replace('{id}', id.toString());
    return this.apiService.delete<void>(endpoint);
  }

  updateMenuCategoryVisibility(id: number, isVisible: boolean): Observable<MenuCategory> {
    const endpoint = ApiEndpoints.menuCategoryVisibility.replace('{id}', id.toString());
    return this.apiService.patch<MenuCategory>(endpoint, { isVisible });
  }
}
