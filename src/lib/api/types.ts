/**
 * Tipo Result genérico para respuestas API consistentes
 * @template T Tipo de datos en caso de éxito
 * @template E Tipo de error (por defecto string)
 */
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E; details?: unknown };

/**
 * Códigos HTTP comunes para errores API
 */
export type ApiErrorCode = 400 | 401 | 403 | 404 | 500;
