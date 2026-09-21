import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { generateComplaintReferenceId } from '../utils/referenceId.js';
import { storageService } from './storage/index.js';
import logger from '../utils/logger.js';

export class ComplaintService {
  /**
   * Submit a new complaint
   * Creates complaint and handles associated images
   */
  static async submitComplaint(complaintData, images = []) {
    logger.info('Submitting complaint', {
      reportedById: complaintData.reportedById,
      categoryId: complaintData.categoryId,
      imageCount: images.length,
    });

    try {
      // Generate reference ID
      const referenceId = await generateComplaintReferenceId();

      // Validate category exists
      const category = await prisma.category.findUnique({
        where: { id: complaintData.categoryId },
      });

      if (!category) {
        throw new ValidationError('Invalid category ID');
      }

      // Get the municipality from the user
      const user = await prisma.user.findUnique({
        where: { id: complaintData.reportedById },
        select: { municipalityId: true },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Upload images and get URLs
      const imageUrls = [];
      for (const image of images) {
        try {
          const imageUrl = await storageService.uploadFile(
            image.buffer,
            image.originalname,
            image.mimetype
          );
          imageUrls.push(imageUrl);
        } catch (error) {
          logger.error('Failed to upload image', {
            filename: image.originalname,
            error: error.message,
          });
          // Continue with other images but log the error
        }
      }

      // Create complaint with images
      const complaint = await prisma.complaint.create({
        data: {
          referenceId,
          title: complaintData.title,
          description: complaintData.description,
          locationText: complaintData.locationText,
          reportedById: complaintData.reportedById,
          categoryId: complaintData.categoryId,
          municipalityId: user.municipalityId,
          images: {
            create: imageUrls.map(url => ({
              url,
            })),
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
              createdAt: true,
            },
          },
        },
      });

      logger.info('Complaint submitted successfully', {
        complaintId: complaint.id,
        referenceId: complaint.referenceId,
        imageCount: complaint.images.length,
      });

      return complaint;
    } catch (error) {
      logger.error('Failed to submit complaint', {
        error: error.message,
        complaintData: {
          title: complaintData.title,
          categoryId: complaintData.categoryId,
        },
      });
      throw error;
    }
  }

  /**
   * Get complaint by ID
   */
  static async getComplaintById(complaintId, userId = null) {
    logger.debug('Fetching complaint by ID', { complaintId, userId });

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        municipality: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            createdAt: true,
          },
        },
      },
    });

    if (!complaint) {
      logger.warn('Complaint not found', { complaintId });
      throw new NotFoundError('Complaint not found');
    }

    logger.debug('Complaint retrieved successfully', { complaintId });
    return complaint;
  }

  /**
   * Get complaints by user
   */
  static async getComplaintsByUser(userId, filters = {}) {
    logger.debug('Fetching complaints for user', { userId, filters });

    const { status, categoryId, page = 1, limit = 10 } = filters;

    const where = {
      reportedById: userId,
    };

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
            },
            take: 1, // Only first image for list view
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    logger.debug('User complaints retrieved successfully', {
      userId,
      count: complaints.length,
      total,
    });

    return {
      complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all complaints with optional filters
   * Used by admin/authority
   */
  static async getAllComplaints(filters = {}) {
    logger.debug('Fetching all complaints', { filters });

    const { status, categoryId, municipalityId, page = 1, limit = 10 } = filters;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (municipalityId) {
      where.municipalityId = municipalityId;
    }

    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    logger.debug('All complaints retrieved successfully', {
      count: complaints.length,
      total,
    });

    return {
      complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update complaint status
   */
  static async updateComplaintStatus(complaintId, newStatus) {
    logger.info('Updating complaint status', {
      complaintId,
      newStatus,
    });

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    const validStatuses = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(newStatus)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    logger.info('Complaint status updated successfully', {
      complaintId,
      newStatus,
    });

    return updatedComplaint;
  }

  /**
   * Get complaint statistics
   */
  static async getComplaintStats(municipalityId = null) {
    logger.debug('Fetching complaint statistics', { municipalityId });

    const where = municipalityId ? { municipalityId } : {};

    const [totalComplaints, statusBreakdown, categoryBreakdown] = await Promise.all([
      prisma.complaint.count({ where }),
      prisma.complaint.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
      }),
      prisma.complaint.groupBy({
        by: ['categoryId'],
        where,
        _count: {
          categoryId: true,
        },
      }),
    ]);

    // Format the data
    const stats = {
      totalComplaints,
      byStatus: {
        SUBMITTED: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
      },
      byCategory: {},
    };

    statusBreakdown.forEach(item => {
      stats.byStatus[item.status] = item._count.status;
    });

    logger.debug('Complaint statistics retrieved successfully', {
      stats,
    });

    return stats;
  }

  /**
   * Add image to complaint
   */
  static async addComplaintImage(complaintId, imageBuffer, filename, mimetype) {
    logger.info('Adding image to complaint', {
      complaintId,
      filename,
    });

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    try {
      const imageUrl = await storageService.uploadFile(imageBuffer, filename, mimetype);

      const image = await prisma.complaintImage.create({
        data: {
          url: imageUrl,
          complaintId,
        },
      });

      logger.info('Image added to complaint successfully', {
        complaintId,
        imageId: image.id,
      });

      return image;
    } catch (error) {
      logger.error('Failed to add image to complaint', {
        complaintId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete complaint image
   */
  static async deleteComplaintImage(imageId) {
    logger.info('Deleting complaint image', { imageId });

    const image = await prisma.complaintImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundError('Image not found');
    }

    await Promise.all([
      storageService.deleteFile(image.url),
      prisma.complaintImage.delete({
        where: { id: imageId },
      }),
    ]);

    logger.info('Complaint image deleted successfully', { imageId });
  }

  /**
   * Search complaints by title or description
   */
  static async searchComplaints(searchTerm, filters = {}) {
    logger.debug('Searching complaints', { searchTerm, filters });

    const { status, categoryId, page = 1, limit = 10 } = filters;

    const where = {
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          referenceId: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    };

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    logger.debug('Complaint search completed', {
      searchTerm,
      resultCount: complaints.length,
      total,
    });

    return {
      complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Validate complaint ownership
   */
  static async validateComplaintOwnership(complaintId, userId) {
    logger.debug('Validating complaint ownership', { complaintId, userId });

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { reportedById: true },
    });

    if (!complaint) {
      logger.warn('Complaint not found for ownership check', { complaintId });
      return false;
    }

    const isOwner = complaint.reportedById === userId;
    logger.debug('Complaint ownership validated', { complaintId, userId, isOwner });
    return isOwner;
  }
}
