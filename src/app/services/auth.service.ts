import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

interface AuthResponse {
  token: string;
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.checkAuth();
  }

  login(email: string, password: string): Observable<boolean> {
    return this.apiService.signIn(email, password).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);
          this.checkAuth();
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.apiService.signOut().subscribe();
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return of(false);
    }

    return this.apiService.refreshToken(refreshToken).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  private checkAuth(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.apiService.getCurrentUser().subscribe({
        next: (user: User) => this.currentUserSubject.next(user),
        error: () => {
          this.currentUserSubject.next(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      });
    } else {
      this.currentUserSubject.next(null);
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
} 