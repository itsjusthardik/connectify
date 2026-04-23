import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for logged-in user
 */
router.get('/', authMiddleware, getNotifications);

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', authMiddleware, getUnreadCount);

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
router.put('/:id/read', authMiddleware, markAsRead);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authMiddleware, markAllAsRead);

export default router;
