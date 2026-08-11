import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  nome:      { type: String, required: true, unique: true, trim: true },
  icone:     { type: String, default: '🎒' },
  descricao: { type: String, default: '' },
  onde:      { type: String, default: '' },
  criadoEm:     { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: 'doa_itens' });

ItemSchema.index({ nome: 'text', descricao: 'text' });

export default mongoose.model('Item', ItemSchema);
