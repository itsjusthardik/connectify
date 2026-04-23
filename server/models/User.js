import mongoose from 'mongoose';
import { USER_NICHES, USER_ROLES, normalizeNiches, normalizeRole } from '../utils/userMetadata.js';

const transformUser = (_, ret) => {
  ret.id = ret._id?.toString();
  ret.role = normalizeRole(ret.role) || ret.role;
  ret.niche = normalizeNiches(ret.niche);
  delete ret.password;
  delete ret.refreshToken;
  return ret;
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true
  },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['Content Creator','Video Editor','Graphic Designer','Consumer','Other'],
    set: (value) => normalizeRole(value) || value,
    required: true
  },
  customRole: { type: String, default: '', maxlength: 100 },
  bio: { type: String, default: '', maxlength: 500 },
  profileImage: { type: String, default: '' },
  location: { type: String, default: '' },
  niche: {
    type: [String],
    enum: USER_NICHES,
    set: (value) => normalizeNiches(value),
    default: []
  },
  customNiche: { type: String, default: '' },
  socialLinks: {
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  followersCount: { type: Number, default: 0, min: 0 },
  skills: { type: [String], default: [] },
  portfolioLinks: { type: [String], default: [] },
  experienceYears: { type: Number, default: 0, min: 0 },
  hourlyRate: { type: Number, default: 0, min: 0 },
  businessName: { type: String, default: '' },
  businessType: { type: String, default: '' },
  website: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  refreshToken: { type: String, default: '', select: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: transformUser },
  toObject: { virtuals: true, transform: transformUser }
})

userSchema.pre('validate', function (next) {
  if (this.role) {
    this.role = normalizeRole(this.role) || this.role;
  }

  if (this.niche) {
    this.niche = normalizeNiches(this.niche);
  }

  next();
});

userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ niche: 1 })
userSchema.index({ isActive: 1 })

export default mongoose.model('User', userSchema);
