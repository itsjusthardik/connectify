import { validationResult } from 'express-validator';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import ConnectRequest from '../models/ConnectRequest.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import sendResponse from '../utils/sendResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  CONSUMER_ROLE,
  CONTENT_CREATOR_ROLE,
  GRAPHIC_DESIGNER_ROLE,
  VIDEO_EDITOR_ROLE,
  normalizeRole
} from '../utils/userMetadata.js';

const ADMIN_REFRESH_COOKIE = 'adminRefreshToken';
const adminRefreshCookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const safeAdmin = (admin) => {
  const serialized = admin?.toJSON ? admin.toJSON() : admin;

  return {
    _id: serialized._id,
    id: serialized.id || serialized._id?.toString(),
    name: serialized.name,
    email: serialized.email,
    createdAt: serialized.createdAt
  };
};

/**
 * Admin registration
 */
const adminRegister = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email: normalizedEmail });
  if (existingAdmin) {
    return sendResponse(res, 400, false, 'Admin email already registered');
  }
  
  // Create admin
  const admin = new Admin({ name: name.trim(), email: normalizedEmail, password });
  await admin.save();
  
  // Generate tokens
  const accessToken = generateAccessToken({ id: admin._id });
  const refreshToken = generateRefreshToken({ id: admin._id });
  
  // Save refresh token
  admin.refreshToken = refreshToken;
  await admin.save();
  
  res.cookie(ADMIN_REFRESH_COOKIE, refreshToken, adminRefreshCookieOptions);
  const adminData = safeAdmin(admin);
  
  return res.status(201).json({
    success: true,
    message: 'Admin registered successfully',
    data: {
      admin: adminData,
      accessToken,
      token: accessToken
    }
  });
});

/**
 * Admin login
 */
const adminLogin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  
  // Find admin
  const admin = await Admin.findOne({ email: normalizedEmail }).select('+password +refreshToken');
  if (!admin) {
    return sendResponse(res, 401, false, 'Invalid email or password');
  }
  
  // Verify password
  const isPasswordValid = await admin.matchPassword(password);
  if (!isPasswordValid) {
    return sendResponse(res, 401, false, 'Invalid email or password');
  }
  
  // Generate tokens
  const accessToken = generateAccessToken({ id: admin._id });
  const refreshToken = generateRefreshToken({ id: admin._id });
  
  admin.refreshToken = refreshToken;
  await admin.save();
  
  res.cookie(ADMIN_REFRESH_COOKIE, refreshToken, adminRefreshCookieOptions);
  const adminData = safeAdmin(admin);
  
  return res.status(200).json({
    success: true,
    message: 'Admin login successful',
    data: {
      admin: adminData,
      accessToken,
      token: accessToken
    }
  });
});

/**
 * Get admin dashboard statistics
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Total users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const totalUsers = await User.countDocuments();
  
  // Request statistics
  const totalRequests = await ConnectRequest.countDocuments();
  const pendingRequests = await ConnectRequest.countDocuments({ status: 'pending' });
  const acceptedRequests = await ConnectRequest.countDocuments({ status: 'accepted' });
  
  const stats = {
    totalUsers,
    totalRequests,
    pendingRequests,
    acceptedRequests,
    usersByRole: {
      content_creators: usersByRole.find(r => normalizeRole(r._id) === CONTENT_CREATOR_ROLE)?.count || 0,
      video_editors: usersByRole.find(r => normalizeRole(r._id) === VIDEO_EDITOR_ROLE)?.count || 0,
      graphic_designers: usersByRole.find(r => normalizeRole(r._id) === GRAPHIC_DESIGNER_ROLE)?.count || 0,
      consumers: usersByRole.find(r => normalizeRole(r._id) === CONSUMER_ROLE)?.count || 0
    }
  };
  
  return sendResponse(res, 200, true, 'Dashboard stats retrieved', stats);
});

/**
 * Admin logout
 */
const adminLogout = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id || req.admin._id);
  
  if (admin) {
    admin.refreshToken = '';
    await admin.save();
  }
  
  res.clearCookie(ADMIN_REFRESH_COOKIE, adminRefreshCookieOptions);
  
  return sendResponse(res, 200, true, 'Admin logged out successfully');
});

export {
  adminRegister,
  adminLogin,
  getDashboardStats,
  adminLogout
};
