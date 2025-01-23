import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthStateService } from '../services/auth-state.service';
import { ApiService } from '../services/api.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authStateService = inject(AuthStateService);
  const apiService = inject(ApiService);

  // Ne pas ajouter le token pour les requêtes d'authentification
  if (request.url.includes('/Authentication/SignIn') || request.url.includes('/Authentication/RefreshToken')) {
    return next(request);
  }

  const token = authStateService.getAccessToken();
  if (token) {
    request = addToken(request, token);
  }

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(request, next, authStateService, apiService);
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authStateService: AuthStateService,
  apiService: ApiService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const token = authStateService.getAccessToken();
    const refreshToken = authStateService.getRefreshToken();
    
    if (token && refreshToken) {
      return apiService.refreshToken({ token, refreshToken }).pipe(
        switchMap(response => {
          isRefreshing = false;
          authStateService.setTokens(response.token, response.refreshToken);
          refreshTokenSubject.next(response.token);
          return next(addToken(request, response.token));
        }),
        catchError(error => {
          isRefreshing = false;
          authStateService.clearTokens();
          return throwError(() => error);
        })
      );
    }
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap(token => next(addToken(request, token)))
  );
} 