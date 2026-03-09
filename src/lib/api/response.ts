import { NextResponse } from 'next/server';
import type { Result } from './types';

/**
 * Crea una respuesta JSON de éxito
 */
export function jsonSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Crea una respuesta JSON de error
 */
export function jsonError(
  error: string,
  status: number = 500,
  details?: unknown
): NextResponse {
  const payload: { success: false; error: string; details?: unknown } = {
    success: false,
    error,
  };

  if (details !== undefined) {
    payload.details = details;
  }

  return NextResponse.json(payload, { status });
}

/**
 * Convierte un Result a NextResponse
 */
export function fromResult<T>(result: Result<T>): NextResponse {
  return result.success
    ? jsonSuccess(result.data)
    : jsonError(result.error, 500, result.details);
}

/**
 * Helper para manejar errores comunes de la API
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API error:', JSON.stringify(error, null, 2));

  // Errores de validación Zod
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    return jsonError('Invalid payload', 400, error);
  }

  // Errores de Prisma (duplicados, etc.)
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message?: string };
    if (prismaError.code === 'P2002') {
      return jsonError('Duplicate entry', 409, prismaError.message);
    }
  }

  // Error genérico
  return jsonError('Internal server error', 500);
}
