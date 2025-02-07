import { Component, OnInit, OnDestroy, NgModuleRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { CardService } from '@cards/card.service';
import { LayoutDto, RowDto, CardDto } from '@models/api.models';
import { ApiService } from '@services/api.service';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dynamic-page',
  templateUrl: './dynamic-page.component.html',
  styleUrls: ['./dynamic-page.component.css'],
  standalone: true,
  imports: [CommonModule, NgComponentOutlet, TranslateModule]
})
export class DynamicPageComponent implements OnInit, OnDestroy {
  layout: LayoutDto | null = null;
  isLoading = true;
  error: string | null = null;
  private cardComponents = new Map<string, any>();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cardService: CardService,
    private translate: TranslateService,
    public moduleRef: NgModuleRef<any>
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: params => {
          const pageId = Number(params['id']);
          if (!isNaN(pageId)) {
            this.loadLayout(pageId);
          } else {
            this.handleError('Invalid page ID');
            this.router.navigate(['/']);
          }
        },
        error: err => this.handleError(err)
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLayout(pageId: number) {
    this.isLoading = true;
    this.error = null;

    this.apiService.getLayout(pageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (layout) => {
          this.layout = layout;
          this.isLoading = false;
          this.preloadCardComponents();
        },
        error: (err) => {
          console.error('Error loading layout:', err);
          this.handleError(err);
        }
      });
  }

  private handleError(error: any) {
    this.isLoading = false;
    if (typeof error === 'string') {
      this.error = this.translate.instant(error);
    } else if (error?.error?.message) {
      this.error = this.translate.instant(error.error.message);
    } else {
      this.error = this.translate.instant('COMMON.ERROR.LOADING_PAGE');
    }
  }

  private preloadCardComponents() {
    if (!this.layout) return;

    // Précharger tous les composants de cartes pour éviter les micro-délais lors du rendu
    this.layout.rows.forEach(row => {
      row.cards.forEach(card => {
        this.getCardComponent(card);
      });
    });
  }

  getCardComponent(card: CardDto) {
    const type = card.type;
    if (!this.cardComponents.has(type)) {
      const component = this.cardService.getCardByType(type);
      this.cardComponents.set(type, {
        component,
        inputs: {
          card: card,
          isEditing: false
        }
      });
    } else {
      const cardComponent = this.cardComponents.get(type);
      cardComponent.inputs = {
        card: card,
        isEditing: false
      };
    }
    return this.cardComponents.get(type);
  }
}
