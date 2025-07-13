
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Enhanced rate limiter with different rules for different endpoints
export const createRateLimiter = (config: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      error: config.message || 'Too many requests, please try again later.',
      retryAfter: Math.ceil(config.windowMs / 1000),
    },
    skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator for user-specific limits
    keyGenerator: (req: Request) => {
      const user = (req as any).user;
      return user?.claims?.sub || req.ip;
    },
  });
};

// Different rate limits for different endpoint types
export const rateLimiters = {
  // General API rate limit
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many API requests, please try again later.',
  }),

  // Strict rate limit for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
  }),

  // Trading operations rate limit
  trading: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many trading requests, please slow down.',
  }),

  // Watchlist operations
  watchlist: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: 'Too many watchlist operations, please try again later.',
  }),

  // AI analysis requests (more expensive)
  aiAnalysis: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: 'Too many AI analysis requests, please wait before requesting more.',
  }),
};
