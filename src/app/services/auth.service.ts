import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { AuthStateService } from './auth-state.service';
import { SignInDto, UserDto } from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private authStateService: AuthStateService
  ) {
    this.checkAuth();
  }

  login(email: string, password: string): Observable<boolean> {
    const dto: SignInDto = { 
      email: email,
      password: password
    };
    return this.apiService.signIn(dto).pipe(
      map(response => {
        if (response && response.token) {
          this.authStateService.setTokens(response.token, response.refreshToken);
          return true;
        }
        return false;
      }),
      switchMap(success => {
        if (success) {
          return this.apiService.getCurrentUser().pipe(
            tap(user => {
              this.userService.setCurrentUser(user);
            }),
            map(() => true),
            catchError(error => {
              console.error('Failed to load user data:', error);
              return of(false);
            })
          );
        }
        return of(false);
      })
    );
  }

  logout(): Observable<boolean> {
    const refreshToken = this.authStateService.getRefreshToken();
    if (refreshToken) {
      return this.apiService.signOut(refreshToken).pipe(
        map(response => {
          if (response.success) {
            this.authStateService.clearTokens();
            this.userService.setCurrentUser(null);
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error('Failed to sign out:', error);
          // Even if the API call fails, we clear the local state
          this.authStateService.clearTokens();
          this.userService.setCurrentUser(null);
          return of(false);
        })
      );
    }
    
    // If no refresh token, just clear local state
    this.authStateService.clearTokens();
    this.userService.setCurrentUser(null);
    return of(true);
  }

  private checkAuth(): void {
    const token = this.authStateService.getAccessToken();
    if (token) {
      this.apiService.getCurrentUser().pipe(
        catchError(error => {
          console.error('Failed to load user data during auth check:', error);
          this.userService.setCurrentUser(null);
          this.authStateService.clearTokens();
          return of(null);
        })
      ).subscribe(user => {
        if (user) {
          this.userService.setCurrentUser(user);
        }
      });
    } else {
      this.userService.setCurrentUser(null);
    }
  }

  isAuthenticated(): boolean {
    return !!this.authStateService.getAccessToken();
  }
} 