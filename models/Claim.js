import mongoose from 'mongoose';

const ClaimSchema = new mongoose.Schema({
  itemId: { type: String, required: true, index: true },
  claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  claimantName: { type: String, required: true, trim: true, maxlength: 100 },
  itemDescription: { type: String, required: true, trim: true, maxlength: 1500 },
  uniqueDetails: { type: String, required: true, trim: true, maxlength: 1500 },
  proofDescription: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['Pending', 'Under Review', 'Approved', 'Rejected'], default: 'Pending', index: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewerNote: { type: String, default: '', maxlength: 1000 },
}, { timestamps: true });

ClaimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

export default mongoose.models.Claim || mongoose.model('Claim', ClaimSchema);
