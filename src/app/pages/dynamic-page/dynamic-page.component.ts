import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@services/api.service';
import { ApiLayout } from '@models/api.models';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-6 h-full">
      <div *ngIf="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div *ngIf="error" class="bg-red-500 text-white p-4 rounded mb-4">
        {{ error }}
      </div>

      <div *ngIf="layout" class="space-y-4 h-full">
        <!-- En-tête de la page -->
        <div class="flex items-center gap-4 mb-6">
          <i [class]="layout.Icon + ' text-2xl text-gray-600'"></i>
          <h1 class="text-2xl font-semibold text-gray-800">
            {{ layout.Names[userService.getCurrentLanguage()] || Object.values(layout.Names)[0] }}
          </h1>
        </div>

        <!-- Contenu dynamique -->
        <div class="space-y-4 h-[calc(100%-4rem)]">
          <div *ngFor="let row of layout.Rows" 
               class="flex gap-4 h-full" 
               [style.height.px]="row.Height">
            <div *ngFor="let card of row.Cards" 
                 [style.width.%]="((card.GridWidth || 12) / 12) * 100"
                 class="rounded-lg shadow-lg overflow-hidden flex flex-col h-full"
                 [style.backgroundColor]="card.Configuration?.backgroundColor || '#1f2937'"
                 [style.color]="card.Configuration?.textColor || '#ffffff'">
              <div *ngIf="card.Configuration?.showHeader !== false" 
                   class="p-4 border-b"
                   [style.backgroundColor]="card.Configuration?.headerBackgroundColor || '#111827'"
                   [style.color]="card.Configuration?.headerTextColor || '#ffffff'">
                <h3 class="text-lg font-medium">
                  {{ card.Titles[userService.getCurrentLanguage()] || Object.values(card.Titles)[0] }}
                </h3>
              </div>
              <div class="p-4 flex-1 flex flex-col">
                <!-- Contenu de la carte -->
                <div [ngSwitch]="card.Type" class="flex-1 flex items-center justify-center">
                  <div *ngSwitchCase="'placeholder'" class="text-center">
                    <p>{{ card.Configuration?.centerLabel?.[userService.getCurrentLanguage()] || card.Configuration?.centerLabel?.['fr'] }}</p>
                  </div>
                  <div *ngSwitchDefault>
                    <p>Type de carte non supporté: {{ card.Type }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DynamicPageComponent implements OnInit {
  protected readonly Object = Object;
  layout: ApiLayout | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPageLayout(parseInt(params['id'], 10));
      }
    });
  }

  private loadPageLayout(pageId: number) {
    this.isLoading = true;
    this.error = null;
    console.log('Loading layout for page:', pageId);
    
    this.apiService.getLayout(pageId).subscribe({
      next: (layout) => {
        console.log('Layout loaded:', layout);
        this.layout = layout;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading layout:', error);
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }
} 