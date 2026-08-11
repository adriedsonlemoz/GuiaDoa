import mongoose from 'mongoose';

const DicaSchema = new mongoose.Schema({
  titulo:    { type: String, required: true, trim: true },
  categoria: { type: String, required: true, trim: true }, // slug: dragoes, tropas, campanha, grodz, zyvortian
  conteudo:  { type: String, default: '' },          // texto/markdown opcional
  imagens:   [{ url: String, publicId: String, fonte: { type: String, enum: ['cloudinary','local'], default: 'cloudinary' } }],
  destaque:  { type: Boolean, default: false },
  ativo:     { type: Boolean, default: true },
  ordem:     { type: Number, default: 0 },
  criadoEm:  { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: 'doa_dicas' });

DicaSchema.index({ categoria: 1, ordem: 1 });

DicaSchema.pre('save', function(next) {
  this.atualizadoEm = new Date();
  next();
});

export default mongoose.model('Dica', DicaSchema);
