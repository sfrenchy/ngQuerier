import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '@services/user.service';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './side-menu.component.html'
})
export class SideMenuComponent {
  isExpanded = false;
  isSettingsExpanded = false;
  isPinned = false;
  private collapseTimeout: any;

  constructor(
    public userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  onMouseEnter(): void {
    if (!this.isPinned) {
      this.isExpanded = true;
    }
  }

  onMouseLeave(): void {
    if (!this.isPinned) {
      this.isExpanded = false;
      this.isSettingsExpanded = false;
    }
  }

  togglePin(): void {
    this.isPinned = !this.isPinned;
    if (this.isPinned) {
      this.isExpanded = true;
    }
  }

  toggleSettings(): void {
    this.isSettingsExpanded = !this.isSettingsExpanded;
  }

  async onLogout(): Promise<void> {
    this.authService.logout();
    await this.router.navigate(['/login']);
  }
} 