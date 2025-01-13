import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '@services/user.service';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { MenuDto, PageDto, TranslatableString, RoleDto } from '@models/api.models';
import { ApiService } from '@services/api.service';
import { catchError, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './side-menu.component.html'
})
export class SideMenuComponent implements OnInit, OnDestroy {
  protected readonly Object = Object;
  isExpanded = false;
  isSettingsExpanded = false;
  isPinned = false;
  expandedCategories: { [key: number]: boolean } = {};
  menus: MenuDto[] = [];
  menuPages: { [menuId: number]: PageDto[] } = {};
  error: string | null = null;
  private subscription: any;

  constructor(
    public userService: UserService,
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadMenus();
      this.subscription = this.apiService.menuUpdated$.subscribe(() => {
        this.loadMenus();
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getTranslatedTitle(translations: TranslatableString[]): string {
    if (!translations || translations.length === 0) return '';
    const currentLang = this.userService.getCurrentLanguage();
    const translation = translations.find(t => t.languageCode === currentLang);
    return translation?.value || translations[0]?.value || '';
  }

  private loadMenus() {
    this.apiService.getMenus().pipe(
      catchError(error => {
        console.error('Failed to load menus:', error);
        this.error = 'Failed to load menus';
        return of([]);
      }),
      switchMap(menus => {
        // Trier les menus par ordre
        this.menus = menus.sort((a, b) => a.order - b.order);
        
        // Create an array of observables for each menu's pages
        const pageRequests = this.menus.map(menu => 
          this.apiService.getMenuPages(menu.id).pipe(
            catchError(error => {
              console.error(`Failed to load pages for menu ${menu.id}:`, error);
              return of([]);
            })
          )
        );

        // Execute all page requests in parallel
        return forkJoin(
          pageRequests.map((request, index) => 
            request.pipe(
              catchError(error => {
                console.error(`Failed to load pages for menu ${this.menus[index].id}:`, error);
                return of([]);
              })
            )
          )
        );
      })
    ).subscribe(
      pagesArrays => {
        // Assign pages to their respective menus
        this.menus.forEach((menu, index) => {
          this.menuPages[menu.id] = pagesArrays[index];
        });
      },
      error => {
        console.error('Error in menu loading process:', error);
        this.error = 'Failed to load menu structure';
      }
    );
  }

  getCategoryPages(categoryId: number): PageDto[] {
    const pages = this.menuPages[categoryId] || [];
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
    this.expandedCategories[categoryId] = !this.expandedCategories[categoryId];
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories[categoryId] || false;
  }

  async onLogout(): Promise<void> {
    try {
      const success = await this.authService.logout().toPromise();
      if (success) {
        await this.router.navigate(['/login']);
      } else {
        console.error('Failed to sign out properly');
        // Still redirect to login page even if the API call failed
        await this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      await this.router.navigate(['/login']);
    }
  }

  hasRequiredRole(roles: RoleDto[]): boolean {
    // Si l'utilisateur est admin, il a accès à tout
    if (this.userService.isAdmin()) {
      return true;
    }
    // Sinon, vérifier les rôles spécifiques
    return roles.some(role => this.userService.hasRole(role.name));
  }

  shouldShowPage(page: PageDto): boolean {
    // Si l'utilisateur est admin, il voit toutes les pages
    if (this.userService.isAdmin()) {
      return page.isVisible;
    }
    // Sinon, vérifier la visibilité et les rôles
    return page.isVisible && this.hasRequiredRole(page.roles);
  }
} 