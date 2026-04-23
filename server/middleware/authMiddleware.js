import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized' })
  }
  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  const user = await User.findById(decoded.id).select('-password')
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Not authorized' })
  }
  req.user = user
  next()
})

export default authMiddleware;
