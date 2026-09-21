import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

// General rate limiter - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 429,
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/health';
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: {
        code: 429,
        message: 'Too many requests, please try again later',
      },
    });
  },
});

// Auth rate limiter - 10 requests per 15 minutes (stricter for auth)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: {
      code: 429,
      message: 'Too many authentication attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests (only count failed ones)
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email || 'unknown',
      path: req.path,
    });
    res.status(429).json({
      error: {
        code: 429,
        message: 'Too many authentication attempts, please try again later',
      },
    });
  },
});

// File upload rate limiter - 5 requests per hour
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 uploads per hour
  message: {
    error: {
      code: 429,
      message: 'Too many file uploads, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      path: req.path,
    });
    res.status(429).json({
      error: {
        code: 429,
        message: 'Too many file uploads, please try again later',
      },
    });
  },
});

// Complaint submission rate limiter - 10 per day per user
export const complaintSubmitLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 10 complaints per day
  message: {
    error: {
      code: 429,
      message: 'Too many complaints submitted, please try again tomorrow',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    logger.warn('Complaint submission rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
    });
    res.status(429).json({
      error: {
        code: 429,
        message: 'Too many complaints submitted, please try again tomorrow',
      },
    });
  },
});

// Search rate limiter - 30 requests per minute
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 search requests per minute
  message: {
    error: {
      code: 429,
      message: 'Too many search requests, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Search rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: {
        code: 429,
        message: 'Too many search requests, please slow down',
      },
    });
  },
});

// Strict rate limiter for sensitive operations - 5 per hour
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    error: {
      code: 429,
      message: 'Too many requests for this operation, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userId: req.user?.id || 'anonymous',
    });
    res.status(429).json({
      error: {
        code: 429,
        message: 'Too many requests for this operation, please try again later',
      },
    });
  },
});
