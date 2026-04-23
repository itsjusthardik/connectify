import User from '../models/User.js';
import ConnectRequest from '../models/ConnectRequest.js';
import Notification from '../models/Notification.js';
import sendResponse from '../utils/sendResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import path from 'path';
import fs from 'fs';
import {
  CONSUMER_ROLE,
  CONTENT_CREATOR_ROLE,
  GRAPHIC_DESIGNER_ROLE,
  OTHER_ROLE,
  VIDEO_EDITOR_ROLE,
  buildRoleFilter,
  normalizeNiches,
  normalizeRole
} from '../utils/userMetadata.js';

/**
 * Get user profile by ID
 * Public endpoint - anyone can view any profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id).select('-password -refreshToken');
  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }
  
  return sendResponse(res, 200, true, 'Profile retrieved successfully', { user: user.toJSON() });
});

/**
 * Update own profile - Protected route
 * Only allow updating specific fields
 * Never allow: password, email, role to be updated here
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId);
  
  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  // Build update object - only include sent fields
  const updateData = {};

  // Common fields (all roles)
  if (req.body.name !== undefined) {
    const name = req.body.name.trim();
    if (name.length < 2) {
      return sendResponse(res, 400, false, 'Name must be at least 2 characters');
    }
    updateData.name = name;
  }

  if (req.body.bio !== undefined) {
    const bio = req.body.bio.trim();
    if (bio.length > 500) {
      return sendResponse(res, 400, false, 'Bio cannot exceed 500 characters');
    }
    updateData.bio = bio;
  }

  if (req.body.location !== undefined) {
    updateData.location = req.body.location.trim();
  }

  if (req.body.profileImage !== undefined) {
    updateData.profileImage = req.body.profileImage;
  }

  const normalizedUserRole = normalizeRole(user.role);

  // Content Creator specific
  if (normalizedUserRole === CONTENT_CREATOR_ROLE) {
    if (req.body.niche !== undefined && Array.isArray(req.body.niche)) {
      updateData.niche = normalizeNiches(req.body.niche);
    }
    if (req.body.socialLinks !== undefined) {
      updateData.socialLinks = req.body.socialLinks;
    }
    if (req.body.followersCount !== undefined) {
      const count = parseInt(req.body.followersCount);
      if (count >= 0) updateData.followersCount = count;
    }
  }

  // Video Editor / Graphic Designer specific
  if (normalizedUserRole === VIDEO_EDITOR_ROLE || normalizedUserRole === GRAPHIC_DESIGNER_ROLE) {
    if (req.body.skills !== undefined && Array.isArray(req.body.skills)) {
      updateData.skills = req.body.skills;
    }
    if (req.body.portfolioLinks !== undefined && Array.isArray(req.body.portfolioLinks)) {
      // Validate URLs
      const validLinks = req.body.portfolioLinks.filter(link => {
        try {
          new URL(link);
          return true;
        } catch {
          return false;
        }
      });
      updateData.portfolioLinks = validLinks;
    }
    if (req.body.experienceYears !== undefined) {
      const years = parseInt(req.body.experienceYears);
      if (years >= 0) updateData.experienceYears = years;
    }
    if (req.body.hourlyRate !== undefined) {
      const rate = parseFloat(req.body.hourlyRate);
      if (rate > 0) updateData.hourlyRate = rate;
    }
  }

  // Consumer specific
  if (normalizedUserRole === CONSUMER_ROLE) {
    if (req.body.businessName !== undefined) {
      updateData.businessName = req.body.businessName.trim();
    }
    if (req.body.businessType !== undefined) {
      updateData.businessType = req.body.businessType.trim();
    }
    if (req.body.website !== undefined) {
      updateData.website = req.body.website.trim();
    }
  }

  // Other role specific
  if (normalizedUserRole === OTHER_ROLE) {
    if (req.body.skills !== undefined && Array.isArray(req.body.skills)) {
      updateData.skills = req.body.skills;
    }
    if (req.body.portfolioLinks !== undefined && Array.isArray(req.body.portfolioLinks)) {
      updateData.portfolioLinks = req.body.portfolioLinks;
    }
  }

  // Update only the fields that were sent
  Object.assign(user, updateData);
  await user.save();

  return sendResponse(res, 200, true, 'Profile updated successfully', {
    user: user.toJSON()
  });
});

/**
 * Upload profile image - Protected route
 * Accepts file via multer middleware
 * Validates file type and size, saves to uploads folder
 */
const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, false, 'No file uploaded');
  }

  const user = await User.findById(req.user.id || req.user._id);
  if (!user) {
    return sendResponse(res, 404, false, 'User not found');
  }

  // Delete old image if exists
  if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
    const filename = user.profileImage.replace('/uploads/', '');
    const oldPath = path.join('server/uploads', filename);
    try {
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    } catch (err) {
      console.warn('Could not delete old profile image:', err.message);
    }
  }

  // Save new image path
  user.profileImage = `/uploads/${req.file.filename}`;
  await user.save();

  return sendResponse(res, 200, true, 'Profile image uploaded successfully', {
    imagePath: user.profileImage
  });
});

/**
 * Get dashboard statistics for logged-in user
 * Returns: pending requests, accepted connections, notifications
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const [
    pendingRequestsReceived,
    pendingRequestsSent,
    acceptedConnections,
    totalNotifications,
    unreadNotifications
  ] = await Promise.all([
    ConnectRequest.countDocuments({ receiver: userId, status: 'pending' }),
    ConnectRequest.countDocuments({ sender: userId, status: 'pending' }),
    ConnectRequest.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted'
    }),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false })
  ]);

  return sendResponse(res, 200, true, 'Stats retrieved successfully', {
    pendingRequestsReceived,
    pendingRequestsSent,
    acceptedConnections,
    totalNotifications,
    unreadNotifications
  });
});

/**
 * Get user counts by role (public endpoint)
 * No authentication required
 * Returns count of active users for each role
 */
const getUserCounts = asyncHandler(async (req, res) => {
  const counts = await User.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  
  const result = {};
  counts.forEach((countEntry) => {
    const role = normalizeRole(countEntry._id) || countEntry._id;
    result[role] = (result[role] || 0) + countEntry.count;
  });
  
  return sendResponse(res, 200, true, 'User counts retrieved successfully', { counts: result });
});

/**
 * Browse all users by role
 * Public endpoint - anyone can view
 * Query params: role, page, limit
 */
const browseUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;
  
  const filter = { isActive: true };
  if (role && role !== 'all') {
    const roleFilter = buildRoleFilter(role);
    if (!roleFilter) {
      return sendResponse(res, 400, false, 'Invalid role filter');
    }
    filter.role = roleFilter;
  }
  
  // Exclude the logged-in user if they're authenticated
  if (req.user) {
    filter._id = { $ne: req.user.id || req.user._id };
  }
  
  const skip = (page - 1) * limit;
  const users = await User.find(filter)
    .select('-password -refreshToken')
    .limit(Number(limit))
    .skip(Number(skip))
    .sort({ createdAt: -1 });
  
  const total = await User.countDocuments(filter);
  
  return sendResponse(res, 200, true, 'Users retrieved successfully', {
    users: users.map(u => u.toJSON()),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * Browse creators
 * Accessible only to consumers
 * Query params: niche, search, page, limit
 */
const browseCreators = asyncHandler(async (req, res) => {
  const { niche, search, page = 1, limit = 10 } = req.query;
  
  // Build filter
  const filter = { role: buildRoleFilter(CONTENT_CREATOR_ROLE), isActive: true };
  
  if (niche) {
    const niches = normalizeNiches(Array.isArray(niche) ? niche : String(niche).split(','));
    if (niches.length) {
      filter.niche = { $in: niches };
    }
  }
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const creators = await User.find(filter)
    .select('-password -refreshToken')
    .limit(Number(limit))
    .skip(Number(skip))
    .sort({ createdAt: -1 });
  
  const total = await User.countDocuments(filter);
  
  return sendResponse(res, 200, true, 'Creators retrieved successfully', {
    creators: creators.map(c => c.toJSON()),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * Browse talent (video editors and graphic designers)
 * Accessible only to content creators
 * Query params: type (video_editor or graphic_designer), skills, page, limit
 */
const browseTalent = asyncHandler(async (req, res) => {
  const { type, skills, page = 1, limit = 10 } = req.query;
  
  const filter = { isActive: true };
  const normalizedType = type ? normalizeRole(type) : null;
  
  // Filter by type
  if (normalizedType === VIDEO_EDITOR_ROLE) {
    filter.role = buildRoleFilter(VIDEO_EDITOR_ROLE);
  } else if (normalizedType === GRAPHIC_DESIGNER_ROLE) {
    filter.role = buildRoleFilter(GRAPHIC_DESIGNER_ROLE);
  } else {
    filter.role = buildRoleFilter([VIDEO_EDITOR_ROLE, GRAPHIC_DESIGNER_ROLE]);
  }
  
  // Filter by skills
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : [skills];
    filter.skills = { $in: skillsArray };
  }
  
  const skip = (page - 1) * limit;
  
  const talent = await User.find(filter)
    .select('-password -refreshToken')
    .limit(Number(limit))
    .skip(Number(skip))
    .sort({ hourlyRate: 1 });
  
  const total = await User.countDocuments(filter);
  
  return sendResponse(res, 200, true, 'Talent retrieved successfully', {
    talent: talent.map(t => t.toJSON()),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

export {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getDashboardStats,
  getUserCounts,
  browseUsers,
  browseCreators,
  browseTalent
};
