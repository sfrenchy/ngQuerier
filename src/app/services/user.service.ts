import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {RoleDto, UserDto} from '@models/api.models';
import {ApiService} from '@services/api.service';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<UserDto | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private translateService: TranslateService
  ) {
  }

  setCurrentUser(user: UserDto | null): void {
    this.currentUserSubject.next(user);
    this.translateService.use("fr");

  }

  getCurrentUser(): UserDto | null {
    return this.currentUserSubject.value;
  }

  getCurrentLanguage(): string {
    const user = this.getCurrentUser();
    return 'fr';
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user?.roles) {
      return false;
    }

    return user.roles.some((r: RoleDto) => {
      if (typeof r === 'string') {
        return r === roleName;
      }
      return r.name === roleName;
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

  getRoles() {
    return this.apiService.getAllRoles();
  }
}
