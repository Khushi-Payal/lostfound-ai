import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '', trim: true },
  passwordHash: { type: String, required: true, select: false },
  state: { type: String, default: '', trim: true },
  city: { type: String, default: '', trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  notificationPreferences: {
    matches: { type: Boolean, default: true },
    claims: { type: Boolean, default: true },
    updates: { type: Boolean, default: true },
  },
  resetTokenHash: { type: String, select: false },
  resetTokenExpires: { type: Date, select: false },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
