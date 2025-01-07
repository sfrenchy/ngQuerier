import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, Role } from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user?.Roles) {
      return false;
    }
    
    return user.Roles.some(r => {
      if (typeof r === 'string') {
        return r === roleName;
      }
      return r.Name === roleName;
    });
  }

  hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some(roleName => this.hasRole(roleName));
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  canManageDatabase(): boolean {
    return this.hasAnyRole(['Admin', 'Database Manager']);
  }

  canManageContent(): boolean {
    return this.hasAnyRole(['Admin', 'Content Manager']);
  }
} 