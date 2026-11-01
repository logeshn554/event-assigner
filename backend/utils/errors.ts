/**
 * Application Error Hierarchy
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class LlmServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, 'LLM_SERVICE_ERROR', true, details);
  }
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Normalizes any error into a safe client-facing payload.
 * Never leaks stack traces or private internal properties.
 */
export function formatErrorResponse(error: unknown): { response: ApiErrorResponse; status: number } {
  if (error instanceof AppError) {
    return {
      response: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      },
      status: error.statusCode
    };
  }

  // Generic or unexpected error
  return {
    response: {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while processing your request'
      }
    },
    status: 500
  };
}

