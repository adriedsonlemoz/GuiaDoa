import mongoose from 'mongoose';

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
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: 'doa_tropas' });

TropaSchema.index({ nome: 'text', desc: 'text' });

export default mongoose.model('Tropa', TropaSchema);
