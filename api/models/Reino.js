import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const ReinoSchema = new mongoose.Schema({
  id:       { type: Number, required: true, unique: true },  // ID numérico visível no jogo
  slug:     { type: String, required: true, unique: true, trim: true },
  nome:     { type: String, required: true, trim: true },
  fuso:     { type: String, required: true, trim: true },    // ex: 'UTC-3'
  regiao:   { type: String, default: '' },                   // ex: 'América do Sul'
  idioma:   { type: String, default: '' },                   // ex: 'Português'
  i18n:      { type: mongoose.Schema.Types.Mixed, default: {} },
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.reinos });

export default mongoose.model('Reino', ReinoSchema);
