import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const CategoriaSchema = new mongoose.Schema({
  slug:  { type: String, required: true, unique: true, trim: true },
  label: { type: String, required: true, trim: true },
  icon:  { type: String, default: '📖' },
  ordem: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true },
  i18n:      { type: mongoose.Schema.Types.Mixed, default: {} },
}, { collection: COLLECTIONS.dicasCategorias });

export default mongoose.model('CategoriaDica', CategoriaSchema);
