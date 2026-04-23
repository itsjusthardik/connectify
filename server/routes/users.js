import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { 
  getProfile, 
  updateProfile, 
  uploadProfileImage,
  getDashboardStats,
  getUserCounts,
  browseUsers,
  browseCreators,
  browseTalent 
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { isCreator, isConsumer } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Configure multer for profile image uploads with 2MB limit
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

/**
 * PUBLIC ENDPOINTS (no auth required)
 */

/**
 * GET /api/users/public/counts
 * Get count of active users by role
 */
router.get('/public/counts', getUserCounts);

/**
 * GET /api/users/browse
 * Browse all users by role
 * Query: role, page, limit
 */
router.get('/browse', browseUsers);

/**
 * PROTECTED ENDPOINTS (auth required)
 */

/**
 * GET /api/users/profile/:id
 * Get any user's profile (public)
 */
router.get('/profile/:id', getProfile);

/**
 * PUT /api/users/profile
 * Update own profile (protected)
 */
router.put(
  '/profile',
  authMiddleware,
  [
    body('name').optional().trim().isLength({ min: 2 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('location').optional().trim(),
    body('followersCount').optional().isInt({ min: 0 }),
    body('experienceYears').optional().isInt({ min: 0 }),
    body('hourlyRate').optional().isFloat({ min: 0 })
  ],
  updateProfile
);

/**
 * POST /api/users/profile/image
 * Upload profile image (protected)
 */
router.post(
  '/profile/image',
  authMiddleware,
  upload.single('image'),
  uploadProfileImage
);

/**
 * GET /api/users/dashboard-stats
 * Get dashboard statistics for logged-in user
 */
router.get('/dashboard-stats', authMiddleware, getDashboardStats);

/**
 * GET /api/users/browse/creators
 * Browse content creators (consumer only)
 * Query: niche, search, page, limit
 */
router.get(
  '/browse/creators',
  authMiddleware,
  isConsumer,
  browseCreators
);

/**
 * GET /api/users/browse/talent
 * Browse talent (video editors & designers) - creator only
 * Query: type, skills, page, limit
 */
router.get(
  '/browse/talent',
  authMiddleware,
  isCreator,
  browseTalent
);

/**
 * Legacy compatibility route
 * Keep last so it does not shadow more specific endpoints.
 */
router.get('/:id', getProfile);

export default router;
