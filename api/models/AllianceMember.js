import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const AliasSchema = new mongoose.Schema({
  name: { type: String, required: true },
  normalizedName: { type: String, required: true },
  from: { type: Date, default: Date.now },
  to: { type: Date, default: null },
}, { _id: false });

const AllianceMemberSchema = new mongoose.Schema({
  allianceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  currentName: { type: String, required: true, trim: true, maxlength: 80 },
  normalizedName: { type: String, required: true, index: true },
  aliases: { type: [AliasSchema], default: [] },
  status: { type: String, enum: ['active', 'left'], default: 'active', index: true },
  firstSeenAt: { type: Date, required: true },
  lastSeenAt: { type: Date, required: true },
  joinedAt: { type: Date, default: null },
  joinedAtRaw: { type: String, default: '' },
  leftAt: { type: Date, default: null },
  lastConnectionAt: { type: Date, default: null },
  lastConnectionRaw: { type: String, default: '' },
  onlineAtCapture: { type: Boolean, default: false },
  onlineCapturedAt: { type: Date, default: null },
  latestPower: { type: Number, default: null },
  latestPowerAt: { type: Date, default: null },
  previousPower: { type: Number, default: null },
  previousPowerAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.allianceMembers });

AllianceMemberSchema.index({ allianceId: 1, normalizedName: 1 });
AllianceMemberSchema.index({ allianceId: 1, status: 1, latestPower: -1 });
export default mongoose.model('AllianceMember', AllianceMemberSchema);
