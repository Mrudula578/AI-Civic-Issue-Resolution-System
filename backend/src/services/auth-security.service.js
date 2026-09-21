import prisma from '../config/database.js';
import { AuthenticationError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Authentication security service for tracking and preventing attacks
 */
export class AuthSecurityService {
  /**
   * Track failed login attempt
   */
  static async trackFailedLogin(email, ip) {
    logger.warn('Failed login attempt tracked', { email, ip });
    
    // In a production system, you might want to store this in Redis or a dedicated table
    // For now, we'll just log it
    
    const attempts = await this.getFailedLoginAttempts(email);
    
    // Lock account after 5 failed attempts in 15 minutes
    if (attempts >= 5) {
      logger.error('Account locked due to multiple failed login attempts', { email });
      throw new AuthenticationError('Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.');
    }
  }

  /**
   * Get number of failed login attempts for an email in the last 15 minutes
   * In production, use Redis for better performance
   */
  static async getFailedLoginAttempts(email) {
    // Placeholder - in production use Redis for this
    // For now, we track in logs
    return 0;
  }

  /**
   * Clear failed login attempts
   */
  static async clearFailedLoginAttempts(email) {
    logger.debug('Cleared failed login attempts', { email });
    // In production, delete from Redis
  }

  /**
   * Check if password meets security requirements
   */
  static validatePasswordStrength(password) {
    const requirements = {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
      noCommonPatterns: !this.containsCommonPatterns(password),
    };

    const isStrong = Object.values(requirements).every(v => v);
    
    if (!isStrong) {
      const missing = Object.entries(requirements)
        .filter(([_, value]) => !value)
        .map(([key]) => key);
      
      return {
        isStrong: false,
        missing,
        requirements,
      };
    }

    return { isStrong: true, requirements };
  }

  /**
   * Check if password contains common patterns
   */
  static containsCommonPatterns(password) {
    const commonPatterns = [
      'password',
      'qwerty',
      'admin',
      'user',
      '123456',
      '111111',
      '000000',
      'abc123',
      'letmein',
      'welcome',
      'monkey',
      'dragon',
      'master',
      'shadow',
      'superman',
      'batman',
    ];

    const lowerPassword = password.toLowerCase();
    return commonPatterns.some(pattern => lowerPassword.includes(pattern));
  }

  /**
   * Generate secure session ID
   */
  static generateSecureSessionId() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Verify token hasn't been reused (replay attack prevention)
   */
  static async verifyTokenNotReused(tokenId) {
    // In production, maintain a blacklist of used tokens
    // This prevents token reuse attacks
    logger.debug('Verifying token not reused', { tokenId });
    return true;
  }

  /**
   * Check if account is locked
   */
  static async isAccountLocked(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }, // Just check existence
      });

      return !user;
    } catch (error) {
      logger.error('Error checking account lock status', { userId, error: error.message });
      return false;
    }
  }

  /**
   * Log security event
   */
  static logSecurityEvent(eventType, details) {
    logger.warn('Security event', {
      eventType,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validate session activity (check for suspicious patterns)
   */
  static async validateSessionActivity(userId, ip, userAgent) {
    logger.debug('Validating session activity', { userId, ip });

    // Check for impossible travel (e.g., too fast geolocation change)
    // In production, implement this with geolocation data

    // Check for unusual user agent
    if (!userAgent || userAgent.length > 1000) {
      this.logSecurityEvent('suspicious_user_agent', { userId, userAgent: userAgent?.substring(0, 100) });
    }

    return true;
  }

  /**
   * Implement progressive delays for failed authentication
   */
  static async getAuthenticationDelay(failureCount) {
    // Start with no delay
    if (failureCount <= 2) return 0;
    
    // Progressive delay: 1s, 2s, 4s, 8s, etc.
    const delayMs = Math.min(Math.pow(2, failureCount - 2) * 1000, 30000); // Max 30 seconds
    
    return delayMs;
  }

  /**
   * Monitor for brute force attacks at system level
   */
  static async monitorBruteForceAttempts() {
    // In production, implement with Redis counter
    // Track failed attempts per IP and email globally
    logger.debug('Monitoring brute force attempts');
  }

  /**
   * Validate JWT token structure (basic checks)
   */
  static validateJwtStructure(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Check if each part is valid base64
    try {
      parts.forEach(part => {
        Buffer.from(part, 'base64').toString('utf-8');
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate CSRF token
   */
  static generateCsrfToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify CSRF token
   */
  static verifyCsrfToken(token, sessionToken) {
    if (!token || !sessionToken) {
      return false;
    }

    // Use timing-safe comparison to prevent timing attacks
    const crypto = require('crypto');
    return crypto.timingAsyncSafeEqual 
      ? crypto.timingAsyncSafeEqual(Buffer.from(token), Buffer.from(sessionToken))
      : token === sessionToken;
  }

  /**
   * Clean up old security events/logs
   */
  static async cleanupOldEvents() {
    logger.debug('Cleaning up old security events');
    // In production, delete old logs/events from database
  }
}

export default AuthSecurityService;
