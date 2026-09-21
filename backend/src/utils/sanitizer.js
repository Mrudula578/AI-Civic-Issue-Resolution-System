import DOMPurify from 'isomorphic-dompurify';
import logger from './logger.js';

/**
 * Sanitization utilities for preventing XSS and injection attacks
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 * @param {string} input - Raw HTML input
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  try {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  } catch (error) {
    logger.error('HTML sanitization failed', { error: error.message });
    return '';
  }
}

/**
 * Sanitize user input by removing potentially dangerous characters
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove potentially dangerous HTML entities
    .replace(/[<>]/g, '');
}

/**
 * Sanitize file names to prevent directory traversal and other attacks
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  return filename
    .trim()
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/\//g, '')
    .replace(/\\/g, '')
    // Remove special characters except . and -
    .replace(/[^a-zA-Z0-9._-]/g, '')
    // Limit length
    .substring(0, 255);
}

/**
 * Sanitize email addresses
 * @param {string} email - Email address
 * @returns {string} Sanitized email
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, '');
}

/**
 * Sanitize URL/path parameters to prevent injection
 * @param {string} param - URL parameter value
 * @returns {string} Sanitized parameter
 */
export function sanitizeUrlParam(param) {
  if (!param || typeof param !== 'string') {
    return '';
  }

  return param
    .trim()
    // Remove potentially dangerous characters
    .replace(/[<>'"`;]/g, '')
    // Remove null bytes
    .replace(/\0/g, '');
}

/**
 * Sanitize search queries
 * @param {string} query - Search query
 * @returns {string} Sanitized query
 */
export function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return query
    .trim()
    // Limit length
    .substring(0, 255)
    // Remove SQL-like keywords when used maliciously
    .replace(/[;'"]/g, '');
}

/**
 * Check if input contains potential SQL injection patterns
 * @param {string} input - Input to check
 * @returns {boolean} True if potentially dangerous
 */
export function containsSqlInjectionPatterns(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(-{2}|\/\*|;)/g, // SQL comments
    /(1\s*=\s*1|1\s*=\s*0)/gi, // Classic SQL injection
    /(\bOR\b|\bAND\b).*=.*['"]?.*['"]?/gi, // OR/AND attacks
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check if input contains potential XSS patterns
 * @param {string} input - Input to check
 * @returns {boolean} True if potentially dangerous
 */
export function containsXssPatterns(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /on\w+\s*=/gi, // Event handlers (onclick, onload, etc.)
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /javascript:/gi,
    /data:text\/html/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate and sanitize complaint data
 * @param {Object} data - Complaint data to validate
 * @returns {Object} Sanitized data
 */
export function sanitizeComplaintData(data) {
  return {
    title: sanitizeInput(data.title || ''),
    description: sanitizeInput(data.description || ''),
    locationText: sanitizeInput(data.locationText || ''),
    categoryId: sanitizeUrlParam(data.categoryId || ''),
  };
}

/**
 * Validate and sanitize user data
 * @param {Object} data - User data to validate
 * @returns {Object} Sanitized data
 */
export function sanitizeUserData(data) {
  return {
    email: sanitizeEmail(data.email || ''),
    name: sanitizeInput(data.name || ''),
  };
}

/**
 * Check if value is within acceptable range
 * @param {*} value - Value to check
 * @param {number} min - Minimum allowed
 * @param {number} max - Maximum allowed
 * @returns {boolean} True if within range
 */
export function isWithinRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Safe JSON parse with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
export function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.warn('JSON parse failed', { error: error.message });
    return defaultValue;
  }
}

/**
 * Mask sensitive data in logs
 * @param {string} sensitiveData - Data to mask
 * @returns {string} Masked data
 */
export function maskSensitiveData(sensitiveData) {
  if (!sensitiveData || typeof sensitiveData !== 'string') {
    return '';
  }

  if (sensitiveData.length <= 4) {
    return '****';
  }

  return sensitiveData.substring(0, 2) + '*'.repeat(sensitiveData.length - 4) + sensitiveData.substring(sensitiveData.length - 2);
}

export default {
  sanitizeHtml,
  sanitizeInput,
  sanitizeFilename,
  sanitizeEmail,
  sanitizeUrlParam,
  sanitizeSearchQuery,
  containsSqlInjectionPatterns,
  containsXssPatterns,
  sanitizeComplaintData,
  sanitizeUserData,
  isWithinRange,
  safeJsonParse,
  maskSensitiveData,
};
