import mongoose from 'mongoose';

const FoundItemSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['found'], default: 'found', immutable: true },
  name: { type: String, required: true, trim: true, maxlength: 120, index: 'text' },
  category: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true, trim: true, maxlength: 3000, index: 'text' },
  brand: { type: String, default: '', trim: true },
  color: { type: String, default: '', trim: true },
  marks: { type: String, default: '', trim: true, maxlength: 1000 },
  date: { type: String, required: true, index: true },
  time: { type: String, default: '' },
  state: { type: String, required: true, trim: true, index: true },
  city: { type: String, required: true, trim: true, index: true },
  location: { type: String, required: true, trim: true, maxlength: 250 },
  image: { type: String, default: '' },
  additionalInfo: { type: String, default: '', maxlength: 2000 },
  secured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'recovered', 'under-review', 'closed'], default: 'active', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  isDemo: { type: Boolean, default: false, index: true },
}, { timestamps: true });

FoundItemSchema.index({ state: 1, city: 1, category: 1, date: -1 });

export default mongoose.models.FoundItem || mongoose.model('FoundItem', FoundItemSchema);
