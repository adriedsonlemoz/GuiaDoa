import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const ItemSchema = new mongoose.Schema({
  nome:       { type: String, required: true, unique: true, trim: true },
  icone:      { type: String, default: '🎒' },
  imagem:     { type: String, default: '', trim: true },
  categoria:  { type: String, default: 'Geral', trim: true },
  raridade:   { type: String, default: '', trim: true },
  quantidade: { type: Number, default: null, min: 0 },
  descricao:  { type: String, default: '' },
  origem:     { type: String, default: '' },
  uso:        { type: String, default: '' },
  limites:    { type: String, default: '' },
  onde:       { type: String, default: '' },
  ordem:      { type: Number, default: 999 },
  i18n:       { type: mongoose.Schema.Types.Mixed, default: {} },
  criadoEm:     { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.itens });

ItemSchema.index({ nome: 'text', descricao: 'text', categoria: 'text', origem: 'text', uso: 'text' });

export default mongoose.model('Item', ItemSchema);
