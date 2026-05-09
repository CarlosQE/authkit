import { inject } from '@angular/core';
import { CanMatchFn, CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@core/auth/services/auth.service';

// Protege rutas que requieren sesion activa.
// CanMatchFn es preferible a CanActiveFn para lazy routes:
// si no hacematch, Angular ni siquiera carga el chunk del feature.
export const authGuard: CanMatchFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated()){
        return true;
    }

    return router.createUrlTree(['/auth/login']);
};

// Version CanActivateGuard para rutas que ya estan agregadas
export const AuthActivateGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated()){
        return true;
    }

    return router.createUrlTree(['/auth/login']);
};
