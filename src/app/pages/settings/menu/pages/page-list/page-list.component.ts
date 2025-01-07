import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuService } from '@services/menu.service';
import { MenuCategory, MenuPage } from '@models/api.models';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class PageListComponent implements OnInit {
  pages: MenuPage[] = [];
  category?: MenuCategory;
  isLoading = false;
  error: string | null = null;

  constructor(
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('categoryId');
    if (categoryId) {
      this.loadCategory(+categoryId);
      this.loadPages(+categoryId);
    }
  }

  loadCategory(categoryId: number): void {
    this.menuService.getMenuCategory(categoryId).subscribe({
      next: (category) => {
        this.category = category;
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  loadPages(categoryId: number): void {
    this.isLoading = true;
    this.error = null;
    this.menuService.getPages(categoryId).subscribe({
      next: (pages) => {
        this.pages = pages;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  onAddClick(): void {
    if (this.category) {
      this.router.navigate(['new'], { relativeTo: this.route });
    }
  }

  onEditClick(page: MenuPage): void {
    this.router.navigate(['edit', page.Id], { relativeTo: this.route });
  }

  onLayoutClick(page: MenuPage): void {
    this.router.navigate(['layout', page.Id], { relativeTo: this.route });
  }

  onDeleteClick(page: MenuPage): void {
    if (confirm(this.translate.instant('COMMON.CONFIRMATION.DELETE_PAGE', { name: this.getLocalizedName(page) }))) {
      this.menuService.deletePage(page.Id).subscribe({
        next: () => {
          if (this.category) {
            this.loadPages(this.category.Id);
          }
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  getLocalizedName(item: MenuPage | MenuCategory): string {
    if (!item || !item.Names) {
      return '';
    }
    const currentLang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    return item.Names[currentLang] || Object.values(item.Names)[0] || '';
  }
} 