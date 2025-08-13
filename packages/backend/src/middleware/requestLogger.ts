import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  id: string;
  startTime: number;
}

export const requestLogger = (req: RequestWithId, res: Response, next: NextFunction) => {
  // Add unique request ID
  req.id = uuidv4();
  req.startTime = Date.now();
  
  // Set request ID header for client reference
  res.set('X-Request-ID', req.id);
  
  // Log request start
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Request ID: ${req.id}`);
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body?: any) {
    const duration = Date.now() - req.startTime;
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - Request ID: ${req.id}`);
    
    // Log error responses with more detail
    if (res.statusCode >= 400) {
      console.error(`Error Response - Request ID: ${req.id}`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        body: typeof body === 'object' ? JSON.stringify(body, null, 2) : body,
      });
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};