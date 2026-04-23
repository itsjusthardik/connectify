import mongoose from 'mongoose';

const connectRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['connect', 'collaboration'],
    required: true
  },
  message: { type: String, default: '', maxlength: 300 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, { timestamps: true })

connectRequestSchema.index({ sender: 1 })
connectRequestSchema.index({ receiver: 1 })
connectRequestSchema.index({ sender: 1, receiver: 1, status: 1 })

export default mongoose.model('ConnectRequest', connectRequestSchema);
