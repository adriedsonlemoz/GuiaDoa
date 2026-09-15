import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

// Cada nível do dragão tem um snapshot de todos os atributos
const NivelDragaoSchema = new mongoose.Schema({
  nivel:               { type: Number, required: true },
  xpNecessaria:        { type: Number, default: null },   // XP para chegar neste nível
  // Atributos base
  vida:                { type: Number, default: 0 },
  defesa:              { type: Number, default: 0 },
  ataquePerto:         { type: Number, default: 0 },
  ataqueDistante:      { type: Number, default: 0 },
  alcance:             { type: Number, default: 0 },
  velocidade:          { type: Number, default: 0 },
  // Atributos elementais
  ataqueElemental:     { type: Number, default: 0 },
  impulsoElemental:    { type: Number, default: 0 },
  barreiraElemental:   { type: Number, default: 0 },
  bombardeioElemental: { type: Number, default: 0 },
  confrontoElemental:  { type: Number, default: 0 },
  bloqueioElemental:   { type: Number, default: 0 },
  rupturaElemental:    { type: Number, default: 0 },
}, { _id: false });

const DragaoSchema = new mongoose.Schema({
  // Identidade (espelhada do frontend para facilitar a busca)
  slug:          { type: String, required: true, unique: true, trim: true },
  nome:          { type: String, required: true, trim: true },
  ordem:         { type: Number, default: 999, index: true },
  aliases:       { type: [String], default: [] },
  elemento:      { type: String, default: '' },
  emoji:         { type: String, default: '🔥' },
  emojiDragao:   { type: String, default: '🐉' },
  imagem:        { type: String, default: '' },
  cor:           { type: String, default: '#C8A84A' },
  raridade:      { type: String, default: 'Comum' },
  corSecundaria: { type: String, default: '' },
  corFundo:      { type: String, default: '' },
  corRaridade:   { type: String, default: '' },
  bonusMarcha:   { type: String, default: '' },
  atributo:      { type: String, default: '' },
  porcentagemPorNivel: { type: Number, default: 0 },
  tropasAfetadas:{ type: [String], default: [] },
  descricao:     { type: String, default: '' },
  obtencao:      { type: mongoose.Schema.Types.Mixed, default: {} },
  nivelDragao:   { type: mongoose.Schema.Types.Mixed, default: {} },
  atributosBase: { type: mongoose.Schema.Types.Mixed, default: {} },
  itensAlimentacao: { type: [mongoose.Schema.Types.Mixed], default: [] },
  habilidades:   { type: [mongoose.Schema.Types.Mixed], default: [] },
  dicas:         { type: [String], default: [] },
  i18n:      { type: mongoose.Schema.Types.Mixed, default: {} },

  // Progressão de níveis (array ordenado por nivel)
  niveis:        { type: [NivelDragaoSchema], default: [] },

  atualizadoEm: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.dragoes });

export default mongoose.model('Dragao', DragaoSchema);
