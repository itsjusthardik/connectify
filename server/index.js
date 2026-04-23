import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'

import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import adminAuthRoutes from './routes/adminAuth.js'
import userRoutes from './routes/users.js'
import requestRoutes from './routes/requests.js'
import notificationRoutes from './routes/notifications.js'
import demandRoutes from './routes/demands.js'
import chatRoutes from './routes/chat.js'
import errorHandler from './middleware/errorHandler.js'

import User from './models/User.js'
import Conversation from './models/Conversation.js'
import Message from './models/Message.js'
import ConnectRequest from './models/ConnectRequest.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
]
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL)

// Socket.IO server
const io = new SocketServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Connect database
connectDB()

// Create uploads folder if missing
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

// Security middleware
app.use(helmet())
app.disable('x-powered-by')
app.use(cors({
  origin: function(origin, callback) {
    // Allow same-origin requests (no origin header) and localhost in dev
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  message: {
    success: false,
    message: 'Too many attempts. Please wait 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
})
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
})

app.use('/api/auth', authLimiter)
app.use('/api', generalLimiter)

// Body parsing
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Data sanitization
app.use(mongoSanitize())
app.use(xss())
app.use(hpp())

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminAuthRoutes)
app.use('/api/users', userRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/demands', demandRoutes)
app.use('/api/chat', chatRoutes)

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use(errorHandler)

// ─── Socket.IO Authentication & Events ───────────────────────────────

// Map userId -> Set of socketIds (user can have multiple tabs)
const onlineUsers = new Map()

// Auth middleware for Socket.IO connections
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication required'))

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decoded.id).select('-password -refreshToken')
    if (!user || !user.isActive) return next(new Error('User not found'))

    socket.user = user
    next()
  } catch (err) {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  const userId = socket.user._id.toString()
  console.log(`🔌 Socket connected: ${socket.user.name} (${userId})`)

  // Track online status
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set())
  onlineUsers.get(userId).add(socket.id)

  // Broadcast online status
  io.emit('user_online', { userId })

  // ── Join a conversation room ──
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conv:${conversationId}`)
  })

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conv:${conversationId}`)
  })

  // ── Send a message ──
  socket.on('send_message', async ({ conversationId, content }) => {
    try {
      if (!content || !content.trim()) return

      // Validate conversation exists and user is participant
      const conversation = await Conversation.findById(conversationId)
      if (!conversation) return
      if (!conversation.participants.map(p => p.toString()).includes(userId)) return

      // Validate the two users are actually connected
      const otherParticipant = conversation.participants.find(p => p.toString() !== userId)
      const connected = await ConnectRequest.findOne({
        $or: [
          { sender: userId, receiver: otherParticipant },
          { sender: otherParticipant, receiver: userId }
        ],
        status: 'accepted'
      })
      if (!connected) return

      // Save message
      const message = await Message.create({
        conversation: conversationId,
        sender: userId,
        content: content.trim(),
        readBy: [userId]
      })

      // Update conversation's lastMessage
      conversation.lastMessage = message._id
      await conversation.save()

      // Populate sender info for the response
      const populated = await Message.findById(message._id)
        .populate('sender', 'name profileImage')

      // Emit to all users in the conversation room
      io.to(`conv:${conversationId}`).emit('new_message', {
        message: populated
      })

      // Also notify the other participant if they're not in the room
      // (for unread badge updates)
      const otherUserId = otherParticipant.toString()
      if (onlineUsers.has(otherUserId)) {
        onlineUsers.get(otherUserId).forEach(sid => {
          io.to(sid).emit('unread_update', { conversationId })
        })
      }
    } catch (err) {
      console.error('send_message error:', err.message)
    }
  })

  // ── Typing indicators ──
  socket.on('typing', ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit('user_typing', {
      userId,
      conversationId
    })
  })

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit('user_stop_typing', {
      userId,
      conversationId
    })
  })

  // ── Mark messages as read ──
  socket.on('mark_read', async ({ conversationId }) => {
    try {
      await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: userId },
          readBy: { $nin: [userId] }
        },
        { $addToSet: { readBy: userId } }
      )
      socket.to(`conv:${conversationId}`).emit('messages_read', {
        conversationId,
        readBy: userId
      })
    } catch (err) {
      console.error('mark_read error:', err.message)
    }
  })

  // ── Get online users ──
  socket.on('get_online_users', () => {
    socket.emit('online_users', { users: Array.from(onlineUsers.keys()) })
  })

  // ── Disconnect ──
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.user.name}`)
    if (onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id)
      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId)
        io.emit('user_offline', { userId })
      }
    }
  })
})

// ─── Start Server ────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

export default app
