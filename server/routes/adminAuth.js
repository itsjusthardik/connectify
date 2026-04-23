import express from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { adminRegister, adminLogin, getDashboardStats, adminLogout } from '../controllers/adminAuthController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many admin authentication attempts'
});

/**
 * POST /api/admin/register
 * Register a new admin
 */
router.post(
  '/register',
  adminLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  adminRegister
);

/**
 * POST /api/admin/login
 * Login as admin
 */
router.post(
  '/login',
  adminLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  adminLogin
);

/**
 * GET /api/admin/dashboard-stats
 * Get dashboard statistics (admin only)
 */
router.get('/dashboard-stats', adminMiddleware, getDashboardStats);

/**
 * POST /api/admin/logout
 * Admin logout
 */
router.post('/logout', adminMiddleware, adminLogout);

export default router;
