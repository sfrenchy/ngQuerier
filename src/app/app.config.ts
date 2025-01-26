import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { NgxEchartsModule } from 'ngx-echarts';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Loader personnalisé qui cherche les traductions dans plusieurs emplacements
export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private resources: { prefix: string; suffix: string }[] = [{
      prefix: './assets/i18n/',
      suffix: '.json'
    }]
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const requests = this.resources.map(config => {
      return this.http.get(`${config.prefix}${lang}${config.suffix}`).pipe(
        catchError(() => of(null))
      );
    });

    return forkJoin(requests).pipe(
      map(responses => {
        const result = {};
        responses.filter(r => r !== null).forEach(response => {
          Object.assign(result, response);
        });
        return result;
      })
    );
  }
}

// Factory pour créer le loader avec les emplacements de traduction
export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/', suffix: '.json' },
    { prefix: './assets/app/cards/', suffix: '/i18n/fr.json' }
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'fr',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      NgxEchartsModule.forRoot({
        echarts: () => import('echarts')
      })
    )
  ]
};
