import mongoose from 'mongoose';

/**
 * Modelo de tradução
 *
 * chave    → identificador único ex: "home.botao.torneios"
 * locale   → idioma ex: "en-US"
 * textoPT  → texto original em PT-BR (referência imutável)
 * traducao → texto traduzido no locale alvo
 * status   → rascunho (gerado por API) | revisado | ativo (exibido no app)
 * fonte    → manual | mymemory | libretranslate (valor legado, mantido por compatibilidade)
 */
const TraducaoSchema = new mongoose.Schema({
  chave:    { type: String, required: true, trim: true },
  locale:   { type: String, required: true, trim: true, default: 'en-US' },
  textoPT:  { type: String, required: true },
  traducao: { type: String, default: '' },
  status:   { type: String, enum: ['rascunho', 'revisado', 'ativo'], default: 'rascunho' },
  fonte:    { type: String, enum: ['manual', 'mymemory', 'libretranslate'], default: 'manual' },
  updatedAt:{ type: Date, default: Date.now },
}, { collection: 'doa_traducoes' });

// Índice composto — chave + locale é único
TraducaoSchema.index({ chave: 1, locale: 1 }, { unique: true });

TraducaoSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Traducao', TraducaoSchema);
