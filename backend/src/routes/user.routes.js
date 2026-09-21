import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateProfileUpdate } from '../middleware/validate.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get('/me', UserController.getMe);
router.put('/me', validateProfileUpdate, UserController.updateMe);
router.delete('/me', UserController.deleteMe);

// Additional user data routes
router.get('/me/export', UserController.exportData);
router.get('/me/stats', UserController.getStats);

export default router;