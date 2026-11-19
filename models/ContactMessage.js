import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  itemId: { type: String, default: '' },
  threadId: { type: String, default: '', index: true },
  status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new', index: true },
}, { timestamps: true });

ContactMessageSchema.index({ createdAt: -1 });

export default mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
