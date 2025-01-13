import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuDto, PageDto } from '@models/api.models';
import { ApiService } from '@services/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, FontAwesomeModule]
})
export class PageListComponent implements OnInit {
  pages: PageDto[] = [];
  menu?: MenuDto;
  isLoading = false;
  error: string | null = null;

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
    const categoryId = this.route.snapshot.paramMap.get('categoryId');
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
    if (this.menu) {
      this.router.navigate(['new'], { relativeTo: this.route });
    }
  }

  onEditClick(page: PageDto): void {
    this.router.navigate(['edit', page.id], { relativeTo: this.route });
  }

  onLayoutClick(page: PageDto): void {
    this.router.navigate(['layout', page.id], { relativeTo: this.route });
  }

  onDeleteClick(page: PageDto): void {
    if (confirm(this.translate.instant('COMMON.CONFIRMATION.DELETE_PAGE', { name: this.getLocalizedName(page) }))) {
      this.apiService.deletePage(page.id).subscribe({
        next: () => {
          if (this.menu) {
            this.loadPages(this.menu.id);
          }
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  getLocalizedName(item: PageDto | MenuDto): string {
    if (!item || !item.title) {
      return '';
    }
    const currentLang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    return item.title.find(t => t.languageCode === currentLang)?.value || '';
  }
} 