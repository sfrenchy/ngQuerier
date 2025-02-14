import {Component, NgModuleRef, OnDestroy, OnInit} from '@angular/core';
import {CommonModule, NgComponentOutlet} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {CardService} from '@cards/card.service';
import {CardDto, CardDtoWithMaxHeight, LayoutDto} from '@models/api.models';
import {ApiService} from '@services/api.service';
import {forkJoin, Observable, of, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

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
  private static layoutCache = new Map<number, LayoutDto>();
  private static dataCache = new Map<string, any>();
  private refreshIntervals = new Map<string, number>();
  private cardUpdateTimes = new Map<string, number>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cardService: CardService,
    private translate: TranslateService,
    public moduleRef: NgModuleRef<any>
  ) {
  }

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
    // Nettoyer les intervalles
    this.refreshIntervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.refreshIntervals.clear();

    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLayout(pageId: number) {
    this.isLoading = true;
    this.error = null;

    // Vérifier le cache du layout
    if (DynamicPageComponent.layoutCache.has(pageId)) {
      this.layout = DynamicPageComponent.layoutCache.get(pageId)!;
      this.isLoading = false;
      this.preloadCardComponents();
      this.preloadCardData();
      return;
    }

    this.apiService.getLayout(pageId)
      .pipe(
        tap(layout => {
          DynamicPageComponent.layoutCache.set(pageId, layout);
          this.layout = layout;
        }),
        switchMap(layout => this.preloadCardData()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
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

    this.layout.rows.forEach(row => {
      row.cards.forEach(card => {
        this.getCardComponent(card, 0);
        this.setupCardRefresh(card);
      });
    });
  }

  getCardComponent(card: CardDto, maxHeight: number) {
    const type = card.type;
    // Étendre le CardDto avec maxHeight
    const cardWithHeight: CardDtoWithMaxHeight = {
      ...card,
      maxHeight: maxHeight
    };

    if (!this.cardComponents.has(type)) {
      const component = this.cardService.getCardByType(type);
      this.cardComponents.set(type, {
        component,
        inputs: {
          card: cardWithHeight,
          isEditing: false
        }
      });
    } else {
      const cardComponent = this.cardComponents.get(type);
      cardComponent.inputs = {
        card: cardWithHeight,
        isEditing: false
      };
    }
    return this.cardComponents.get(type);
  }

  private preloadCardData(): Observable<any> {
    if (!this.layout) return of(null);

    const dataRequests = this.layout.rows
      .flatMap(row => row.cards)
      .map(card => {
        const cacheKey = `${card.type}_${JSON.stringify(card.configuration)}`;
        if (DynamicPageComponent.dataCache.has(cacheKey)) {
          return of(DynamicPageComponent.dataCache.get(cacheKey));
        }

        // Obtenir la factory pour ce type de carte
        const factory = this.cardService.getConfigFactory(card.type);
        // Vérifier si la factory et loadData existent
        if (!factory || typeof (factory as any).loadData !== 'function') {
          return of(null);
        }

        return factory.loadData(card.configuration).pipe(
          tap(data => DynamicPageComponent.dataCache.set(cacheKey, data))
        );
      });

    return forkJoin(dataRequests);
  }

  // Méthode pour récupérer les données préchargées
  getCardData(card: CardDto): any {
    const cacheKey = `${card.type}_${JSON.stringify(card.configuration)}`;
    return DynamicPageComponent.dataCache.get(cacheKey);
  }

  // Optionnel : méthode pour invalider le cache si nécessaire
  static clearLayoutCache(pageId?: number) {
    if (pageId) {
      DynamicPageComponent.layoutCache.delete(pageId);
    } else {
      DynamicPageComponent.layoutCache.clear();
    }
  }

  private setupCardRefresh(card: CardDto) {
    const factory = this.cardService.getConfigFactory(card.type);
    if (!factory || !factory.getRefreshInterval) return;

    const refreshInterval = factory.getRefreshInterval(card.configuration);
    if (!refreshInterval) return;

    const cardKey = `${card.type}_${card.id}`;

    // Éviter les doublons d'intervalles
    if (this.refreshIntervals.has(cardKey)) {
      clearInterval(this.refreshIntervals.get(cardKey));
    }

    const intervalId = window.setInterval(() => {
      this.updateCardData(card);
    }, refreshInterval);

    this.refreshIntervals.set(cardKey, intervalId);
  }

  private updateCardData(card: CardDto) {
    const factory = this.cardService.getConfigFactory(card.type);
    if (!factory) return;

    const cacheKey = `${card.type}_${JSON.stringify(card.configuration)}`;
    const lastUpdate = this.cardUpdateTimes.get(cacheKey) || 0;
    const now = Date.now();

    // Éviter les mises à jour trop fréquentes
    if (now - lastUpdate < 1000) return;

    factory.loadData(card.configuration).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: any) => {
        DynamicPageComponent.dataCache.set(cacheKey, data);
        this.cardUpdateTimes.set(cacheKey, now);
        this.updateCardComponent(card);
      }
    });
  }

  private updateCardComponent(card: CardDto) {
    const type = card.type;
    if (this.cardComponents.has(type)) {
      const cardComponent = this.cardComponents.get(type);
      cardComponent.inputs = {
        ...cardComponent.inputs,
        card: {
          ...card,
          data: this.getCardData(card)
        }
      };
    }
  }
}
