import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ConnectRequest from '../models/ConnectRequest.js';
import sendResponse from '../utils/sendResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Check if two users have an accepted connection
 */
const areConnected = async (userA, userB) => {
  const request = await ConnectRequest.findOne({
    $or: [
      { sender: userA, receiver: userB },
      { sender: userB, receiver: userA }
    ],
    status: 'accepted'
  });
  return !!request;
};

/**
 * GET /api/chat/conversations
 * List all conversations for the logged-in user, with last message preview
 */
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const conversations = await Conversation.find({
    participants: userId
  })
    .populate('participants', 'name profileImage role')
    .populate({
      path: 'lastMessage',
      select: 'content sender createdAt readBy'
    })
    .sort({ updatedAt: -1 });

  // Compute unread count for each conversation
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: userId },
        readBy: { $nin: [userId] }
      });
      return {
        ...conv.toObject(),
        unreadCount
      };
    })
  );

  return sendResponse(res, 200, true, 'Conversations retrieved', { conversations: enriched });
});

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Paginated message history for a conversation
 * Query: ?page=1&limit=50
 */
const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Validate user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return sendResponse(res, 404, false, 'Conversation not found');
  }
  if (!conversation.participants.map(p => p.toString()).includes(userId.toString())) {
    return sendResponse(res, 403, false, 'Not a participant in this conversation');
  }

  const skip = (Number(page) - 1) * Number(limit);
  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Message.countDocuments({ conversation: conversationId });

  // Mark fetched messages as read by this user
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      readBy: { $nin: [userId] }
    },
    { $addToSet: { readBy: userId } }
  );

  return sendResponse(res, 200, true, 'Messages retrieved', {
    messages: messages.reverse(), // oldest-first for display
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

/**
 * POST /api/chat/conversations
 * Get or create a conversation with a target user
 * Body: { targetUserId }
 * Guards: users must have an accepted ConnectRequest
 */
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return sendResponse(res, 400, false, 'targetUserId is required');
  }

  if (userId.toString() === targetUserId.toString()) {
    return sendResponse(res, 400, false, 'Cannot start conversation with yourself');
  }

  // Guard: must be connected
  const connected = await areConnected(userId, targetUserId);
  if (!connected) {
    return sendResponse(res, 403, false, 'You must be connected with this user to start a chat');
  }

  // Sort participant IDs so the pair is always in the same order
  const participants = [userId.toString(), targetUserId.toString()].sort();

  let conversation = await Conversation.findOne({
    participants: { $all: participants, $size: 2 }
  }).populate('participants', 'name profileImage role');

  if (!conversation) {
    conversation = await Conversation.create({ participants });
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name profileImage role');
  }

  return sendResponse(res, 200, true, 'Conversation ready', { conversation });
});

/**
 * GET /api/chat/unread
 * Get total unread message count for the navbar badge
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  // Find all conversations user is in
  const conversations = await Conversation.find({ participants: userId }).select('_id');
  const conversationIds = conversations.map(c => c._id);

  const unreadCount = await Message.countDocuments({
    conversation: { $in: conversationIds },
    sender: { $ne: userId },
    readBy: { $nin: [userId] }
  });

  return sendResponse(res, 200, true, 'Unread count retrieved', { unreadCount });
});

export {
  getConversations,
  getMessages,
  getOrCreateConversation,
  getUnreadCount
};
