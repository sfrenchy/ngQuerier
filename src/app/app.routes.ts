import { Routes } from '@angular/router';
import { LoginComponent } from '@pages/login/login.component';
import { AddApiComponent } from '@pages/add-api/add-api.component';
import { AdminConfigurationComponent } from '@pages/configure-api/admin-configuration/admin-configuration.component';
import { SmtpConfigurationComponent } from '@pages/configure-api/smtp-configuration/smtp-configuration.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('@pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'add-api',
    component: AddApiComponent
  },
  {
    path: 'configure',
    children: [
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full'
      },
      {
        path: 'admin',
        component: AdminConfigurationComponent
      },
      {
        path: 'smtp',
        component: SmtpConfigurationComponent
      }
    ]
  }
];
