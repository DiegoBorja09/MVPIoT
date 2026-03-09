/**
 * API utilities - Centralized Result type and response helpers
 */
export type { Result, ApiErrorCode } from './types';
export { jsonSuccess, jsonError, fromResult, handleApiError } from './response';
