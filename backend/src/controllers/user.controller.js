import { UserService } from '../services/user.service.js';
import logger from '../utils/logger.js';

export class UserController {
  /**
   * Get current user profile
   * GET /api/users/me
   */
  static async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const userProfile = await UserService.getUserProfile(userId);

      res.json(userProfile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   * PUT /api/users/me
   */
  static async updateMe(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const updatedUser = await UserService.updateUserProfile(userId, updateData);

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete current user account
   * DELETE /api/users/me
   */
  static async deleteMe(req, res, next) {
    try {
      const userId = req.user.id;

      await UserService.deleteUserAccount(userId);

      res.json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export user data (GDPR)
   * GET /api/users/me/export
   */
  static async exportData(req, res, next) {
    try {
      const userId = req.user.id;
      const exportData = await UserService.exportUserData(userId);

      res.json(exportData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/users/me/stats
   */
  static async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await UserService.getUserStats(userId);

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}