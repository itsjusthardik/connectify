import express from 'express';
import { body } from 'express-validator';
import {
  sendRequest,
  getMyRequests,
  getReceivedRequests,
  acceptRequest,
  declineRequest,
  getRequestStatus
} from '../controllers/requestController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/requests/send
 * Send a connection or collaboration request (protected)
 */
router.post(
  '/send',
  authMiddleware,
  [
    body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
    body('type').isIn(['connect', 'collaboration']).withMessage('Invalid request type'),
    body('message').optional().trim().isLength({ max: 300 })
  ],
  sendRequest
);

/**
 * GET /api/requests/my-requests
 * Get all requests sent by logged-in user
 */
router.get('/my-requests', authMiddleware, getMyRequests);

/**
 * GET /api/requests/received
 * Get all requests received by logged-in user
 */
router.get('/received', authMiddleware, getReceivedRequests);

/**
 * GET /api/requests/status/:targetUserId
 * Get connection status with a specific user
 */
router.get('/status/:targetUserId', authMiddleware, getRequestStatus);

/**
 * PUT /api/requests/:id/accept
 * Accept a connection request (only receiver)
 */
router.put(
  '/:id/accept',
  authMiddleware,
  acceptRequest
);

/**
 * PUT /api/requests/:id/decline
 * Decline a connection request (only receiver)
 */
router.put(
  '/:id/decline',
  authMiddleware,
  declineRequest
);

export default router;
