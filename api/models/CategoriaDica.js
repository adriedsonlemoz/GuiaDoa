import mongoose from 'mongoose';

const CategoriaSchema = new mongoose.Schema({
  slug:  { type: String, required: true, unique: true, trim: true },
  label: { type: String, required: true, trim: true },
  icon:  { type: String, default: '📖' },
  ordem: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true },
}, { collection: 'doa_dicas_categorias' });

export default mongoose.model('CategoriaDica', CategoriaSchema);
