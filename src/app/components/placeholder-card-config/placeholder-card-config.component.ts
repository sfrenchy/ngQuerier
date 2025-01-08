import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlaceholderCard } from '@models/page-layout.models';
import { BaseCardConfigComponent } from '@components/base-card-config/base-card-config.component';

@Component({
  selector: 'app-placeholder-card-config',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './placeholder-card-config.component.html'
})
export class PlaceholderCardConfigComponent extends BaseCardConfigComponent<PlaceholderCard> {
  expandedPanels = {
    title: true,
    colors: false,
    layout: false,
    specific: false
  };

  override isFullscreen = false;

  override toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }
} 