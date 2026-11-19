import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['match', 'similar-item', 'report-update', 'claim-received', 'claim-update', 'message', 'system'], default: 'system' },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  itemId: { type: String, default: '' },
  claimId: { type: String, default: '' },
  readAt: { type: Date, default: null, index: true },
}, { timestamps: true });

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
