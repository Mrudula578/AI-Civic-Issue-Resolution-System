import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export class CategoryService {
  /**
   * Get all categories for the municipality
   * Categories are public data, no authentication required
   */
  static async getAllCategories(municipalityId = null) {
    logger.debug('Fetching all categories', { municipalityId });

    try {
      // If no municipality specified, get the default one
      let queryFilter = {};
      
      if (municipalityId) {
        queryFilter.municipalityId = municipalityId;
      } else {
        // Get default municipality
        const defaultMunicipality = await prisma.municipality.findFirst();
        if (defaultMunicipality) {
          queryFilter.municipalityId = defaultMunicipality.id;
        }
      }

      const categories = await prisma.category.findMany({
        where: queryFilter,
        select: {
          id: true,
          name: true,
          icon: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      logger.debug('Categories retrieved successfully', { 
        count: categories.length,
        municipalityId: queryFilter.municipalityId 
      });

      return categories;
    } catch (error) {
      logger.error('Failed to fetch categories', {
        error: error.message,
        municipalityId,
      });
      throw error;
    }
  }

  /**
   * Get a specific category by ID
   */
  static async getCategoryById(categoryId) {
    logger.debug('Fetching category by ID', { categoryId });

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        icon: true,
        municipality: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!category) {
      logger.warn('Category not found', { categoryId });
      throw new NotFoundError('Category not found');
    }

    logger.debug('Category retrieved successfully', { categoryId });
    return category;
  }

  /**
   * Get category statistics (number of complaints per category)
   * Useful for admin dashboards
   */
  static async getCategoryStats(municipalityId = null) {
    logger.debug('Fetching category statistics', { municipalityId });

    try {
      let queryFilter = {};
      
      if (municipalityId) {
        queryFilter.municipalityId = municipalityId;
      } else {
        // Get default municipality
        const defaultMunicipality = await prisma.municipality.findFirst();
        if (defaultMunicipality) {
          queryFilter.municipalityId = defaultMunicipality.id;
        }
      }

      // Get categories with complaint counts
      const categoryStats = await prisma.category.findMany({
        where: queryFilter,
        select: {
          id: true,
          name: true,
          icon: true,
          _count: {
            select: {
              complaints: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Transform the data to a more readable format
      const stats = categoryStats.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        complaintCount: category._count.complaints,
      }));

      logger.debug('Category statistics retrieved successfully', { 
        count: stats.length,
        totalComplaints: stats.reduce((sum, cat) => sum + cat.complaintCount, 0)
      });

      return stats;
    } catch (error) {
      logger.error('Failed to fetch category statistics', {
        error: error.message,
        municipalityId,
      });
      throw error;
    }
  }

  /**
   * Validate if a category exists and belongs to the correct municipality
   */
  static async validateCategory(categoryId, municipalityId = null) {
    logger.debug('Validating category', { categoryId, municipalityId });

    let queryFilter = { id: categoryId };
    
    if (municipalityId) {
      queryFilter.municipalityId = municipalityId;
    }

    const category = await prisma.category.findUnique({
      where: queryFilter,
      select: {
        id: true,
        name: true,
        municipalityId: true,
      },
    });

    if (!category) {
      logger.warn('Category validation failed - not found', { categoryId, municipalityId });
      return false;
    }

    logger.debug('Category validated successfully', { categoryId });
    return true;
  }

  /**
   * Search categories by name (useful for autocomplete)
   */
  static async searchCategories(searchTerm, municipalityId = null) {
    logger.debug('Searching categories', { searchTerm, municipalityId });

    try {
      let queryFilter = {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      };
      
      if (municipalityId) {
        queryFilter.municipalityId = municipalityId;
      } else {
        // Get default municipality
        const defaultMunicipality = await prisma.municipality.findFirst();
        if (defaultMunicipality) {
          queryFilter.municipalityId = defaultMunicipality.id;
        }
      }

      const categories = await prisma.category.findMany({
        where: queryFilter,
        select: {
          id: true,
          name: true,
          icon: true,
        },
        orderBy: {
          name: 'asc',
        },
        take: 10, // Limit search results
      });

      logger.debug('Category search completed', { 
        searchTerm,
        resultCount: categories.length 
      });

      return categories;
    } catch (error) {
      logger.error('Category search failed', {
        error: error.message,
        searchTerm,
        municipalityId,
      });
      throw error;
    }
  }
}