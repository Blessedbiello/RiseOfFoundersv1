import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { RateLimitError } from '../lib/errors';
import { logger } from '../lib/logger';

// Rate limiting configurations for different endpoint types
export const rateLimitConfigs = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Authentication endpoints (more restrictive)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful auth requests
  },

  // Mission completion (moderate limits)
  missions: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 submissions per 5 minutes
    message: 'Too many mission submissions, please slow down',
    standardHeaders: true,
    legacyHeaders: false
  },

  // File uploads (strict limits)
  uploads: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // 10 uploads per 10 minutes
    message: 'Upload limit exceeded, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  },

  // PvP challenges (to prevent spam)
  pvp: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 challenges per hour
    message: 'Too many PvP challenges, please wait before challenging again',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Mentor session booking
  mentorBooking: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5, // 5 bookings per 30 minutes
    message: 'Too many mentor session bookings, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Admin actions (strict limits)
  admin: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // 200 admin actions per hour
    message: 'Admin action limit exceeded',
    standardHeaders: true,
    legacyHeaders: false
  }
};

// Custom key generator that includes user ID if available
const keyGenerator = (req: Request): string => {
  const userId = req.user?.id || 'anonymous';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  return `${userId}:${ip}`;
};

// Custom handler that throws our custom error
const handler = (req: Request, res: Response, next: any) => {
  const error = new RateLimitError(
    req.rateLimit?.message || 'Too many requests, please try again later'
  );
  next(error);
};

// Skip function for authenticated admin users (higher limits)
const skipForAdmin = (req: Request): boolean => {
  return req.user?.role === 'admin' || req.user?.role === 'super_admin';
};

// Skip function for premium users (slightly higher limits)
const skipForPremium = (req: Request): boolean => {
  return req.user?.subscription === 'premium' || req.user?.subscription === 'enterprise';
};

// Create rate limiter with logging
const createRateLimiter = (config: any, name: string) => {
  return rateLimit({
    ...config,
    keyGenerator,
    handler,
    skip: (req: Request) => {
      // Log rate limit attempts for monitoring
      if (req.rateLimit?.remaining !== undefined && req.rateLimit.remaining < 5) {
        logger.warn('Rate limit approaching', {
          endpoint: req.path,
          method: req.method,
          userId: req.user?.id,
          ip: req.ip,
          remaining: req.rateLimit.remaining,
          rateLimiter: name
        });
      }

      // Apply skip logic
      if (name === 'admin' && !skipForAdmin(req)) {
        return false;
      }

      return false; // Don't skip by default
    },
    // onLimitReached is deprecated in express-rate-limit v7
  });
};

// Export configured rate limiters
export const apiRateLimiter = createRateLimiter(rateLimitConfigs.api, 'api');
export const authRateLimiter = createRateLimiter(rateLimitConfigs.auth, 'auth');
export const missionRateLimiter = createRateLimiter(rateLimitConfigs.missions, 'missions');
export const uploadRateLimiter = createRateLimiter(rateLimitConfigs.uploads, 'uploads');
export const pvpRateLimiter = createRateLimiter(rateLimitConfigs.pvp, 'pvp');
export const mentorBookingRateLimiter = createRateLimiter(rateLimitConfigs.mentorBooking, 'mentorBooking');
export const adminRateLimiter = createRateLimiter(rateLimitConfigs.admin, 'admin');

// Dynamic rate limiter that adjusts based on user tier
export const dynamicRateLimiter = (baseConfig: any) => {
  return rateLimit({
    ...baseConfig,
    keyGenerator,
    handler,
    max: (req: Request) => {
      const baseMax = baseConfig.max;
      
      // Admin users get 10x the limit
      if (skipForAdmin(req)) {
        return baseMax * 10;
      }
      
      // Premium users get 3x the limit
      if (skipForPremium(req)) {
        return baseMax * 3;
      }
      
      // Verified users get 2x the limit
      if (req.user?.isVerified) {
        return baseMax * 2;
      }
      
      return baseMax;
    }
  });
};

// Sliding window rate limiter for more sophisticated scenarios
export const slidingWindowRateLimiter = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, number[]>();
  
  return (req: Request, res: Response, next: any) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this key
    let userRequests = requests.get(key) || [];
    
    // Remove requests outside the window
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (userRequests.length >= maxRequests) {
      logger.warn('Sliding window rate limit exceeded', {
        endpoint: req.path,
        method: req.method,
        userId: req.user?.id,
        ip: req.ip,
        requestCount: userRequests.length,
        maxRequests
      });
      
      return next(new RateLimitError());
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      for (const [k, timestamps] of requests.entries()) {
        const validTimestamps = timestamps.filter(t => t > windowStart);
        if (validTimestamps.length === 0) {
          requests.delete(k);
        } else {
          requests.set(k, validTimestamps);
        }
      }
    }
    
    next();
  };
};

// Burst rate limiter (allows short bursts but limits sustained usage)
export const burstRateLimiter = (shortWindow: number, shortMax: number, longWindow: number, longMax: number) => {
  return [
    rateLimit({
      windowMs: shortWindow,
      max: shortMax,
      keyGenerator,
      handler,
      standardHeaders: false
    }),
    rateLimit({
      windowMs: longWindow,
      max: longMax,
      keyGenerator,
      handler,
      standardHeaders: true
    })
  ];
};

// IP-based rate limiter for public endpoints
export const ipRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP per 15 minutes
  keyGenerator: (req: Request) => req.ip || req.connection.remoteAddress || 'unknown',
  handler,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  // onLimitReached is deprecated in express-rate-limit v7
});