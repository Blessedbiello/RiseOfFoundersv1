import winston from 'winston';
import { Request, Response } from 'express';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston about our colors
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for production logs (JSON)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define which transports to use based on environment
const transports = [];

// Always log to console in development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: format
    })
  );
} else {
  // In production, use JSON format for better parsing
  transports.push(
    new winston.transports.Console({
      format: productionFormat
    })
  );
}

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: productionFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: productionFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  );
}

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  levels,
  format: productionFormat,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/exceptions.log',
      format: productionFormat 
    })
  ],
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/rejections.log',
      format: productionFormat 
    })
  ]
});

// HTTP request logging middleware
export const httpLogger = (req: Request, res: Response, next: any) => {
  const startTime = Date.now();
  
  // Log request
  logger.http(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    sessionId: req.sessionID,
    timestamp: new Date().toISOString()
  });
  
  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userId: req.user?.id,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString()
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Error logging helper
export const logError = (error: Error, req?: Request, additionalInfo?: any) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }
  
  logger.error(error.message, errorInfo);
};

// Security event logging
export const logSecurityEvent = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  req: Request,
  additionalInfo?: any
) => {
  const securityInfo = {
    event,
    severity,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    sessionId: req.sessionID,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  if (severity === 'critical' || severity === 'high') {
    logger.error(`Security Event: ${event}`, securityInfo);
  } else if (severity === 'medium') {
    logger.warn(`Security Event: ${event}`, securityInfo);
  } else {
    logger.info(`Security Event: ${event}`, securityInfo);
  }
};

// Performance logging
export const logPerformance = (
  operation: string,
  duration: number,
  additionalInfo?: any
) => {
  const performanceInfo = {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  if (duration > 5000) { // Log slow operations (>5s) as warnings
    logger.warn(`Slow operation: ${operation} took ${duration}ms`, performanceInfo);
  } else if (duration > 1000) { // Log moderately slow operations (>1s) as info
    logger.info(`Performance: ${operation} took ${duration}ms`, performanceInfo);
  } else {
    logger.debug(`Performance: ${operation} took ${duration}ms`, performanceInfo);
  }
};

// Database query logging
export const logDatabaseQuery = (
  query: string,
  duration: number,
  params?: any,
  result?: any
) => {
  const queryInfo = {
    query: query.replace(/\s+/g, ' ').trim(),
    duration,
    params,
    resultCount: Array.isArray(result) ? result.length : result ? 1 : 0,
    timestamp: new Date().toISOString()
  };
  
  if (duration > 1000) {
    logger.warn(`Slow database query: ${duration}ms`, queryInfo);
  } else {
    logger.debug('Database query executed', queryInfo);
  }
};

// Business logic event logging
export const logBusinessEvent = (
  event: string,
  userId: string,
  additionalInfo?: any
) => {
  logger.info(`Business Event: ${event}`, {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  });
};

// Structured logging helpers
export const createContextLogger = (context: any) => {
  return {
    error: (message: string, meta?: any) => logger.error(message, { ...context, ...meta }),
    warn: (message: string, meta?: any) => logger.warn(message, { ...context, ...meta }),
    info: (message: string, meta?: any) => logger.info(message, { ...context, ...meta }),
    http: (message: string, meta?: any) => logger.http(message, { ...context, ...meta }),
    debug: (message: string, meta?: any) => logger.debug(message, { ...context, ...meta })
  };
};

// Export logger instance and helpers
export default logger;