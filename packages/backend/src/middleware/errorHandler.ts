// Global Express type extensions
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      sessionID?: string;
      rateLimit?: {
        limit: number;
        remaining: number;
        resetTime: number;
        message?: string;
      };
      user?: {
        id: string;
        walletAddress: string;
        role: string;
        email?: string;
        isVerified: boolean;
        subscription?: string;
      };
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { isDevelopment } from '../config/environment';
import { ApiError as CustomApiError, isOperationalError } from '../lib/errors';
import { logger, logError, logSecurityEvent } from '../lib/logger';
import { ZodError } from 'zod';
import { validationResult } from 'express-validator';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Use ApiError from lib/errors for consistency
export { ApiError, createValidationError as createError } from '../lib/errors';

export const errorHandler = (
  err: Error | AppError | CustomApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: CustomApiError;

  // Convert different error types to our standard ApiError
  if (err instanceof CustomApiError) {
    error = err;
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaKnownError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new CustomApiError('Invalid request data', 400);
  } else {
    // Convert legacy errors or unknown errors
    const statusCode = (err as AppError).statusCode || 500;
    error = new CustomApiError(
      isDevelopment ? err.message : 'Internal server error',
      statusCode,
      undefined,
      (err as AppError).isOperational !== false
    );
  }

  // Log the error with enhanced context
  logError(error, req, {
    originalError: err.name !== 'ApiError' ? {
      name: err.name,
      message: err.message,
      stack: err.stack
    } : undefined,
    requestId: req.requestId,
    userId: req.user?.id,
    sessionId: req.sessionID
  });

  // Log security events for auth-related errors
  if (error.statusCode === 401 || error.statusCode === 403) {
    logSecurityEvent(
      error.statusCode === 401 ? 'UNAUTHORIZED_ACCESS' : 'FORBIDDEN_ACCESS',
      'medium',
      req,
      { errorMessage: error.message }
    );
  }

  // Log suspicious errors that might indicate attacks
  if (error.statusCode === 400 && (
    error.message.includes('SQL') ||
    error.message.includes('script') ||
    error.message.includes('injection')
  )) {
    logSecurityEvent('POTENTIAL_ATTACK', 'high', req, {
      errorMessage: error.message,
      suspiciousInput: true
    });
  }

  // Format response based on Accept header and route type
  const acceptHeader = req.get('Accept') || '';
  
  if (acceptHeader.includes('application/json') || req.originalUrl.startsWith('/api/')) {
    // JSON API response
    const errorResponse: any = {
      success: false,
      error: {
        message: error.message,
        code: error.statusCode,
        requestId: req.requestId || req.headers['x-request-id']
      }
    };

    // Include error details in development
    if (isDevelopment) {
      errorResponse.error.stack = error.stack;
      errorResponse.error.name = error.name;
    }

    // Include validation details for client
    if (error.statusCode === 400 && error.details) {
      errorResponse.error.validation = error.details;
    }

    // Add rate limit headers if applicable
    if (error.statusCode === 429 && req.rateLimit) {
      res.set({
        'X-RateLimit-Limit': req.rateLimit.limit.toString(),
        'X-RateLimit-Remaining': req.rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(req.rateLimit.resetTime).toISOString(),
        'Retry-After': Math.round((req.rateLimit.resetTime - Date.now()) / 1000).toString()
      });
    }

    res.status(error.statusCode).json(errorResponse);
  } else {
    // HTML response for non-API routes
    res.status(error.statusCode).render('error', {
      title: 'Error',
      message: error.message,
      statusCode: error.statusCode,
      requestId: req.requestId
    });
  }
};

// Handle Zod validation errors
const handleZodError = (error: ZodError): CustomApiError => {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return new CustomApiError('Validation failed', 400, details);
};

// Handle Prisma known request errors
const handlePrismaKnownError = (err: Prisma.PrismaClientKnownRequestError): CustomApiError => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const target = (err.meta?.target as string[]) || ['field'];
      return new CustomApiError(`Duplicate value for ${target.join(', ')}`, 409);
    
    case 'P2014':
      // Invalid ID error
      return new CustomApiError('Invalid ID provided', 400);
    
    case 'P2003':
      // Foreign key constraint violation
      return new CustomApiError('Referenced record does not exist', 400);
    
    case 'P2025':
      // Record not found
      return new CustomApiError('Record not found', 404);
    
    case 'P2016':
      // Query interpretation error
      return new CustomApiError('Invalid query parameters', 400);
    
    case 'P2021':
      // Table does not exist
      return new CustomApiError('Resource not available', 503);
    
    case 'P2024':
      // Timed out fetching connection
      return new CustomApiError('Database connection timeout', 503);
    
    default:
      logger.error('Unhandled Prisma error', { 
        code: err.code, 
        message: err.message,
        meta: err.meta 
      });
      return new CustomApiError('Database operation failed', 500);
  }
};

// Legacy function for backward compatibility
const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError): string => {
  return handlePrismaKnownError(err).message;
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomApiError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        const error = new CustomApiError('Request timeout', 408);
        next(error);
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  };
};

// Health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    requestId: req.requestId
  };

  res.status(200).json(healthData);
};

// Maintenance mode middleware
export const maintenanceMode = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Allow admin users during maintenance
    if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
      return next();
    }

    const maintenanceError = new CustomApiError(
      'System is currently under maintenance. Please try again later.',
      503
    );
    
    return next(maintenanceError);
  }

  next();
};

// Request validation middleware factory
export const validateRequest = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: (err as any).param || (err as any).path || 'unknown',
      message: (err as any).msg || (err as any).message,
      value: (err as any).value
    }));

    const error = new CustomApiError('Validation failed', 400, extractedErrors);
    next(error);
  };
};