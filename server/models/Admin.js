import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const transformAdmin = (_, ret) => {
  ret.id = ret._id?.toString();
  delete ret.password;
  delete ret.refreshToken;
  return ret;
};

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  refreshToken: { type: String, default: '', select: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: transformAdmin },
  toObject: { virtuals: true, transform: transformAdmin }
})

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('Admin', adminSchema);
