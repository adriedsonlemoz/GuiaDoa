import mongoose from 'mongoose';

const NivelPesquisaSchema = new mongoose.Schema({
  nivel: { type: Number, required: true },
  tempo: { type: String, default: '' }, // ex: '1h 30m', '45m', '2d 4h'
}, { _id: false });

const PesquisaSchema = new mongoose.Schema({
  slug:      { type: String, required: true, unique: true, trim: true },
  nome:      { type: String, required: true, trim: true },
  icone:     { type: String, default: '🔬' },
  descricao: { type: String, default: '' },
  categoria: {
    type: String,
    required: true,
    enum: ['Corpo a Corpo', 'Ataque à Distância', 'Produção', 'Movimento e Construção'],
  },
  nivelMax:  { type: Number, default: 10, min: 1, max: 15 },
  ordem:     { type: Number, default: 0 },
  niveis:    [NivelPesquisaSchema],
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: 'doa_pesquisas' });

export default mongoose.model('Pesquisa', PesquisaSchema);
