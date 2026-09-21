import express from 'express';
import { ComplaintController } from '../controllers/complaint.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateComplaintSubmission, validateComplaintFilters, validateUUIDParam } from '../middleware/validate.middleware.js';
import { uploadMultiple, uploadSingle } from '../middleware/upload.middleware.js';
import { complaintSubmitLimiter, uploadLimiter, searchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Admin/Authority Routes (must come before generic routes)
 */

// Get all complaints
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'AUTHORITY'),
  validateComplaintFilters,
  ComplaintController.getAllComplaints
);

// Get complaint statistics
router.get(
  '/stats',
  authenticate,
  authorize('ADMIN', 'AUTHORITY'),
  ComplaintController.getComplaintStats
);

// Search complaints (admin only)
router.get(
  '/search',
  authenticate,
  authorize('ADMIN', 'AUTHORITY'),
  searchLimiter,
  ComplaintController.searchComplaints
);

/**
 * Public Routes (no authentication required)
 */

// Get complaint by ID (public) - must be after search and admin routes
router.get('/:id', validateUUIDParam('id'), ComplaintController.getComplaintById);

/**
 * Protected Routes (authentication required)
 */

// Submit new complaint
router.post(
  '/',
  authenticate,
  complaintSubmitLimiter,
  uploadLimiter,
  uploadMultiple('images', 3), // Max 3 images
  validateComplaintSubmission,
  ComplaintController.submitComplaint
);

// Get user's complaints
router.get(
  '/user/:userId',
  authenticate,
  validateUUIDParam('userId'),
  validateComplaintFilters,
  ComplaintController.getUserComplaints
);

// Add image to complaint
router.post(
  '/:id/images',
  authenticate,
  validateUUIDParam('id'),
  uploadLimiter,
  uploadSingle('image'),
  ComplaintController.addComplaintImage
);

// Delete complaint image
router.delete(
  '/images/:imageId',
  authenticate,
  validateUUIDParam('imageId'),
  ComplaintController.deleteComplaintImage
);

// Update complaint status
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'AUTHORITY'),
  validateUUIDParam('id'),
  ComplaintController.updateComplaintStatus
);

export default router;
