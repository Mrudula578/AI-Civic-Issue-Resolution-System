import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';
import config from '../config/index.js';
import { ConflictError, AuthenticationError, NotFoundError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import AuthSecurityService from './auth-security.service.js';

export class AuthService {
  /**
   * Hash a password using bcrypt with enhanced security
   */
  static async hashPassword(password) {
    // Use higher rounds (12) for better security, though slower
    return bcrypt.hash(password, 12);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token with enhanced security
   */
  static generateAccessToken(userId, role) {
    return jwt.sign(
      { 
        userId, 
        role,
        iat: Math.floor(Date.now() / 1000), // Issued at
      },
      config.jwt.accessSecret,
      { 
        expiresIn: config.jwt.accessExpiry,
        algorithm: 'HS256', // Explicitly specify algorithm
      }
    );
  }

  /**
   * Generate JWT refresh token and store in database
   */
  static async generateRefreshToken(userId) {
    const tokenId = uuidv4();
    const refreshToken = jwt.sign(
      { 
        tokenId,
        iat: Math.floor(Date.now() / 1000),
      },
      config.jwt.refreshSecret,
      { 
        expiresIn: config.jwt.refreshExpiry,
        algorithm: 'HS256',
      }
    );

    // Calculate expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store in database
    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return refreshToken;
  }

  /**
   * Register a new user with enhanced security
   */
  static async register({ email, password, name }, ip) {
    logger.info('Attempting user registration', { email: email.split('@')[0] + '@***.***', name });

    // Validate password strength before creating user
    const passwordStrength = AuthSecurityService.validatePasswordStrength(password);
    if (!passwordStrength.isStrong) {
      const missingRequirements = passwordStrength.missing.join(', ');
      logger.warn('Registration failed - weak password', { email, missing: missingRequirements });
      throw new ValidationError('Password does not meet security requirements', [
        {
          field: 'password',
          message: `Password must have: ${missingRequirements}`,
        },
      ]);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn('Registration failed - email already exists', { email: email.split('@')[0] + '@***.***' });
      // Don't reveal if email exists (security best practice)
      throw new ConflictError('Registration failed');
    }

    // Get default municipality
    const municipality = await prisma.municipality.findFirst();
    if (!municipality) {
      throw new Error('No municipality found - please run database seed');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        municipalityId: municipality.id,
        role: 'CITIZEN', // Default role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    AuthSecurityService.logSecurityEvent('user_registered', {
      userId: user.id,
      ip,
    });

    logger.info('User registered successfully', { userId: user.id });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user with enhanced security
   */
  static async login({ email, password }, ip, userAgent) {
    logger.info('Attempting user login', { email: email.split('@')[0] + '@***.***' });

    // Track failed attempts
    try {
      await AuthSecurityService.trackFailedLogin(email, ip);
    } catch (error) {
      logger.warn('Login attempt blocked due to rate limiting', { email, ip });
      throw error;
    }

    // Validate session activity
    await AuthSecurityService.validateSessionActivity('', ip, userAgent);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Implement progressive delay to slow down brute force
      const failureCount = 1;
      const delay = await AuthSecurityService.getAuthenticationDelay(failureCount);
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      logger.warn('Login failed - user not found', { email: email.split('@')[0] + '@***.***' });
      // Don't reveal if user exists
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      // Implement progressive delay
      const delay = await AuthSecurityService.getAuthenticationDelay(2);
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      logger.warn('Login failed - invalid password', { email: email.split('@')[0] + '@***.***' });
      // Don't reveal password was wrong
      throw new AuthenticationError('Invalid credentials');
    }

    // Clear failed attempts on successful login
    await AuthSecurityService.clearFailedLoginAttempts(email);

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user;

    AuthSecurityService.logSecurityEvent('user_login', {
      userId: user.id,
      ip,
    });

    logger.info('User logged in successfully', { userId: user.id });

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token with enhanced security
   */
  static async refreshToken(refreshToken) {
    // Validate JWT structure first
    if (!AuthSecurityService.validateJwtStructure(refreshToken)) {
      logger.warn('Token refresh failed - invalid structure');
      throw new AuthenticationError('Invalid refresh token');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const { tokenId } = decoded;

      // Check if token has been reused (replay attack prevention)
      await AuthSecurityService.verifyTokenNotReused(tokenId);

      // Find token in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { id: tokenId },
        include: {
          user: {
            select: {
              id: true,
              role: true,
            },
          },
        },
      });

      if (!storedToken) {
        logger.warn('Token refresh failed - token not found');
        throw new AuthenticationError('Invalid refresh token');
      }

      // Check if token is expired
      if (new Date() > storedToken.expiresAt) {
        // Delete expired token
        await prisma.refreshToken.delete({
          where: { id: tokenId },
        });
        logger.warn('Token refresh failed - token expired');
        throw new AuthenticationError('Refresh token expired');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(storedToken.user.id, storedToken.user.role);

      logger.info('Token refreshed successfully', { userId: storedToken.user.id });

      return { accessToken };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Token refresh failed - invalid token format');
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  static async logout(refreshToken, userId) {
    try {
      // Validate JWT structure
      if (!AuthSecurityService.validateJwtStructure(refreshToken)) {
        logger.warn('Logout attempt with invalid token structure', { userId });
        return;
      }

      // Verify and decode token to get tokenId
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const { tokenId } = decoded;

      // Delete token from database
      await prisma.refreshToken.delete({
        where: { id: tokenId },
      });

      AuthSecurityService.logSecurityEvent('user_logout', { userId });
      logger.info('User logged out successfully', { userId });
    } catch (error) {
      // Even if token is invalid or doesn't exist, we consider logout successful
      // This prevents token existence enumeration
      logger.debug('Logout attempted with invalid/expired token', { error: error.message });
    }
  }

  /**
   * Verify access token and return user data
   */
  static async verifyAccessToken(accessToken) {
    // Validate JWT structure first
    if (!AuthSecurityService.validateJwtStructure(accessToken)) {
      logger.warn('Invalid token structure');
      throw new AuthenticationError('Invalid access token');
    }

    try {
      const decoded = jwt.verify(accessToken, config.jwt.accessSecret);
      const { userId, role } = decoded;

      // Optionally verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        logger.warn('Token verification failed - user not found', { userId });
        throw new AuthenticationError('User not found');
      }

      return { userId, role, user };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Token verification failed - invalid token');
        throw new AuthenticationError('Invalid access token');
      }
      throw error;
    }
  }

  /**
   * Clean up expired refresh tokens (utility method)
   */
  static async cleanupExpiredTokens() {
    const deleted = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info('Cleaned up expired tokens', { count: deleted.count });
    return deleted.count;
  }
}