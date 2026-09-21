import express from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { validateUUIDParam } from '../middleware/validate.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
// Categories are public information for anyone to view

// Get all categories or search categories
router.get('/', CategoryController.getCategories);

// Get category statistics
router.get('/stats', CategoryController.getCategoryStats);

// Get specific category by ID
router.get('/:id', validateUUIDParam('id'), CategoryController.getCategoryById);

export default router;