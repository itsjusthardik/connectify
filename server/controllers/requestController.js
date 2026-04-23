import ConnectRequest from '../models/ConnectRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import sendResponse from '../utils/sendResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  CONSUMER_ROLE,
  CONTENT_CREATOR_ROLE,
  GRAPHIC_DESIGNER_ROLE,
  VIDEO_EDITOR_ROLE,
  isRole
} from '../utils/userMetadata.js';

/**
 * Send a connection or collaboration request
 * Validates:
 * - User cannot request themselves
 * - No duplicate pending requests from same sender to receiver
 * - Only certain roles can send certain types
 */
const sendRequest = asyncHandler(async (req, res) => {
  const { receiverId, type, message } = req.body;
  const senderId = req.user.id || req.user._id;
  
  // Validate sender and receiver are different
  if (senderId === receiverId) {
    return sendResponse(res, 400, false, 'Cannot send request to yourself');
  }
  
  // Get sender and receiver
  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);
  
  if (!sender || !receiver) {
    return sendResponse(res, 404, false, 'User not found');
  }
  
  // ROLE VALIDATION - Only allow specific request types by role
  if (type === 'collaboration') {
    // Only consumers can send collaboration requests
    if (!isRole(sender.role, CONSUMER_ROLE)) {
      return sendResponse(res, 403, false, 'Only consumers can send collaboration requests');
    }
    // Must receive from content creators
    if (!isRole(receiver.role, CONTENT_CREATOR_ROLE)) {
      return sendResponse(res, 403, false, 'Collaboration requests can only be sent to content creators');
    }
  } else if (type === 'connect') {
    // Only content creators can send connect requests
    if (!isRole(sender.role, CONTENT_CREATOR_ROLE)) {
      return sendResponse(res, 403, false, 'Only content creators can send connect requests');
    }
    // Must connect with editors or designers
    if (!isRole(receiver.role, VIDEO_EDITOR_ROLE) && !isRole(receiver.role, GRAPHIC_DESIGNER_ROLE)) {
      return sendResponse(res, 403, false, 'Connect requests can only be sent to video editors or graphic designers');
    }
  }
  
  // Check for duplicate pending requests
  const existingRequest = await ConnectRequest.findOne({
    sender: senderId,
    receiver: receiverId,
    type,
    status: 'pending'
  });
  
  if (existingRequest) {
    return sendResponse(res, 400, false, 'You already have a pending request with this user');
  }
  
  // Create request
  const request = new ConnectRequest({
    sender: senderId,
    receiver: receiverId,
    type,
    message
  });
  
  await request.save();
  
  // Create notification for receiver
  const notificationMessage = type === 'collaboration'
    ? `${sender.name} wants to collaborate with you`
    : `${sender.name} wants to connect with you`;
  
  const notification = new Notification({
    user: receiverId,
    type: 'request_received',
    message: notificationMessage,
    relatedRequest: request._id
  });
  
  await notification.save();
  
  return sendResponse(res, 201, true, 'Request sent successfully', request);
});

/**
 * Get all requests sent by logged-in user
 */
const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await ConnectRequest.find({ sender: req.user.id || req.user._id })
    .populate('receiver', 'name profileImage role')
    .sort({ createdAt: -1 });
  
  return sendResponse(res, 200, true, 'Your requests retrieved successfully', { requests });
});

/**
 * Get all requests received by logged-in user
 */
const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await ConnectRequest.find({ receiver: req.user.id || req.user._id })
    .populate('sender', 'name profileImage role')
    .sort({ createdAt: -1 });
  
  return sendResponse(res, 200, true, 'Received requests retrieved successfully', { requests });
});

/**
 * Accept a connection request
 * Only receiver can accept
 */
const acceptRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const request = await ConnectRequest.findById(id);
  
  if (!request) {
    return sendResponse(res, 404, false, 'Request not found');
  }
  
  // Only receiver can accept
  if (request.receiver.toString() !== (req.user.id || req.user._id)) {
    return sendResponse(res, 403, false, 'Only receiver can accept this request');
  }
  
  if (request.status !== 'pending') {
    return sendResponse(res, 400, false, 'This request is no longer pending');
  }
  
  // Update request status
  request.status = 'accepted';
  await request.save();
  
  // Notify sender
  const receiver = await User.findById(request.receiver);
  const notification = new Notification({
    user: request.sender,
    type: 'request_accepted',
    message: `${receiver.name} accepted your request`,
    relatedRequest: request._id
  });
  
  await notification.save();
  
  return sendResponse(res, 200, true, 'Request accepted successfully', request);
});

/**
 * Decline a connection request
 * Only receiver can decline
 */
const declineRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const request = await ConnectRequest.findById(id);
  
  if (!request) {
    return sendResponse(res, 404, false, 'Request not found');
  }
  
  // Only receiver can decline
  if (request.receiver.toString() !== (req.user.id || req.user._id)) {
    return sendResponse(res, 403, false, 'Only receiver can decline this request');
  }
  
  if (request.status !== 'pending') {
    return sendResponse(res, 400, false, 'This request is no longer pending');
  }
  
  // Update request status
  request.status = 'declined';
  await request.save();
  
  // Notify sender
  const receiver = await User.findById(request.receiver);
  const notification = new Notification({
    user: request.sender,
    type: 'request_declined',
    message: `${receiver.name} declined your request`,
    relatedRequest: request._id
  });
  
  await notification.save();
  
  return sendResponse(res, 200, true, 'Request declined successfully', request);
});

/**
 * Get connection status between logged-in user and target user
 * Returns: 'none', 'pending_sent', 'pending_received', or 'accepted'
 */
const getRequestStatus = asyncHandler(async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user.id || req.user._id;

  // Check if users are the same
  if (userId === targetUserId) {
    return sendResponse(res, 200, true, 'Status retrieved', { status: 'self' });
  }

  // Look for any existing request between the two users
  const sentRequest = await ConnectRequest.findOne({
    sender: userId,
    receiver: targetUserId
  }).sort({ createdAt: -1 });

  const receivedRequest = await ConnectRequest.findOne({
    sender: targetUserId,
    receiver: userId
  }).sort({ createdAt: -1 });

  let status = 'none';
  let requestId = null;

  if (sentRequest) {
    if (sentRequest.status === 'pending') {
      status = 'pending_sent';
    } else if (sentRequest.status === 'accepted') {
      status = 'accepted';
    }
    requestId = sentRequest._id;
  } else if (receivedRequest) {
    if (receivedRequest.status === 'pending') {
      status = 'pending_received';
    } else if (receivedRequest.status === 'accepted') {
      status = 'accepted';
    }
    requestId = receivedRequest._id;
  }

  return sendResponse(res, 200, true, 'Status retrieved', {
    status,
    requestId
  });
});

export {
  sendRequest,
  getMyRequests,
  getReceivedRequests,
  acceptRequest,
  declineRequest,
  getRequestStatus
};
