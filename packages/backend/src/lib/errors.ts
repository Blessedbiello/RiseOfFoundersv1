export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any[];

  constructor(
    message: string,
    statusCode: number = 500,
    details?: any[],
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any[]) {
    super(message, 400, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', originalError?: Error) {
    super(message, 500, originalError ? [{ originalError: originalError.message }] : undefined);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, message?: string) {
    super(message || `${service} service unavailable`, 503);
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

// Error factory functions for common scenarios
export const createNotFoundError = (resource: string, id?: string) => {
  const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
  return new NotFoundError(message);
};

export const createValidationError = (field: string, message: string) => {
  return new ValidationError('Validation failed', [{ field, message }]);
};

export const createDuplicateError = (resource: string, field: string, value: string) => {
  return new ConflictError(`${resource} with ${field} '${value}' already exists`);
};

// Error type guards
export const isOperationalError = (error: Error): error is ApiError => {
  return error instanceof ApiError && error.isOperational;
};

export const isValidationError = (error: Error): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAuthenticationError = (error: Error): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isAuthorizationError = (error: Error): error is AuthorizationError => {
  return error instanceof AuthorizationError;
};

export const isNotFoundError = (error: Error): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isRateLimitError = (error: Error): error is RateLimitError => {
  return error instanceof RateLimitError;
};