import { CategoryService } from '../services/category.service.js';
import logger from '../utils/logger.js';

export class CategoryController {
  /**
   * Get all categories
   * GET /api/categories
   * Public endpoint - no authentication required
   */
  static async getCategories(req, res, next) {
    try {
      const { search } = req.query;

      let categories;
      
      if (search) {
        // If search term provided, use search functionality
        categories = await CategoryService.searchCategories(search);
      } else {
        // Otherwise get all categories
        categories = await CategoryService.getAllCategories();
      }

      res.json({
        categories,
        count: categories.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID
   * GET /api/categories/:id
   * Public endpoint - no authentication required
   */
  static async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);

      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category statistics
   * GET /api/categories/stats
   * Public endpoint - useful for dashboards
   */
  static async getCategoryStats(req, res, next) {
    try {
      const stats = await CategoryService.getCategoryStats();

      res.json({
        categoryStats: stats,
        summary: {
          totalCategories: stats.length,
          totalComplaints: stats.reduce((sum, cat) => sum + cat.complaintCount, 0),
          mostReported: stats.length > 0 
            ? stats.reduce((max, cat) => cat.complaintCount > max.complaintCount ? cat : max)
            : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}