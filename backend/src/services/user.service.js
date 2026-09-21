import prisma from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export class UserService {
  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId) {
    logger.debug('Fetching user profile', { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        municipality: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      logger.warn('User not found', { userId });
      throw new NotFoundError('User not found');
    }

    logger.debug('User profile retrieved successfully', { userId });
    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updateData) {
    logger.info('Updating user profile', { userId, fields: Object.keys(updateData) });

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // If email is being updated, check for conflicts
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        logger.warn('Email update failed - email already exists', { 
          userId, 
          newEmail: updateData.email 
        });
        throw new ConflictError('A user with this email already exists');
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        municipality: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info('User profile updated successfully', { userId });
    return updatedUser;
  }

  /**
   * Delete user account (soft delete)
   */
  static async deleteUserAccount(userId) {
    logger.info('Deleting user account', { userId });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // For now, we'll actually delete the user since we don't have deletedAt field in schema
    // In a real implementation, you'd want to add a deletedAt field for soft deletes
    
    // Delete related refresh tokens first
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info('User account deleted successfully', { userId });
  }

  /**
   * Export user data (GDPR compliance)
   */
  static async exportUserData(userId) {
    logger.info('Exporting user data', { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        municipality: true,
        complaints: {
          include: {
            category: true,
            images: true,
          },
        },
        refreshTokens: {
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Remove sensitive data from export
    const { passwordHash, ...userData } = user;

    logger.info('User data exported successfully', { userId });
    return {
      exportDate: new Date().toISOString(),
      userData,
    };
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId) {
    logger.debug('Fetching user statistics', { userId });

    const [user, complaintStats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
      prisma.complaint.groupBy({
        by: ['status'],
        where: { reportedById: userId },
        _count: {
          status: true,
        },
      }),
    ]);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Format statistics
    const stats = {
      totalComplaints: 0,
      byStatus: {
        SUBMITTED: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
      },
    };

    complaintStats.forEach((stat) => {
      stats.byStatus[stat.status] = stat._count.status;
      stats.totalComplaints += stat._count.status;
    });

    logger.debug('User statistics retrieved successfully', { userId, stats });
    return stats;
  }
}