import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { User } from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) {
    this.checkAuth();
  }

  login(email: string, password: string): Observable<boolean> {
    return this.apiService.signIn(email, password).pipe(
      map(response => {
        if (response && response.Token) {
          localStorage.setItem('access_token', response.Token);
          localStorage.setItem('refresh_token', response.RefreshToken);
          
          // Mise à jour des informations utilisateur
          this.userService.setCurrentUser({
            Id: response.Id,
            Email: response.Email,
            FirstName: response.FirstName,
            LastName: response.LastName,
            Phone: null,
            Roles: response.Roles,
            LanguageCode: null,
            Img: null,
            Poste: null,
            UserName: response.Email,
            DateFormat: null,
            Currency: null,
            AreaUnit: null,
            IsEmailConfirmed: response.IsEmailConfirmed
          });
          
          return true;
        }
        return false;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.userService.setCurrentUser(null);
    this.apiService.signOut().subscribe();
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return of(false);
    }

    return this.apiService.refreshToken(refreshToken).pipe(
      map(response => {
        if (response && response.Token) {
          localStorage.setItem('access_token', response.Token);
          localStorage.setItem('refresh_token', response.RefreshToken);
          return true;
        }
        return false;
      })
    );
  }

  private checkAuth(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.apiService.getCurrentUser().subscribe({
        next: (user) => {
          this.userService.setCurrentUser(user);
        },
        error: () => {
          this.userService.setCurrentUser(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      });
    } else {
      this.userService.setCurrentUser(null);
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
} 