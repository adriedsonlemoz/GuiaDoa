import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const RowSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, default: null },
  name: { type: String, required: true },
  normalizedName: { type: String, required: true },
  power: { type: Number, default: null },
  lastConnectionAt: { type: Date, default: null },
  lastConnectionRaw: { type: String, default: '' },
  joinedAt: { type: Date, default: null },
  joinedAtRaw: { type: String, default: '' },
  online: { type: Boolean, default: false },
}, { _id: false });

const ChangeSchema = new mongoose.Schema({
  type: { type: String, enum: ['joined', 'left', 'returned', 'nickname_candidate', 'renamed'], required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, default: null },
  name: { type: String, default: '' },
  otherMemberId: { type: mongoose.Schema.Types.ObjectId, default: null },
  otherName: { type: String, default: '' },
  score: { type: Number, default: null },
  note: { type: String, default: '' },
}, { _id: false });

const AllianceSnapshotSchema = new mongoose.Schema({
  allianceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  type: { type: String, enum: ['power', 'last_connection', 'joined_at'], required: true, index: true },
  capturedAt: { type: Date, required: true, index: true },
  completeList: { type: Boolean, default: false },
  baseline: { type: Boolean, default: false },
  imagesCount: { type: Number, default: 1, min: 0, max: 20 },
  rows: { type: [RowSchema], default: [] },
  changes: { type: [ChangeSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.allianceSnapshots });

AllianceSnapshotSchema.index({ allianceId: 1, capturedAt: -1 });
export default mongoose.model('AllianceSnapshot', AllianceSnapshotSchema);
