import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const RelacionadosSchema = new mongoose.Schema({
  modulos:   { type: [String], default: [] },
  edificios: { type: [String], default: [] },
  tropas:    { type: [String], default: [] },
  dragoes:   { type: [String], default: [] },
  pesquisas: { type: [String], default: [] },
  reinos:    { type: [String], default: [] },
}, { _id: false });

const DicaSchema = new mongoose.Schema({
  slug:      { type: String, trim: true, lowercase: true, default: '' },
  titulo:    { type: String, required: true, trim: true },
  categoria: { type: String, required: true, trim: true }, // slug: dragoes, tropas, campanha, grodz, zyvortian
  resumo:    { type: String, default: '', trim: true },
  conteudo:  { type: String, default: '' },          // texto/markdown opcional
  tipo:      { type: String, enum: ['dica', 'guia', 'tutorial'], default: 'dica' },
  leituraMin:{ type: Number, default: 0, min: 0, max: 120 },
  relacionados: { type: RelacionadosSchema, default: () => ({}) },
  imagens:   [{ url: String, publicId: String, fonte: { type: String, enum: ['cloudinary','local'], default: 'cloudinary' } }],
  destaque:  { type: Boolean, default: false },
  ativo:     { type: Boolean, default: true },
  ordem:     { type: Number, default: 0 },
  i18n:      { type: mongoose.Schema.Types.Mixed, default: {} },
  criadoEm:  { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.dicas });

DicaSchema.index({ categoria: 1, ordem: 1 });
DicaSchema.index({ slug: 1 }, { unique: true, sparse: true, partialFilterExpression: { slug: { $gt: '' } } });

DicaSchema.pre('save', function(next) {
  this.atualizadoEm = new Date();
  next();
});

export default mongoose.model('Dica', DicaSchema);
