import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {LanguageSelectorComponent} from '@components/language-selector/language-selector.component';
import {SideMenuComponent} from '@components/side-menu/side-menu.component';
import {UserAvatarComponent} from '@components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    LanguageSelectorComponent,
    SideMenuComponent,
    UserAvatarComponent
  ]
})
export class HomeComponent {
}
