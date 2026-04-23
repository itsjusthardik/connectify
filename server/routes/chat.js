import express from 'express';
import { body } from 'express-validator';
import {
  getConversations,
  getMessages,
  getOrCreateConversation,
  getUnreadCount
} from '../controllers/chatController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/chat/conversations
 * List all conversations for the logged-in user
 */
router.get('/conversations', authMiddleware, getConversations);

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Get paginated messages for a conversation
 */
router.get('/conversations/:conversationId/messages', authMiddleware, getMessages);

/**
 * POST /api/chat/conversations
 * Get or create a conversation with a target user
 */
router.post(
  '/conversations',
  authMiddleware,
  [
    body('targetUserId').isMongoId().withMessage('Invalid target user ID')
  ],
  getOrCreateConversation
);

/**
 * GET /api/chat/unread
 * Get total unread message count
 */
router.get('/unread', authMiddleware, getUnreadCount);

export default router;
