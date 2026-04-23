import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }
}, { timestamps: true });

// Ensure we can quickly look up conversations for a user
conversationSchema.index({ participants: 1 });
// Ensure a unique pair of participants (sorted)
conversationSchema.index({ participants: 1 }, { unique: true });

export default mongoose.model('Conversation', conversationSchema);
