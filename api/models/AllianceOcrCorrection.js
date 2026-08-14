import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const AllianceOcrCorrectionSchema = new mongoose.Schema({
  allianceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  observedName: { type: String, required: true, trim: true, maxlength: 80 },
  normalizedObserved: { type: String, required: true, maxlength: 80 },
  confirmedName: { type: String, required: true, trim: true, maxlength: 80 },
  normalizedConfirmed: { type: String, required: true, maxlength: 80 },
  count: { type: Number, default: 1, min: 1 },
  firstConfirmedAt: { type: Date, default: Date.now },
  lastConfirmedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { collection: COLLECTIONS.allianceOcrCorrections });

AllianceOcrCorrectionSchema.index({ allianceId: 1, normalizedObserved: 1, normalizedConfirmed: 1 }, { unique: true });
AllianceOcrCorrectionSchema.index({ allianceId: 1, count: -1, lastConfirmedAt: -1 });

export default mongoose.model('AllianceOcrCorrection', AllianceOcrCorrectionSchema);
