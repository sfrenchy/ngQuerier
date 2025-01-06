import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const AuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Skip auth header for certain endpoints
  if (shouldSkipAuth(request.url)) {
    return next(request);
  }

  // Add auth header
  const token = localStorage.getItem('access_token');
  if (token) {
    request = addToken(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(request, next, authService);
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
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;

    return authService.refreshToken().pipe(
      switchMap(success => {
        isRefreshing = false;
        if (success) {
          const token = localStorage.getItem('access_token');
          if (token) {
            return next(addToken(request, token));
          }
        }
        authService.logout();
        return throwError(() => new Error('Session expired'));
      }),
      catchError(error => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  }
  return next(request);
}

function shouldSkipAuth(url: string): boolean {
  const authEndpoints = ['/auth/login', '/auth/refresh', '/setup', '/health'];
  return authEndpoints.some(endpoint => url.endsWith(endpoint));
} 