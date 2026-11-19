import mongoose from 'mongoose';

const SavedItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemId: { type: String, required: true, index: true },
}, { timestamps: true });

SavedItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

export default mongoose.models.SavedItem || mongoose.model('SavedItem', SavedItemSchema);
