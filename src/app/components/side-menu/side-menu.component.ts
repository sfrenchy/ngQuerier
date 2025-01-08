import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '@services/user.service';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { MenuStateService } from '@services/menu-state.service';
import { MenuCategory, MenuPage } from '@models/api.models';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './side-menu.component.html'
})
export class SideMenuComponent implements OnInit {
  protected readonly Object = Object;
  isExpanded = false;
  isSettingsExpanded = false;
  isPinned = false;
  expandedCategories: { [key: number]: boolean } = {};
  menuCategories: MenuCategory[] = [];
  menuPages: { [categoryId: number]: MenuPage[] } = {};

  constructor(
    public userService: UserService,
    private authService: AuthService,
    private router: Router,
    private menuStateService: MenuStateService
  ) {}

  ngOnInit() {
    this.loadMenus();
  }

  private loadMenus() {
    console.log('Loading menus...');
    this.menuStateService.getMenuCategories().subscribe(categories => {
      console.log('Categories loaded:', categories);
      this.menuCategories = categories;
      categories.forEach(category => {
        console.log(`Loading pages for category ${category.Id}...`);
        this.menuStateService.getMenuPages(category.Id).subscribe(pages => {
          console.log(`Pages loaded for category ${category.Id}:`, pages);
          this.menuPages[category.Id] = pages;
        });
      });
    });
  }

  getCategoryPages(categoryId: number): MenuPage[] {
    const pages = this.menuPages[categoryId] || [];
    console.log(`Getting pages for category ${categoryId}:`, pages);
    return pages;
  }

  onMouseEnter(): void {
    if (!this.isPinned) {
      this.isExpanded = true;
    }
  }

  onMouseLeave(): void {
    if (!this.isPinned) {
      this.isExpanded = false;
      this.isSettingsExpanded = false;
    }
  }

  togglePin(): void {
    this.isPinned = !this.isPinned;
    if (this.isPinned) {
      this.isExpanded = true;
    }
  }

  toggleSettings(): void {
    this.isSettingsExpanded = !this.isSettingsExpanded;
  }

  toggleCategory(categoryId: number): void {
    console.log(`Toggling category ${categoryId}`);
    this.expandedCategories[categoryId] = !this.expandedCategories[categoryId];
    console.log('Expanded categories:', this.expandedCategories);
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories[categoryId] || false;
  }

  async onLogout(): Promise<void> {
    this.authService.logout();
    await this.router.navigate(['/login']);
  }

  hasRequiredRole(roles: string[]): boolean {
    console.log('Checking roles:', roles);
    const hasRole = roles.some(role => this.userService.hasRole(role));
    console.log('Has required role:', hasRole);
    return hasRole;
  }

  getPageRoles(page: MenuPage): string[] {
    console.log('Raw page roles:', page.Roles);
    // Si les rôles sont déjà des strings, les utiliser directement
    if (page.Roles && Array.isArray(page.Roles) && typeof page.Roles[0] === 'string') {
      return page.Roles as unknown as string[];
    }
    // Sinon, essayer d'extraire le nom du rôle
    const roles = page.Roles?.map(r => typeof r === 'object' && r !== null ? r.Name : r) || [];
    console.log('Processed page roles:', roles);
    return roles.filter(r => r !== undefined && r !== null);
  }

  shouldShowPage(page: MenuPage): boolean {
    const isVisible = page.IsVisible;
    const roles = this.getPageRoles(page);
    const hasRole = this.hasRequiredRole(roles);
    console.log('Should show page:', { isVisible, roles, hasRole });
    return isVisible && hasRole;
  }
} 