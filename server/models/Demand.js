import mongoose from 'mongoose'

const demandSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: [
      'need_video_editor',
      'need_graphic_designer',
      'need_content_creator',
      'need_brand_promotion',
      'need_collaboration',
      'other'
    ],
    required: true
  },
  budget: {
    type: Number,
    default: 0
  },
  budgetType: {
    type: String,
    enum: ['fixed', 'per_hour', 'negotiable'],
    default: 'negotiable'
  },
  deadline: {
    type: Date,
    default: null
  },
  skills: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true })

demandSchema.index({ author: 1 })
demandSchema.index({ category: 1 })
demandSchema.index({ status: 1 })
demandSchema.index({ createdAt: -1 })

export default mongoose.model('Demand', demandSchema)
