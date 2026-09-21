import { ComplaintService } from '../services/complaint.service.js';
import logger from '../utils/logger.js';

export class ComplaintController {
  /**
   * Submit a new complaint
   * POST /api/complaints
   * Requires authentication
   */
  static async submitComplaint(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, description, locationText, categoryId } = req.body;
      const images = req.files || [];

      logger.info('Processing complaint submission', {
        userId,
        imageCount: images.length,
      });

      // Create complaint with service
      const complaint = await ComplaintService.submitComplaint(
        {
          title,
          description,
          locationText,
          categoryId,
          reportedById: userId,
        },
        images
      );

      res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully',
        complaint,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complaint by ID
   * GET /api/complaints/:id
   * Public endpoint - anyone can view
   */
  static async getComplaintById(req, res, next) {
    try {
      const { id } = req.params;

      const complaint = await ComplaintService.getComplaintById(id);

      res.json({
        success: true,
        complaint,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's complaints
   * GET /api/complaints/user/:userId
   * Requires authentication
   */
  static async getUserComplaints(req, res, next) {
    try {
      const { userId } = req.params;
      const { status, categoryId, page = 1, limit = 10 } = req.query;

      // User can only view their own complaints unless they're admin
      if (req.user.id !== userId && req.user.role !== 'ADMIN' && req.user.role !== 'AUTHORITY') {
        return res.status(403).json({
          error: {
            code: 403,
            message: 'You can only view your own complaints',
          },
        });
      }

      const result = await ComplaintService.getComplaintsByUser(userId, {
        status,
        categoryId,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all complaints (admin/authority only)
   * GET /api/complaints
   * Requires authentication as admin or authority
   */
  static async getAllComplaints(req, res, next) {
    try {
      const { status, categoryId, municipalityId, page = 1, limit = 10, search } = req.query;

      let result;

      if (search) {
        result = await ComplaintService.searchComplaints(search, {
          status,
          categoryId,
          page: parseInt(page),
          limit: parseInt(limit),
        });
      } else {
        result = await ComplaintService.getAllComplaints({
          status,
          categoryId,
          municipalityId: req.user.role === 'ADMIN' ? municipalityId : req.user.municipalityId,
          page: parseInt(page),
          limit: parseInt(limit),
        });
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update complaint status
   * PATCH /api/complaints/:id/status
   * Requires authentication as admin or authority
   */
  static async updateComplaintStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          error: {
            code: 400,
            message: 'Status is required',
          },
        });
      }

      const complaint = await ComplaintService.updateComplaintStatus(id, status);

      res.json({
        success: true,
        message: 'Complaint status updated successfully',
        complaint,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complaint statistics
   * GET /api/complaints/stats
   * Admin/Authority only
   */
  static async getComplaintStats(req, res, next) {
    try {
      const municipalityId = req.user.role === 'ADMIN' ? null : req.user.municipalityId;

      const stats = await ComplaintService.getComplaintStats(municipalityId);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add image to complaint
   * POST /api/complaints/:id/images
   * Requires authentication and complaint ownership
   */
  static async addComplaintImage(req, res, next) {
    try {
      const { id } = req.params;
      const image = req.file;

      if (!image) {
        return res.status(400).json({
          error: {
            code: 400,
            message: 'Image file is required',
          },
        });
      }

      // Check ownership
      const isOwner = await ComplaintService.validateComplaintOwnership(id, req.user.id);
      if (!isOwner && req.user.role !== 'ADMIN' && req.user.role !== 'AUTHORITY') {
        return res.status(403).json({
          error: {
            code: 403,
            message: 'You can only add images to your own complaints',
          },
        });
      }

      const addedImage = await ComplaintService.addComplaintImage(
        id,
        image.buffer,
        image.originalname,
        image.mimetype
      );

      res.status(201).json({
        success: true,
        message: 'Image added successfully',
        image: addedImage,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete complaint image
   * DELETE /api/complaints/images/:imageId
   * Requires authentication and ownership
   */
  static async deleteComplaintImage(req, res, next) {
    try {
      const { imageId } = req.params;

      await ComplaintService.deleteComplaintImage(imageId);

      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search complaints
   * GET /api/complaints/search
   * Admin/Authority only
   */
  static async searchComplaints(req, res, next) {
    try {
      const { q, status, categoryId, page = 1, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          error: {
            code: 400,
            message: 'Search query is required',
          },
        });
      }

      const result = await ComplaintService.searchComplaints(q, {
        status,
        categoryId,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
