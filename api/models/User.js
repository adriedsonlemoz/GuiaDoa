import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  usuario:  { type: String, required: true, unique: true, trim: true },
  senhaHash:{ type: String, required: true },
  papel:    { type: String, default: 'admin' },
  criadoEm: { type: Date, default: Date.now },
}, { collection: 'doa_users' });

export default mongoose.model('User', UserSchema);
