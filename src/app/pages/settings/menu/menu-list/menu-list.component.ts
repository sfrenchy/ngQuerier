import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MenuService } from '@services/menu.service';
import { MenuCategory } from '@models/api.models';

@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class MenuListComponent {
  menuCategories: MenuCategory[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private menuService: MenuService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadMenuCategories();
  }

  handleVisibilityChange(category: MenuCategory, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.onVisibilityChange(category, checkbox.checked);
  }

  loadMenuCategories(): void {
    this.isLoading = true;
    this.error = null;
    this.menuService.getMenuCategories().subscribe({
      next: (categories) => {
        this.menuCategories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  onAddClick(): void {
    this.router.navigate(['/settings/menu/new']);
  }

  onEditClick(category: MenuCategory): void {
    this.router.navigate(['/settings/menu/edit', category.Id]);
  }

  onDeleteClick(category: MenuCategory): void {
    if (confirm(this.translate.instant('COMMON.CONFIRMATION.DELETE_MENU_CATEGORY', { name: this.getLocalizedName(category) }))) {
      this.menuService.deleteMenuCategory(category.Id).subscribe({
        next: () => {
          this.loadMenuCategories();
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  onVisibilityChange(category: MenuCategory, isVisible: boolean): void {
    this.menuService.updateMenuCategoryVisibility(category.Id, isVisible).subscribe({
      next: (updatedCategory) => {
        const index = this.menuCategories.findIndex(c => c.Id === updatedCategory.Id);
        if (index !== -1) {
          this.menuCategories[index] = updatedCategory;
        }
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  getLocalizedName(category: MenuCategory): string {
    if (!category || !category.Names) {
      return '';
    }
    const currentLang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    return category.Names[currentLang] || Object.values(category.Names)[0] || '';
  }
}
