import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '@services/api.service';
import {MenuDto} from '@models/api.models';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {CdkDragDrop, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';
import {ConfirmationDialogComponent} from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, FontAwesomeModule, DragDropModule, ConfirmationDialogComponent]
})
export class MenuListComponent {
  menus: MenuDto[] = [];
  isLoading = false;
  error: string | null = null;
  showConfirmDialog = false;
  menuToDelete: MenuDto | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.loadMenuCategories();
  }

  handleVisibilityChange(menu: MenuDto, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.onVisibilityChange(menu, checkbox.checked);
  }

  loadMenuCategories(): void {
    this.isLoading = true;
    this.error = null;
    this.apiService.getMenus().subscribe({
      next: (menus) => {
        this.menus = menus;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  onAddClick(): void {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  onEditClick(menu: MenuDto): void {
    this.router.navigate(['edit', menu.id], {relativeTo: this.route});
  }

  onPagesClick(menu: MenuDto): void {
    this.router.navigate([menu.id, 'pages'], {relativeTo: this.route});
  }

  onDeleteClick(menu: MenuDto): void {
    this.menuToDelete = menu;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.menuToDelete) {
      this.apiService.deleteMenu(this.menuToDelete.id).subscribe({
        next: () => {
          this.loadMenuCategories();
          this.showConfirmDialog = false;
          this.menuToDelete = null;
        },
        error: (error) => {
          this.error = error.message;
          this.showConfirmDialog = false;
          this.menuToDelete = null;
        }
      });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.menuToDelete = null;
  }

  onVisibilityChange(menu: MenuDto, isVisible: boolean): void {
    menu.isVisible = isVisible;
    this.apiService.updateMenu(menu.id, menu).subscribe({
      next: (updatedMenu) => {
        const index = this.menus.findIndex(c => c.id === updatedMenu.id);
        if (index !== -1) {
          this.menus[index] = updatedMenu;
        }
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  getLocalizedName(menu: MenuDto): string {
    if (!menu || !menu.title || !Array.isArray(menu.title)) {
      return '';
    }
    const currentLang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    const translation = menu.title.find(t => t.languageCode === currentLang);
    return translation?.value || menu.title[0]?.value || '';
  }

  getIconClass(menu: MenuDto): string {
    if (!menu.icon) {
      return 'fas fa-folder';
    }
    return menu.icon.startsWith('fas fa-') ? menu.icon : `fas fa-${menu.icon}`;
  }

  drop(event: CdkDragDrop<MenuDto[]>) {
    moveItemInArray(this.menus, event.previousIndex, event.currentIndex);

    // Mettre à jour l'ordre de tous les menus
    this.menus.forEach((menu, index) => {
      const updatedMenu = {...menu, order: index + 1};
      this.apiService.updateMenu(menu.id, updatedMenu).subscribe({
        error: (error) => {
          console.error('Error updating menu order:', error);
          this.error = 'Error updating menu order';
        }
      });
    });
  }
}
