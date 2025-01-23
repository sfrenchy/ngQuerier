import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authStateService = inject(AuthStateService);

  if (authStateService.getAccessToken()) {
    return true;
  }

  // Rediriger vers la page de login
  return router.createUrlTree(['/login']);
}; 