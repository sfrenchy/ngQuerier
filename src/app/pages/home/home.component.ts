import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideMenuComponent } from '@components/side-menu/side-menu.component';
import { UserAvatarComponent } from '@components/user-avatar/user-avatar.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SideMenuComponent,
    UserAvatarComponent,
    TranslateModule
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {} 