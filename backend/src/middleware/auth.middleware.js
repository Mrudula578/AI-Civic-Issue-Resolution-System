import { AuthService } from '../services/auth.service.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate requests using JWT access tokens
 * Extracts token from Authorization header and validates it
 * Attaches user info to req.user for use in route handlers
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed - missing or invalid authorization header', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });
      throw new AuthenticationError('Access token required');
    }

    // Extract the token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token and get user data
    const { userId, role, user } = await AuthService.verifyAccessToken(token);

    // Attach user info to request object
    req.user = {
      id: userId,
      role,
      ...user,
    };

    logger.debug('User authenticated successfully', {
      userId,
      role,
      url: req.originalUrl,
    });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      logger.warn('Authentication failed', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });
    }
    next(error);
  }
};

/**
 * Middleware factory to authorize users based on roles
 * Returns middleware function that checks if user has required role
 * 
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (req.user should be set by authenticate middleware)
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Authorization failed - insufficient privileges', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          url: req.originalUrl,
        });
        throw new AuthorizationError('Insufficient privileges');
      }

      logger.debug('User authorized successfully', {
        userId: req.user.id,
        userRole: req.user.role,
        url: req.originalUrl,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token provided
 * Useful for routes that work for both authenticated and anonymous users
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const { userId, role, user } = await AuthService.verifyAccessToken(token);
        req.user = {
          id: userId,
          role,
          ...user,
        };
        
        logger.debug('Optional authentication successful', {
          userId,
          role,
          url: req.originalUrl,
        });
      } catch (error) {
        // Ignore authentication errors for optional auth
        logger.debug('Optional authentication failed - continuing as anonymous', {
          error: error.message,
          url: req.originalUrl,
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user owns a resource
 * Useful for ensuring users can only access their own data
 * 
 * @param {string} paramName - Name of the parameter containing the user ID
 * @returns {Function} Express middleware function
 */
export const requireOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const resourceUserId = req.params[paramName];
      
      // Admin can access any resource
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // User can only access their own resources
      if (req.user.id !== resourceUserId) {
        logger.warn('Ownership check failed', {
          userId: req.user.id,
          resourceUserId,
          url: req.originalUrl,
        });
        throw new AuthorizationError('You can only access your own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is accessing their own complaint
 * Checks complaint ownership from database
 */
export const requireComplaintOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Admin and Authority can access any complaint
    if (req.user.role === 'ADMIN' || req.user.role === 'AUTHORITY') {
      return next();
    }

    const complaintId = req.params.id;
    
    // Import here to avoid circular dependency
    const { ComplaintService } = await import('../services/complaint.service.js');
    
    // Check if user owns the complaint
    const isOwner = await ComplaintService.validateComplaintOwnership(complaintId, req.user.id);
    
    if (!isOwner) {
      logger.warn('Complaint ownership check failed', {
        userId: req.user.id,
        complaintId,
        url: req.originalUrl,
      });
      throw new AuthorizationError('You can only access your own complaints');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};