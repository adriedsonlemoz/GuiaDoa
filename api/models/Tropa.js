import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const TropaSchema = new mongoose.Schema({
  nome:      { type: String, required: true, unique: true, trim: true },
  poder:     { type: Number, default: 0 },
  vida:      { type: Number, default: 0 },
  def:       { type: Number, default: 0 },
  atqPerto:  { type: Number, default: 0 },
  atqDist:   { type: Number, default: 0 },
  alcance:   { type: Number, default: 0 },
  vel:       { type: Number, default: 0 },
  car:       { type: Number, default: 0 },
  gestao:    { type: Number, default: 0 },
  desc:      { type: String, default: '' },
  tipo:      { type: String, enum: ['treinavel', 'especial'], default: 'treinavel' },
  combate:   { type: String, enum: ['corpo_a_corpo', 'distancia'], default: 'corpo_a_corpo' },
  rapida:    { type: Boolean, default: false },
  categoria: { type: String, enum: ['infantaria','distancia','cavalaria','dragao','pesada','transporte','outro'], default: 'outro' },
  funcoes:   [{ type: String, enum: ['ataque','defesa','farming','suporte','equilibrada'] }],
  desbloqueio: {
    tipo:       { type: String, enum: ['edificio','pesquisa','evento','outro',''], default: '' },
    fonte:      { type: String, default: '', trim: true },
    nivel:      { type: Number, default: null, min: 0 },
    observacao: { type: String, default: '', trim: true },
  },
  taxonomiaVersao: { type: Number, default: 0 },
  i18n:      { type: mongoose.Schema.Types.Mixed, default: {} },
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.tropas });

TropaSchema.index({ nome: 'text', desc: 'text' });

export default mongoose.model('Tropa', TropaSchema);
