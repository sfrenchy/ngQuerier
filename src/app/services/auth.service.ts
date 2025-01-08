import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { AuthStateService } from './auth-state.service';
import { User } from '@models/api.models';

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
    return this.apiService.signIn(email, password).pipe(
      map(response => {
        if (response && response.Token) {
          this.authStateService.setTokens(response.Token, response.RefreshToken);
          
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
    this.authStateService.clearTokens();
    this.userService.setCurrentUser(null);
    this.apiService.signOut().subscribe();
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