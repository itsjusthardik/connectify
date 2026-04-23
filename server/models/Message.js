import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  readBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ]
}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export default mongoose.model('Message', messageSchema);
