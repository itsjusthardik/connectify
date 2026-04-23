const User = require('../models/User')
const ConnectRequest = require('../models/ConnectRequest')
const Notification = require('../models/Notification')
const asyncHandler = require('../utils/asyncHandler')
const path = require('path')
const fs = require('fs')

// Role browse matrix
const browseMatrix = {
  content_creator: ['video_editor', 'graphic_designer', 'other'],
  video_editor: ['content_creator', 'other'],
  graphic_designer: ['content_creator', 'other'],
  consumer: ['content_creator', 'other'],
  other: ['content_creator', 'video_editor', 'graphic_designer', 'consumer', 'other']
}

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  res.json({ success: true, user })
})

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken')
  if (!user || !user.isActive) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }
  res.json({ success: true, user })
})

const updateProfile = asyncHandler(async (req, res) => {
  const forbidden = ['role', 'email', 'password', 'refreshToken', 'isVerified', 'isActive']
  const updates = {}

  const allowed = ['name','bio','location','niche','customNiche',
    'socialLinks','followersCount','skills','portfolioLinks',
    'experienceYears','hourlyRate','businessName','businessType','website']

  allowed.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field]
  })

  if (updates.niche) {
    const validNiches = ['tech','fitness','fashion','food','travel',
      'gaming','beauty','finance','education','lifestyle','other']
    updates.niche = updates.niche.filter(n => validNiches.includes(n))
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -refreshToken')

  res.json({ success: true, message: 'Profile updated', user })
})

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' })
  }

  const user = await User.findById(req.user.id)
  if (user.profileImage) {
    const oldPath = path.join(__dirname, '..', user.profileImage)
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
  }

  const imagePath = `/uploads/${req.file.filename}`
  await User.findByIdAndUpdate(req.user.id, { profileImage: imagePath })

  res.json({ success: true, imagePath })
})

const browseUsers = asyncHandler(async (req, res) => {
  const myRole = req.user.role
  const { role, niche, skills, search, page = 1, limit = 10 } = req.query

  if (!role) {
    return res.status(400).json({ success: false, message: 'Role param required' })
  }

  const allowed = browseMatrix[myRole] || []
  if (!allowed.includes(role)) {
    return res.status(403).json({
      success: false,
      message: 'You are not allowed to browse this user type'
    })
  }

  const query = {
    role,
    isActive: true,
    _id: { $ne: req.user.id }
  }

  if (niche) query.niche = { $in: niche.split(',') }
  if (skills) query.skills = { $in: skills.split(',') }
  if (search) query.name = { $regex: search.trim(), $options: 'i' }

  const skip = (parseInt(page) - 1) * parseInt(limit)
  const total = await User.countDocuments(query)
  const users = await User.find(query)
    .select('name role customRole profileImage bio location niche customNiche skills hourlyRate experienceYears followersCount businessName businessType socialLinks createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))

  res.json({
    success: true,
    users,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  })
})

const browseCounts = asyncHandler(async (req, res) => {
  const myRole = req.user.role
  const allowed = browseMatrix[myRole] || []

  const counts = {}
  await Promise.all(
    allowed.map(async role => {
      counts[role] = await User.countDocuments({
        role, isActive: true, _id: { $ne: req.user.id }
      })
    })
  )

  res.json({ success: true, counts, allowedRoles: allowed })
})

const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const [
    pendingReceived,
    pendingSent,
    accepted,
    unreadNotifications,
    totalNotifications
  ] = await Promise.all([
    ConnectRequest.countDocuments({ receiver: userId, status: 'pending' }),
    ConnectRequest.countDocuments({ sender: userId, status: 'pending' }),
    ConnectRequest.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted'
    }),
    Notification.countDocuments({ user: userId, isRead: false }),
    Notification.countDocuments({ user: userId })
  ])

  res.json({
    success: true,
    stats: {
      pendingRequestsReceived: pendingReceived,
      pendingRequestsSent: pendingSent,
      acceptedConnections: accepted,
      unreadNotifications,
      totalNotifications
    }
  })
})

module.exports = {
  getMe, getProfile, updateProfile,
  uploadProfileImage, browseUsers, browseCounts, getDashboardStats
}
