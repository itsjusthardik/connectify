import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';
import {
  OTHER_ROLE,
  normalizeNiches,
  normalizeRole
} from '../utils/userMetadata.js';

// Helper: set refresh token cookie
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, refreshCookieOptions)
}

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', refreshCookieOptions)
}

// Helper: safe user object
const safeUser = (user) => {
  const serialized = user?.toJSON ? user.toJSON() : user

  return {
    _id: serialized._id,
    id: serialized.id || serialized._id?.toString(),
    name: serialized.name,
    email: serialized.email,
    role: serialized.role,
    customRole: serialized.customRole,
    bio: serialized.bio,
    profileImage: serialized.profileImage,
    location: serialized.location,
    niche: serialized.niche,
    customNiche: serialized.customNiche,
    socialLinks: serialized.socialLinks,
    followersCount: serialized.followersCount,
    skills: serialized.skills,
    portfolioLinks: serialized.portfolioLinks,
    experienceYears: serialized.experienceYears,
    hourlyRate: serialized.hourlyRate,
    businessName: serialized.businessName,
    businessType: serialized.businessType,
    website: serialized.website,
    isVerified: serialized.isVerified,
    isActive: serialized.isActive,
    createdAt: serialized.createdAt
  }
}

const sanitizeStringArray = (values) => {
  if (!Array.isArray(values)) return []

  return values
    .map((value) => String(value).trim())
    .filter(Boolean)
}

const sanitizeSocialLinks = (socialLinks = {}) => ({
  youtube: String(socialLinks.youtube || '').trim(),
  instagram: String(socialLinks.instagram || '').trim(),
  twitter: String(socialLinks.twitter || '').trim()
})

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    })
  }

  const { name, email, password, role, customRole,
          bio, location,
          niche, customNiche, socialLinks, followersCount,
          skills, portfolioLinks, experienceYears, hourlyRate,
          businessName, businessType, website } = req.body

  const normalizedRole = normalizeRole(role)
  if (!normalizedRole) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role selected'
    })
  }

  if (normalizedRole === OTHER_ROLE && !customRole?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Please describe your role'
    })
  }

  const normalizedEmail = email.trim().toLowerCase()

  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists'
    })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const normalizedNiche = normalizeNiches(niche)

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: normalizedRole,
    customRole: normalizedRole === OTHER_ROLE ? customRole.trim() : '',
    bio: String(bio || '').trim(),
    location: String(location || '').trim(),
    niche: normalizedNiche,
    customNiche: String(customNiche || '').trim(),
    socialLinks: sanitizeSocialLinks(socialLinks),
    followersCount: Number.isFinite(Number(followersCount)) ? Number(followersCount) : 0,
    skills: sanitizeStringArray(skills),
    portfolioLinks: sanitizeStringArray(portfolioLinks),
    experienceYears: Number.isFinite(Number(experienceYears)) ? Number(experienceYears) : 0,
    hourlyRate: Number.isFinite(Number(hourlyRate)) ? Number(hourlyRate) : 0,
    businessName: String(businessName || '').trim(),
    businessType: String(businessType || '').trim(),
    website: String(website || '').trim()
  })

  const payload = { id: user._id, role: user.role }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  user.refreshToken = refreshToken
  await user.save()

  setRefreshCookie(res, refreshToken)
  const userData = safeUser(user)

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    accessToken,
    user: userData
  })
})

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    })
  }

  const { email, password } = req.body

  const normalizedEmail = email.trim().toLowerCase()
  const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken')
  const invalidMsg = 'Invalid email or password'

  if (!user) {
    return res.status(401).json({ success: false, message: invalidMsg })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ success: false, message: invalidMsg })
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated'
    })
  }

  const payload = { id: user._id, role: user.role }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  user.refreshToken = refreshToken
  await user.save()

  setRefreshCookie(res, refreshToken)
  const userData = safeUser(user)

  res.json({
    success: true,
    accessToken,
    user: userData
  })
})

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (token) {
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: '' }
    )
  }
  clearRefreshCookie(res)
  res.json({ success: true, message: 'Logged out successfully' })
})

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token' })
  }

  let decoded
  try {
    decoded = jwt.verify(
      token, process.env.REFRESH_TOKEN_SECRET
    )
  } catch {
    clearRefreshCookie(res)
    return res.status(401).json({ success: false, message: 'Invalid refresh token' })
  }

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== token) {
    clearRefreshCookie(res)
    return res.status(401).json({ success: false, message: 'Invalid refresh token' })
  }

  const payload = { id: user._id, role: user.role }
  const newAccessToken = generateAccessToken(payload)
  const newRefreshToken = generateRefreshToken(payload)

  user.refreshToken = newRefreshToken
  await user.save()

  setRefreshCookie(res, newRefreshToken)
  const userData = safeUser(user)

  res.json({
    success: true,
    accessToken: newAccessToken,
    user: userData,
    data: {
      accessToken: newAccessToken,
      user: userData
    }
  })
})

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  const userData = safeUser(user)
  res.json({ success: true, user: userData, data: { user: userData } })
})

export { register, login, logout, refresh, getMe };
