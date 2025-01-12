import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('@pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        children: [
          {
            path: 'layout/:id',
            loadComponent: () => import('./pages/dynamic-page/dynamic-page.component').then(m => m.DynamicPageComponent)
          }
        ]
      },
      {
        path: 'home/:id',
        loadComponent: () => import('@pages/dynamic-page/dynamic-page.component').then(m => m.DynamicPageComponent)
      },
      {
        path: 'databases',
        loadComponent: () => import('@pages/databases/databases.component').then(m => m.DatabasesComponent)
      },
      {
        path: 'queries',
        loadComponent: () => import('@pages/queries/queries.component').then(m => m.QueriesComponent)
      },
      {
        path: 'contents',
        redirectTo: 'settings/menu',
        pathMatch: 'full'
      },
      {
        path: 'settings',
        children: [
          {
            path: 'api',
            loadComponent: () => import('@pages/settings/api-settings/api-settings.component').then(m => m.ApiSettingsComponent)
          },
          {
            path: 'roles',
            loadComponent: () => import('@pages/settings/roles/roles.component').then(m => m.RolesComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('@pages/settings/users/users.component').then(m => m.UsersComponent)
          },
          {
            path: 'menu',
            children: [
              {
                path: '',
                loadComponent: () => import('@pages/settings/menu/menu-list/menu-list.component').then(m => m.MenuListComponent),
                canActivate: [authGuard]
              },
              {
                path: 'new',
                loadComponent: () => import('@pages/settings/menu/menu-form/menu-form.component').then(m => m.MenuFormComponent),
                canActivate: [authGuard]
              },
              {
                path: 'edit/:id',
                loadComponent: () => import('@pages/settings/menu/menu-form/menu-form.component').then(m => m.MenuFormComponent),
                canActivate: [authGuard]
              },
              {
                path: 'category/:categoryId/pages',
                children: [
                  {
                    path: '',
                    loadComponent: () => import('@pages/settings/menu/pages/page-list/page-list.component').then(m => m.PageListComponent),
                    canActivate: [authGuard]
                  },
                  {
                    path: 'new',
                    loadComponent: () => import('@pages/settings/menu/pages/page-form/page-form.component').then(m => m.PageFormComponent),
                    canActivate: [authGuard]
                  },
                  {
                    path: 'edit/:id',
                    loadComponent: () => import('@pages/settings/menu/pages/page-form/page-form.component').then(m => m.PageFormComponent),
                    canActivate: [authGuard]
                  }
                ]
              }
            ]
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
