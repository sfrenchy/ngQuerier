import { Component, OnInit, NgModuleRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgComponentOutlet } from '@angular/common';
import { CardService } from '@cards/card.service';
import { LayoutDto, RowDto, CardDto } from '@models/api.models';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-dynamic-page',
  templateUrl: './dynamic-page.component.html',
  styleUrls: ['./dynamic-page.component.css'],
  standalone: true,
  imports: [CommonModule, NgComponentOutlet]
})
export class DynamicPageComponent implements OnInit {
  layout: LayoutDto | null = null;
  isLoading = true;
  error: string | null = null;
  private cardComponents = new Map<string, any>();

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cardService: CardService,
    public moduleRef: NgModuleRef<any>
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const pageId = params['id'];
      if (pageId) {
        this.loadLayout(pageId);
      }
    });
  }

  private loadLayout(pageId: number) {
    this.isLoading = true;
    this.error = null;

    this.apiService.getLayout(pageId).subscribe({
      next: (layout) => {
        this.layout = layout;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading layout:', err);
        this.error = 'Error loading page layout';
        this.isLoading = false;
      }
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