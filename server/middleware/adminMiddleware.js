import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import asyncHandler from '../utils/asyncHandler.js';

const adminMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin access required' })
  }
  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  const admin = await Admin.findById(decoded.id).select('-password')
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Admin access required' })
  }
  req.admin = admin
  next()
})

export default adminMiddleware;
