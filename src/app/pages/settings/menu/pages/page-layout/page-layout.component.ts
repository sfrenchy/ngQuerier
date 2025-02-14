import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {LayoutEditorComponent} from '../layout-editor/layout-editor.component';
import {ApiService} from '../../../../../services/api.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule, LayoutEditorComponent],
  templateUrl: './page-layout.component.html'
})
export class PageLayoutComponent implements OnInit {
  isFullscreen = false;
  @ViewChild(LayoutEditorComponent) layoutEditor!: LayoutEditorComponent;
  pageId: number | null = null;

  constructor(
    private elementRef: ElementRef,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });
  }

  ngOnInit() {
    const pageId = this.route.snapshot.paramMap.get('pageId');
    if (pageId) {
      this.pageId = +pageId;
      this.loadLayout(this.pageId);
    }
  }

  loadLayout(pageId: number) {
    this.apiService.getLayout(pageId).subscribe({
      next: (layout) => {

        const updatedLayout = {
          ...layout,
          rows: layout.rows.map(row => ({
            ...row,
            cards: row.cards.map(card => ({
              ...card,
              backgroundColor: card.backgroundColor ?? 0xFFFFFF,
              textColor: card.textColor ?? 0,
              headerTextColor: card.headerTextColor ?? 0,
              headerBackgroundColor: card.headerBackgroundColor ?? 0xF3F4F6
            }))
          }))
        };

        if (this.layoutEditor) {
          this.layoutEditor.layout = updatedLayout;
        }
      },
      error: (error) => {
        console.error('Error loading layout:', error);
      }
    });
  }

  async toggleFullscreen(): Promise<void> {
    if (!document.fullscreenElement) {
      try {
        await this.elementRef.nativeElement.requestFullscreen();
      } catch (err) {
        console.error('Erreur lors du passage en plein écran:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error('Erreur lors de la sortie du plein écran:', err);
      }
    }
  }

  saveLayout(): void {
    const layout = this.layoutEditor.layout;
    if (!this.pageId) {
      console.error('No pageId specified for layout');
      return;
    }

    this.apiService.updateLayout(this.pageId, layout).subscribe({
      next: (updatedLayout) => {
        this.layoutEditor.layout = updatedLayout;
      },
      error: (error) => {
        console.error('Error saving layout:', error);
      }
    });
  }
}
