import Notification from '../models/Notification.js';
import sendResponse from '../utils/sendResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Get all notifications for logged-in user
 * Sorted by newest first
 */
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id || req.user._id })
    .populate('relatedRequest')
    .sort({ createdAt: -1 });
  
  return sendResponse(res, 200, true, 'Notifications retrieved successfully', { notifications });
});

/**
 * Mark a single notification as read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const notification = await Notification.findById(id);
  
  if (!notification) {
    return sendResponse(res, 404, false, 'Notification not found');
  }
  
  if (notification.user.toString() !== (req.user.id || req.user._id)) {
    return sendResponse(res, 403, false, 'Cannot access this notification');
  }
  
  notification.isRead = true;
  await notification.save();
  
  return sendResponse(res, 200, true, 'Notification marked as read', notification);
});

/**
 * Mark all notifications as read
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id || req.user._id, isRead: false },
    { isRead: true }
  );
  
  return sendResponse(res, 200, true, 'All notifications marked as read');
});

/**
 * Get unread notification count
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user.id || req.user._id,
    isRead: false
  });
  
  return sendResponse(res, 200, true, 'Unread count retrieved', { unreadCount: count });
});

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
