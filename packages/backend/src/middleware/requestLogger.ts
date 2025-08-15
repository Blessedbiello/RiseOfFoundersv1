import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  id: string;
  startTime: number;
  requestId: string;
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const reqWithId = req as RequestWithId;
  // Add unique request ID
  reqWithId.id = uuidv4();
  reqWithId.startTime = Date.now();
  reqWithId.requestId = reqWithId.id;
  
  // Set request ID header for client reference
  res.set('X-Request-ID', reqWithId.id);
  
  // Log request start
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Request ID: ${reqWithId.id}`);
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body?: any) {
    const duration = Date.now() - reqWithId.startTime;
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - Request ID: ${reqWithId.id}`);
    
    // Log error responses with more detail
    if (res.statusCode >= 400) {
      console.error(`Error Response - Request ID: ${reqWithId.id}`, {
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