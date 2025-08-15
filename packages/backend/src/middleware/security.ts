import helmet from 'helmet';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { RateLimitError, AuthenticationError, AuthorizationError } from '../lib/errors';
import { logger, logSecurityEvent } from '../lib/logger';
import { z } from 'zod';

// Environment configuration schema
const securityConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:8000'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  ENCRYPTION_KEY: z.string().length(32, 'Encryption key must be exactly 32 characters'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  TRUSTED_PROXIES: z.string().default(''),
  SECURE_COOKIES: z.string().default('false'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters')
});

// Validate and export security configuration
export const securityConfig = securityConfigSchema.parse(process.env);

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = securityConfig.CORS_ORIGINS.split(',').map(o => o.trim());
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      logSecurityEvent('CORS_VIOLATION', 'medium', { ip: 'unknown' } as Request, { 
        origin, 
        allowedOrigins 
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-User-Agent',
    'X-Forwarded-For'
  ],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 hours
};

// Helmet configuration for security headers
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Next.js in development
        "'unsafe-eval'", // Required for development
        'https://vercel.live',
        'https://*.vercel.app'
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and Tailwind
        'https://fonts.googleapis.com'
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      connectSrc: [
        "'self'",
        'https://api.github.com',
        'https://*.solana.com',
        'https://*.helius.com',
        'wss://*.solana.com'
      ],
      frameSrc: [
        "'self'",
        'https://www.youtube.com',
        'https://player.vimeo.com'
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: securityConfig.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for development compatibility
  crossOriginResourcePolicy: { policy: 'cross-origin' as const },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' as const },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' as const }
};

// Security middleware setup
export const setupSecurity = (app: any) => {
  // Trust proxy if configured
  if (securityConfig.TRUSTED_PROXIES) {
    app.set('trust proxy', securityConfig.TRUSTED_PROXIES.split(',').map(p => p.trim()));
  }

  // Security headers
  app.use(helmet(helmetOptions));

  // CORS
  app.use(cors(corsOptions));

  // Request size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security event logging
  app.use(securityEventLogger);

  // Request ID for tracing
  app.use(requestIdMiddleware);
};

// Request ID middleware for tracing
const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.get('X-Request-ID') || generateRequestId();
  req.requestId = requestId;
  res.set('X-Request-ID', requestId);
  next();
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Security event logging middleware
const securityEventLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log suspicious patterns
  const userAgent = req.get('User-Agent') || '';
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /burp/i,
    /acunetix/i,
    /dirbuster/i,
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(userAgent) || pattern.test(req.originalUrl))) {
    logSecurityEvent('SUSPICIOUS_REQUEST', 'high', req, {
      userAgent,
      url: req.originalUrl,
      body: req.body,
      query: req.query
    });
  }

  // Log admin access attempts
  if (req.originalUrl.includes('/admin') && !req.user?.role?.includes('admin')) {
    logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', 'high', req);
  }

  // Log file upload attempts to unexpected endpoints
  if (req.get('Content-Type')?.includes('multipart/form-data') && 
      !req.originalUrl.includes('/upload')) {
    logSecurityEvent('UNEXPECTED_FILE_UPLOAD', 'medium', req);
  }

  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize common XSS patterns in request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Recursively sanitize object properties
const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key);
    sanitized[sanitizedKey] = sanitizeObject(value);
  }

  return sanitized;
};

// Sanitize individual string values
const sanitizeString = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol (can be dangerous)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/style\s*=\s*["'][^"']*["']/gi, ''); // Remove inline styles
};

// SQL injection detection middleware
export const detectSqlInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b\d+\s*=\s*\d+\b)/g,
    /('\s*(OR|AND)\s*')/gi
  ];

  const checkString = (str: string, location: string) => {
    if (sqlPatterns.some(pattern => pattern.test(str))) {
      logSecurityEvent('SQL_INJECTION_ATTEMPT', 'critical', req, {
        location,
        suspiciousInput: str
      });
      throw new RateLimitError('Suspicious input detected');
    }
  };

  // Check URL parameters
  Object.values(req.params).forEach(param => {
    if (typeof param === 'string') {
      checkString(param, 'params');
    }
  });

  // Check query parameters
  Object.values(req.query).forEach(query => {
    if (typeof query === 'string') {
      checkString(query, 'query');
    }
  });

  // Check request body
  const checkObject = (obj: any, path: string) => {
    if (typeof obj === 'string') {
      checkString(obj, `body.${path}`);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        checkObject(value, path ? `${path}.${key}` : key);
      });
    }
  };

  if (req.body) {
    checkObject(req.body, '');
  }

  next();
};

// API key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.get('X-API-Key') || req.query.apiKey;
  
  if (!apiKey) {
    logSecurityEvent('MISSING_API_KEY', 'medium', req);
    throw new AuthenticationError('API key required');
  }

  // In a real application, validate against database
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey as string)) {
    logSecurityEvent('INVALID_API_KEY', 'high', req, { providedKey: apiKey });
    throw new AuthenticationError('Invalid API key');
  }

  next();
};

// Role-based access control
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError();
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      logSecurityEvent('INSUFFICIENT_PERMISSIONS', 'medium', req, {
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
      throw new AuthorizationError();
    }

    next();
  };
};

// IP whitelist middleware
export const ipWhitelist = (allowedIps: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    
    if (!clientIp || !allowedIps.includes(clientIp)) {
      logSecurityEvent('IP_BLOCKED', 'high', req, {
        clientIp,
        allowedIps
      });
      throw new AuthorizationError('IP address not allowed');
    }

    next();
  };
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logSecurityEvent('REQUEST_TIMEOUT', 'medium', req, { timeoutMs });
        res.status(408).json({ error: 'Request timeout' });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
};

// Content type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');
    
    if (req.method !== 'GET' && req.method !== 'DELETE' && contentType) {
      const baseType = contentType.split(';')[0];
      
      if (!allowedTypes.includes(baseType)) {
        logSecurityEvent('INVALID_CONTENT_TYPE', 'medium', req, {
          providedType: contentType,
          allowedTypes
        });
        throw new RateLimitError('Invalid content type');
      }
    }

    next();
  };
};

// File upload security
export const secureFileUpload = {
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json'
  ],
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5
};

