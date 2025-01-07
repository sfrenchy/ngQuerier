import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">{{ 'SETTINGS.USERS.TITLE' | translate }}</h2>
      <!-- Contenu à venir -->
    </div>
  `
})
export class UsersComponent {} 