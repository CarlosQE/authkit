// Representa al usuario autenticado dentro de la app
// Esya es la fuente de verdad - Si necesitas agregar un campo
// al usuario, lo agregas aqui u Typescript te dira en que
// archivos tienes que actualizar algo
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatarUrl?: string;
    createdAt: string;
}

// Enums para los roles. Usamos enum de string (no numerico)
// porque los calores string son legibles en el JWT y en los logs
export enum UserRole {
    Admin = 'admin',
    Editor = 'editor',
    Viewer = 'viewer',
}

// Lo que el usuario envia al hacer login
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

// Lo que el usuario envia al hacer registro
export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Lo que el backend devuelve tras un login/registro exitoso
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    expiresIn: number; // en segundos
}

// Estado de la sesion que vive en memoria mientras la app esta abierta
// El Signal de auth va a tener este tipo
export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}