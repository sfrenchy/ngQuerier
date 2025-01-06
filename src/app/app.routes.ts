import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AddApiComponent } from './pages/add-api/add-api.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'add-api',
    component: AddApiComponent
  }
];
