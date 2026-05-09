import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '@core/auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Si no hay token, dejamos pasar el request sin modificar
  // (rutas públicas como login/register no necesitan token).
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 = token expirado. Intentamos renovarlo una vez.
      // Si el refresh también falla, AuthService hace logout automático.
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` },
            });
            return next(retryReq);
          })
        );
      }

      return throwError(() => error);
    })
  );
};