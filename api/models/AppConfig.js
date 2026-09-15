import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const AppConfigSchema = new mongoose.Schema({
  chave: { type: String, required: true, unique: true, trim: true },
  modoDados: { type: String, default: 'mongo' },
  migracaoVersao: { type: String, default: '' },
  migracaoEstado: { type: String, enum: ['pendente', 'executando', 'pronto', 'erro'], default: 'pendente' },
  migracaoEm: { type: Date, default: null },
  setupConcluido: { type: Boolean, default: false },
  setupConcluidoEm: { type: Date, default: null },
  relatorioMigracao: { type: mongoose.Schema.Types.Mixed, default: {} },
  ultimoErro: { type: String, default: '' },
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.config });

export default mongoose.model('AppConfig', AppConfigSchema);
