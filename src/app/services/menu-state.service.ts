import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuCategory, MenuPage } from '@models/api.models';
import { MenuService } from './menu.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MenuStateService {
  private menuCategoriesSubject = new BehaviorSubject<MenuCategory[]>([]);
  private menuPagesSubject = new BehaviorSubject<{ [categoryId: number]: MenuPage[] }>({});

  constructor(private menuService: MenuService) {
    this.loadMenuCategories();
  }

  private loadMenuCategories() {
    this.menuService.getMenuCategories().subscribe({
      next: (categories) => {
        this.menuCategoriesSubject.next(categories);
        categories.forEach(category => this.loadPagesForCategory(category.Id));
      },
      error: (error) => {
        console.error('MenuStateService: Error loading menu categories:', error);
      }
    });
  }

  private loadPagesForCategory(categoryId: number) {
    this.menuService.getPages(categoryId).subscribe({
      next: (pages) => {
        const currentPages = this.menuPagesSubject.value;
        this.menuPagesSubject.next({
          ...currentPages,
          [categoryId]: pages
        });
      },
      error: (error) => {
        console.error(`MenuStateService: Error loading pages for category ${categoryId}:`, error);
      }
    });
  }

  getMenuCategories(): Observable<MenuCategory[]> {
    return this.menuCategoriesSubject.asObservable();
  }

  getMenuPages(categoryId: number): Observable<MenuPage[]> {
    return this.menuPagesSubject.asObservable().pipe(
      map(pagesMap => pagesMap[categoryId] || [])
    );
  }

  refreshMenus() {
    this.loadMenuCategories();
  }
} 