import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuCategory, MenuPage, Layout } from '@models/api.models';
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

  // Pages methods
  getPages(categoryId: number): Observable<MenuPage[]> {
    const endpoint = ApiEndpoints.pagesByCategory.replace('{categoryId}', categoryId.toString());
    return this.apiService.get<MenuPage[]>(endpoint);
  }

  getPage(id: number): Observable<MenuPage> {
    const endpoint = ApiEndpoints.pageById.replace('{id}', id.toString());
    return this.apiService.get<MenuPage>(endpoint);
  }

  createPage(page: Partial<MenuPage>): Observable<MenuPage> {
    return this.apiService.post<MenuPage>(ApiEndpoints.pages, page);
  }

  updatePage(id: number, page: MenuPage): Observable<MenuPage> {
    const endpoint = ApiEndpoints.pageById.replace('{id}', id.toString());
    return this.apiService.put<MenuPage>(endpoint, page);
  }

  deletePage(id: number): Observable<void> {
    const endpoint = ApiEndpoints.pageById.replace('{id}', id.toString());
    return this.apiService.delete<void>(endpoint);
  }

  getPageLayout(id: number): Observable<Layout> {
    const endpoint = ApiEndpoints.pageLayout.replace('{id}', id.toString());
    return this.apiService.get<Layout>(endpoint);
  }

  updatePageLayout(id: number, layout: Layout): Observable<Layout> {
    const endpoint = ApiEndpoints.pageLayout.replace('{id}', id.toString());
    return this.apiService.put<Layout>(endpoint, layout);
  }
}
