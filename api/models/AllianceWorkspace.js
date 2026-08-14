import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const AllianceWorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  realm: { type: String, default: '', trim: true, maxlength: 80 },
  utcOffset: { type: Number, default: 0, min: -12, max: 14 },
  memberLimit: { type: Number, default: 120, min: 1, max: 120 },
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.allianceWorkspaces });

AllianceWorkspaceSchema.index({ ownerUserId: 1, name: 1, realm: 1 });
export default mongoose.model('AllianceWorkspace', AllianceWorkspaceSchema);
