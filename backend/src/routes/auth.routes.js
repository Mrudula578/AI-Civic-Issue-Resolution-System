import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { 
  validateRegistration, 
  validateLogin, 
  validateRefreshToken 
} from '../middleware/validate.middleware.js';

const router = express.Router();

// Apply auth rate limiting to all auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validateRegistration, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/refresh', validateRefreshToken, AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;