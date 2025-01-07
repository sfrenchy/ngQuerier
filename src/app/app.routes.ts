import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    children: [
      {
        path: 'home',
        redirectTo: 'services',
        pathMatch: 'full'
      },
      {
        path: 'services',
        loadComponent: () => import('./pages/settings/api-settings/api-settings.component').then(m => m.ApiSettingsComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
