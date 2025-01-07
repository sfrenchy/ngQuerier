import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'settings',
        children: [
          {
            path: 'api',
            loadComponent: () => import('./pages/settings/api-settings/api-settings.component').then(m => m.ApiSettingsComponent)
          },
          {
            path: 'roles',
            loadComponent: () => import('./pages/settings/roles/roles.component').then(m => m.RolesComponent)
          }
        ]
      }
    ]
  }
];
