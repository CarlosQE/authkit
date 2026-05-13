import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, EMPTY } from 'rxjs';

import { environment } from '@env/environment';
import {
  AuthResponse,
  AuthState,
  LoginRequest,
  RegisterRequest,
  User,
} from '@core/auth/models/auth.models';
import { ApiError } from '@core/auth/models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  // Signal privado — solo AuthService puede modificar el estado.
  // El resto de la app lee a través de los computed() públicos.
  private readonly _state = signal<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
  });

  // Señales públicas de solo lectura derivadas del estado.
  // Los componentes se suscriben a estas, nunca al _state directamente.
  readonly user            = computed(() => this._state().user);
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly isLoading       = computed(() => this._state().isLoading);
  readonly userRole        = computed(() => this._state().user?.role ?? null);

  constructor() {
    // Al iniciar la app, intentamos restaurar la sesión desde localStorage.
    this.restoreSession();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._state.update(s => ({ ...s, isLoading: true }));

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => this.handleAuthError(error))
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this._state.update(s => ({ ...s, isLoading: true }));

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => this.handleAuthError(error))
      );
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);

    this._state.set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });

    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(environment.refreshTokenKey);

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          // Si el refresh falla, la sesión expiró — logout forzado.
          this.logout();
          return throwError(() => error);
        })
      );
  }

  getAccessToken(): string | null {
    return this._state().accessToken;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(environment.tokenKey, response.accessToken);
    localStorage.setItem(environment.refreshTokenKey, response.refreshToken);

    this._state.set({
      user: response.user,
      accessToken: response.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }

  private handleAuthError(error: ApiError): Observable<never> {
    this._state.update(s => ({ ...s, isLoading: false }));
    return throwError(() => error);
  }

  private restoreSession(): void {
  const token = localStorage.getItem(environment.tokenKey);
  if (!token) return;

  this.http
    .get<User>(`${environment.apiUrl}/auth/me`)
    .pipe(
      catchError(() => {
        localStorage.removeItem(environment.tokenKey);
        localStorage.removeItem(environment.refreshTokenKey);
        return EMPTY; // ← no lanza error, simplemente termina el observable
      })
    )
    .subscribe({
      next: user => {
        this._state.set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      },
    });
}
}