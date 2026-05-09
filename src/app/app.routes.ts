import { Routes } from '@angular/router';

import { authGuard } from '@core/auth/guards/auth.guard';
import { guestGuard } from '@core/auth/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canMatch: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
    {
  path: 'unauthorized',
  loadComponent: () =>
    import('./shared/components/unauthorized/unauthorized').then(
      m => m.Unauthorized
    ),
},
{
  path: '**',
  loadComponent: () =>
    import('./shared/components/not-found/not-found').then(
      m => m.NotFound
    ),
},
];