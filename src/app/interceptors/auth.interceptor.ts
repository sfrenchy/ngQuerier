import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AuthStateService } from '../services/auth-state.service';
import { ApiService } from '../services/api.service';

export const AuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authStateService = inject(AuthStateService);
  const apiService = inject(ApiService);

  // Skip auth header for certain endpoints
  if (shouldSkipAuth(request.url)) {
    return next(request);
  }

  // Add auth header
  const token = authStateService.getAccessToken();
  if (token) {
    request = addToken(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
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
  return authStateService.isRefreshing$.pipe(
    take(1),
    switchMap(isRefreshing => {
      if (!isRefreshing) {
        authStateService.setRefreshing(true);
        const refreshToken = authStateService.getRefreshToken();

        if (!refreshToken) {
          authStateService.clearTokens();
          return throwError(() => new Error('No refresh token'));
        }

        return apiService.refreshToken(refreshToken).pipe(
          switchMap(response => {
            authStateService.setRefreshing(false);
            if (response && response.Token) {
              authStateService.setTokens(response.Token, response.RefreshToken);
              return next(addToken(request, response.Token));
            }
            authStateService.clearTokens();
            return throwError(() => new Error('Token refresh failed'));
          }),
          catchError(error => {
            authStateService.setRefreshing(false);
            authStateService.clearTokens();
            return throwError(() => error);
          })
        );
      }
      return next(request);
    })
  );
}

function shouldSkipAuth(url: string): boolean {
  const authEndpoints = ['/auth/login', '/auth/refresh', '/setup', '/health'];
  return authEndpoints.some(endpoint => url.endsWith(endpoint));
} 