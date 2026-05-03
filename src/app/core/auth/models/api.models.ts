// Envelope generico para respuestas exitosas del backend
// La T es un generic - ApiResponse<User> significa que data es User
// ApiResponse<User[]> significa que data es un array de User. etc
export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

// Respuesta de error estructurada que devuelve el backend
export interface ApiError {
    message: string;
    code: string;
    statusCode: number;
    errors?: Record<string, string[]>; // Errores de validacion por campo
}