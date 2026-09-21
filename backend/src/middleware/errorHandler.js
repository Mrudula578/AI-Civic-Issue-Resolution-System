import logger from '../utils/logger.js';
import config from '../config/index.js';
import { maskSensitiveData } from '../utils/sanitizer.js';

export const errorHandler = (err, req, res, next) => {
  // Mask sensitive data before logging
  const maskedError = {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  };

  // Log the error with masked data
  logger.error('Request error', maskedError);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = undefined;

  // Handle known error types
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
    
    // Include validation errors if present
    if (err.errors) {
      errors = err.errors;
    }
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this data already exists';
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files uploaded';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Prepare response
  const response = {
    error: {
      code: statusCode,
      message,
    },
  };

  // Include validation errors in development only
  if (errors && config.nodeEnv === 'development') {
    response.error.errors = errors;
  }

  // Include stack trace in development only
  if (config.nodeEnv === 'development' && err.stack) {
    response.error.stack = err.stack;
  }

  // Security: Don't expose internal errors in production
  if (statusCode === 500 && config.nodeEnv !== 'development') {
    response.error.message = 'An unexpected error occurred. Please try again later.';
  }

  res.status(statusCode).json(response);
};