import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { isDevelopment } from '../config/environment';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ApiError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'ApiError';

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500): ApiError => {
  return new ApiError(message, statusCode);
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error for debugging
  console.error('Error caught by error handler:', {
    name: err.name,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const message = handlePrismaError(err);
    error = new ApiError(message, 400);
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    const message = 'Invalid data provided';
    error = new ApiError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ApiError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ApiError(message, 401);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = 'Validation failed';
    error = new ApiError(message, 400);
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = new ApiError(message, 400);
  }

  // Duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const message = 'Duplicate field value';
    error = new ApiError(message, 400);
  }

  // File upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if ((err as any).code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    }
    error = new ApiError(message, 400);
  }

  // Rate limit errors
  if (err.message && err.message.includes('Too many requests')) {
    error = new ApiError('Too many requests, please try again later', 429);
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  const response: any = {
    success: false,
    error: error.message || 'Something went wrong',
    ...(isDevelopment && {
      stack: error.stack,
      name: error.name,
    }),
  };

  // Add request ID for tracking
  if (req.headers['x-request-id']) {
    response.requestId = req.headers['x-request-id'];
  }

  res.status(error.statusCode).json(response);
};

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError): string => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const field = err.meta?.target as string[] | string;
      const fieldName = Array.isArray(field) ? field[0] : field;
      return `${fieldName || 'Field'} already exists`;

    case 'P2014':
      // Required relation violation
      return 'Invalid relation data provided';

    case 'P2003':
      // Foreign key constraint violation
      return 'Referenced record does not exist';

    case 'P2025':
      // Record not found
      return 'Record not found';

    case 'P2016':
      // Query interpretation error
      return 'Query interpretation error';

    case 'P2021':
      // Table does not exist
      return 'Database table does not exist';

    case 'P2022':
      // Column does not exist
      return 'Database column does not exist';

    default:
      return 'Database operation failed';
  }
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};