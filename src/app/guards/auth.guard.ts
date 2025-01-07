import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const isAuthenticated = authService.isAuthenticated();
  if (isAuthenticated) {
    return of(true);
  }
  
  router.navigate(['/login']);
  return of(false);
}; 