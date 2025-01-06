import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private apiService: ApiService) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<boolean> {
    return this.apiService.signIn(email, password).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);
          this.loadCurrentUser();
          return true;
        }
        return false;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.apiService.signOut().subscribe();
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return new Observable(subscriber => subscriber.error('No refresh token'));
    }

    return this.apiService.refreshToken(refreshToken).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);
          return response;
        }
        throw new Error('Invalid refresh token response');
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private loadCurrentUser(): void {
    this.apiService.getCurrentUser().subscribe(
      user => this.currentUserSubject.next(user),
      error => {
        console.error('Error loading user:', error);
        this.currentUserSubject.next(null);
      }
    );
  }

  private getUserFromStorage(): User | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      this.loadCurrentUser();
      return this.currentUserValue;
    } catch {
      return null;
    }
  }
} 