import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {MenuDto, PageDto} from '@models/api.models';
import {ApiService} from '@services/api.service';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {CdkDragDrop, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';
import {ConfirmationDialogComponent} from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, FontAwesomeModule, DragDropModule, RouterModule, ConfirmationDialogComponent]
})
export class PageListComponent implements OnInit {
  pages: PageDto[] = [];
  menu?: MenuDto;
  isLoading = false;
  error: string | null = null;
  showConfirmDialog = false;
  pageToDelete: PageDto | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private library: FaIconLibrary
  ) {
    library.addIconPacks(fas);
  }

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (categoryId) {
      this.loadMenu(+categoryId);
      this.loadPages(+categoryId);
    }
  }

  loadMenu(id: number): void {
    this.apiService.getMenu(id).subscribe({
      next: (menu) => {
        this.menu = menu;
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  loadPages(menuId: number): void {
    this.isLoading = true;
    this.error = null;
    this.apiService.getMenuPages(menuId).subscribe({
      next: (pages) => {
        this.pages = pages.sort((a, b) => a.order - b.order);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  onAddClick(): void {
    const menuId = this.route.snapshot.paramMap.get('id');
    if (menuId) {
      this.router.navigate(['new'], {relativeTo: this.route});
    }
  }

  onEditClick(page: PageDto): void {
    this.router.navigate([page.id], {relativeTo: this.route});
  }

  onLayoutClick(page: PageDto): void {
    this.router.navigate([page.id, 'layout'], {relativeTo: this.route});
  }

  onDeleteClick(page: PageDto): void {
    this.pageToDelete = page;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.pageToDelete) {
      this.apiService.deletePage(this.pageToDelete.id).subscribe({
        next: () => {
          if (this.menu) {
            this.loadPages(this.menu.id);
          }
          this.showConfirmDialog = false;
          this.pageToDelete = null;
        },
        error: (error) => {
          this.error = error.message;
          this.showConfirmDialog = false;
          this.pageToDelete = null;
        }
      });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.pageToDelete = null;
  }

  getLocalizedName(item: PageDto | MenuDto): string {
    if (!item || !item.title) {
      return '';
    }
    const currentLang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    return item.title.find(t => t.languageCode === currentLang)?.value || '';
  }

  drop(event: CdkDragDrop<PageDto[]>) {
    if (event.previousIndex === event.currentIndex) return;

    // Garder une copie de l'ordre original au cas où
    const originalPages = [...this.pages];

    // Mettre à jour l'ordre localement
    moveItemInArray(this.pages, event.previousIndex, event.currentIndex);

    // Mettre à jour l'ordre de toutes les pages
    this.pages.forEach((page, index) => {
      page.order = index + 1;
    });

    // Sauvegarder le nouvel ordre sur le serveur
    if (this.menu) {
      // Convertir les Observables en Promises
      const updates = this.pages.map(page => {
        const updatedPage: PageDto = {
          ...page,
          order: page.order
        };

        // Convertir l'Observable en Promise
        return new Promise((resolve, reject) => {
          this.apiService.updatePage(page.id, updatedPage).subscribe({
            next: (result) => resolve(result),
            error: (error) => reject(error)
          });
        });
      });

      // Attendre que toutes les mises à jour soient terminées
      Promise.all(updates).then(
        () => {
          // Ne pas recharger les pages car l'ordre local est déjà correct
        },
        (error) => {
          // En cas d'erreur, restaurer l'ordre original et afficher l'erreur
          this.pages = originalPages;
          this.error = error.message;
        }
      );
    }
  }
}
