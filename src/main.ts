import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {importProvidersFrom} from '@angular/core';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {CardInitializerService} from './app/cards/available-cards';
import {AuthInterceptor} from './app/interceptors/auth.interceptor';
import {authGuard} from './app/guards/auth.guard';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideAnimations(),
    CardInitializerService,
    provideRouter(
      [
        {
          path: '',
          redirectTo: 'home',
          pathMatch: 'full'
        },
        {
          path: 'login',
          loadComponent: () => import('./app/pages/login/login.component').then(m => m.LoginComponent)
        },
        {
          path: 'add-api',
          loadComponent: () => import('./app/pages/add-api/add-api.component').then(m => m.AddApiComponent)
        },
        {
          path: 'configure',
          children: [
            {
              path: 'smtp',
              loadComponent: () => import('./app/pages/configure-api/smtp-configuration/smtp-configuration.component').then(m => m.SmtpConfigurationComponent)
            },
            {
              path: 'admin',
              loadComponent: () => import('./app/pages/configure-api/admin-configuration/admin-configuration.component').then(m => m.AdminConfigurationComponent)
            }
          ]
        },
        {
          path: 'home',
          canActivate: [authGuard],
          loadComponent: () => import('./app/pages/home/home.component').then(m => m.HomeComponent),
          children: [
            {
              path: '',
              redirectTo: 'settings/menu',
              pathMatch: 'full'
            },
            {
              path: 'databases',
              loadComponent: () => import('./app/pages/databases/databases.component').then(m => m.DatabasesComponent)
            },
            {
              path: 'queries',
              loadComponent: () => import('./app/pages/queries/queries.component').then(m => m.QueriesComponent)
            },
            {
              path: 'page/:id',
              loadComponent: () => import('./app/pages/dynamic-page/dynamic-page.component').then(m => m.DynamicPageComponent)
            },
            {
              path: 'contents',
              children: [
                {
                  path: '',
                  loadComponent: () => import('./app/pages/settings/menu/menu-list/menu-list.component').then(m => m.MenuListComponent)
                },
                {
                  path: 'new',
                  loadComponent: () => import('./app/pages/settings/menu/menu-form/menu-form.component').then(m => m.MenuFormComponent)
                },
                {
                  path: 'edit/:id',
                  loadComponent: () => import('./app/pages/settings/menu/menu-form/menu-form.component').then(m => m.MenuFormComponent)
                },
                {
                  path: ':id/pages',
                  loadComponent: () => import('./app/pages/settings/menu/pages/page-list/page-list.component').then(m => m.PageListComponent)
                },
                {
                  path: ':id/pages/new',
                  loadComponent: () => import('./app/pages/settings/menu/pages/page-form/page-form.component').then(m => m.PageFormComponent)
                },
                {
                  path: ':id/pages/:pageId',
                  loadComponent: () => import('./app/pages/settings/menu/pages/page-form/page-form.component').then(m => m.PageFormComponent)
                },
                {
                  path: ':id/pages/:pageId/layout',
                  loadComponent: () => import('./app/pages/settings/menu/pages/page-layout/page-layout.component').then(m => m.PageLayoutComponent)
                }
              ]
            },
            {
              path: 'settings',
              children: [
                {
                  path: 'menu',
                  loadChildren: () => import('./app/pages/settings/menu/menu.routes').then(m => m.routes)
                },
                {
                  path: 'users',
                  loadComponent: () => import('./app/pages/settings/users/users.component').then(m => m.UsersComponent)
                },
                {
                  path: 'roles',
                  loadComponent: () => import('./app/pages/settings/roles/roles.component').then(m => m.RolesComponent)
                },
                {
                  path: 'api',
                  loadComponent: () => import('./app/pages/settings/api-settings/api-settings.component').then(m => m.ApiSettingsComponent)
                }
              ]
            }
          ]
        }
      ],
      withComponentInputBinding()
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
}).then(appRef => {
  // Initialiser les cartes
  const cardInitializer = appRef.injector.get(CardInitializerService);
  cardInitializer.initialize();
}).catch(err => console.error(err));
