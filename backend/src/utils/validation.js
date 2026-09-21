import { validationResult } from 'express-validator';
import { ValidationError } from './errors.js';

/**
 * Check validation results and throw error if validation failed
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));
    
    throw new ValidationError('Validation failed', errorDetails);
  }
  
  next();
};

/**
 * Common validation rules
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password) => {
  // At least 8 characters
  return password && password.length >= 8;
};