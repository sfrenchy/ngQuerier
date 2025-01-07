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
        path: 'databases',
        loadComponent: () => import('./pages/databases/databases.component').then(m => m.DatabasesComponent)
      },
      {
        path: 'queries',
        loadComponent: () => import('./pages/queries/queries.component').then(m => m.QueriesComponent)
      },
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
          },
          {
            path: 'users',
            loadComponent: () => import('./pages/settings/users/users.component').then(m => m.UsersComponent)
          }
        ]
      }
    ]
  },
  {
    path: 'queries',
    loadComponent: () => import('./pages/queries/queries.component').then(m => m.QueriesComponent),
    canActivate: [authGuard]
  }
];
