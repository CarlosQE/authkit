import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment, Route } from '@angular/router';

import { AuthService } from '@core/auth/services/auth.service';
import { UserRole } from '@core/auth/models/auth.models';

// Guard parametrizable por rol.
// Uso en rutas: canMatch: [roleGuard(UserRole.Admin)]
export const roleGuard = (requiredRole: UserRole): CanMatchFn => {
  return (_route: Route, _segments: UrlSegment[]) => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (auth.userRole() === requiredRole) {
      return true;
    }

    // Autenticado pero sin el rol necesario → página de acceso denegado.
    return router.createUrlTree(['/unauthorized']);
  };
};