import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '@core/auth/services/auth.service';

// Evita que un usuario autenticado acceda a /auth/login o /auth/register.
// Si ya tiene sesión, lo redirige directo al dashboard.
export const guestGuard: CanMatchFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};