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
    console.log('MenuStateService: Loading categories...');
    this.menuService.getMenuCategories().subscribe({
      next: (categories) => {
        console.log('MenuStateService: Categories loaded:', categories);
        this.menuCategoriesSubject.next(categories);
        categories.forEach(category => this.loadPagesForCategory(category.Id));
      },
      error: (error) => {
        console.error('MenuStateService: Error loading menu categories:', error);
      }
    });
  }

  private loadPagesForCategory(categoryId: number) {
    console.log(`MenuStateService: Loading pages for category ${categoryId}...`);
    this.menuService.getPages(categoryId).subscribe({
      next: (pages) => {
        console.log(`MenuStateService: Pages loaded for category ${categoryId}:`, pages);
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
    return this.menuCategoriesSubject.asObservable().pipe(
      tap(categories => console.log('MenuStateService: Getting categories:', categories))
    );
  }

  getMenuPages(categoryId: number): Observable<MenuPage[]> {
    return this.menuPagesSubject.asObservable().pipe(
      map(pagesMap => pagesMap[categoryId] || []),
      tap(pages => console.log(`MenuStateService: Getting pages for category ${categoryId}:`, pages))
    );
  }

  refreshMenus() {
    console.log('MenuStateService: Refreshing menus...');
    this.loadMenuCategories();
  }
} 