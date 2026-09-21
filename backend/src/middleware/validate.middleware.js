import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';
import { containsSqlInjectionPatterns, containsXssPatterns } from '../utils/sanitizer.js';
import logger from '../utils/logger.js';

/**
 * Middleware to handle validation results
 * Checks for validation errors and throws ValidationError if any found
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));
    
    logger.warn('Validation failed', {
      ip: req.ip,
      path: req.path,
      errors: errorDetails.length,
    });
    
    throw new ValidationError('Validation failed', errorDetails);
  }
  
  next();
};

/**
 * Custom validation: Check for SQL injection patterns
 */
const validateNoSqlInjection = (value) => {
  if (containsSqlInjectionPatterns(value)) {
    throw new Error('Input contains potentially dangerous SQL patterns');
  }
  return true;
};

/**
 * Custom validation: Check for XSS patterns
 */
const validateNoXss = (value) => {
  if (containsXssPatterns(value)) {
    throw new Error('Input contains potentially dangerous scripts or markup');
  }
  return true;
};

/**
 * Validation rules for user registration
 */
export const validateRegistration = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email must not exceed 254 characters')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
    .custom(validateNoXss),
  
  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 1000 })
    .withMessage('Password exceeds maximum length'),
  
  handleValidationErrors,
];

/**
 * Validation rules for token refresh
 */
export const validateRefreshToken = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required')
    .isJWT()
    .withMessage('Invalid token format'),
  
  handleValidationErrors,
];

/**
 * Validation rules for complaint submission
 */
export const validateComplaintSubmission = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .custom(validateNoXss)
    .custom(validateNoSqlInjection),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .custom(validateNoXss)
    .custom(validateNoSqlInjection),
  
  body('locationText')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Location is required and must not exceed 500 characters')
    .custom(validateNoXss)
    .custom(validateNoSqlInjection),
  
  body('categoryId')
    .trim()
    .isUUID()
    .withMessage('Category ID must be a valid UUID')
    .custom(validateNoSqlInjection),
  
  handleValidationErrors,
];

/**
 * Validation rules for UUID parameters
 */
export const validateUUIDParam = (paramName = 'id') => [
  param(paramName)
    .trim()
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  
  handleValidationErrors,
];

/**
 * Validation rules for pagination query parameters
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Page must be a positive integer (max 10000)')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  handleValidationErrors,
];

/**
 * Validation rules for complaint status filter
 */
export const validateComplaintFilters = [
  query('status')
    .optional()
    .isIn(['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'])
    .withMessage('Status must be one of: SUBMITTED, IN_PROGRESS, RESOLVED'),
  
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Search query must not exceed 255 characters')
    .custom(validateNoSqlInjection),
  
  ...validatePagination,
];

/**
 * Validation rules for user profile updates
 */
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
    .custom(validateNoXss),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email must not exceed 254 characters')
    .normalizeEmail(),
  
  handleValidationErrors,
];