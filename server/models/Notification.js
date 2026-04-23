import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['request_received', 'request_accepted', 'request_declined'],
    required: true
  },
  message: { type: String, required: true },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectRequest'
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true })

notificationSchema.index({ user: 1, isRead: 1 })
notificationSchema.index({ createdAt: -1 })

export default mongoose.model('Notification', notificationSchema);
