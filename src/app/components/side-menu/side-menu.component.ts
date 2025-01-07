import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './side-menu.component.html'
})
export class SideMenuComponent {
  isExpanded = false;
  private collapseTimeout: any;

  onMouseEnter(): void {
    clearTimeout(this.collapseTimeout);
    this.isExpanded = true;
  }

  onMouseLeave(): void {
    this.collapseTimeout = setTimeout(() => {
      this.isExpanded = false;
    }, 3000); // 3 secondes avant repli
  }
} 