import { Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
              import { TranslateModule } from '@ngx-translate/core';
import { LayoutEditorComponent } from '../layout-editor/layout-editor.component';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule, LayoutEditorComponent],
  templateUrl: './page-layout.component.html'
})
export class PageLayoutComponent {
  isFullscreen = false;

  constructor(private elementRef: ElementRef) {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
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
} 