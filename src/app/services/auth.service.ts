import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { AuthStateService } from './auth-state.service';
import { SignInDto, User } from '@models/api.models';

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
      tap(success => {
        if (success) {
          this.apiService.getCurrentUser().subscribe(user => {
            this.userService.setCurrentUser(user);
          });
        }
      })
    );
  }

  logout(): void {
    this.authStateService.clearTokens();
    this.userService.setCurrentUser(null);
    // this.apiService.signOut().subscribe();
  }

  private checkAuth(): void {
    const token = this.authStateService.getAccessToken();
    if (token) {
      this.apiService.getCurrentUser().subscribe({
        next: (user) => {
          this.userService.setCurrentUser(user);
        },
        error: () => {
          this.userService.setCurrentUser(null);
          this.authStateService.clearTokens();
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