import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const CONFIANCA = ['', 'confirmado', 'experimental', 'hipotese'];
const FUNCOES_TATICAS = ['melee', 'ranged', 'speed', 'tank', 'supply'];
const TIPOS_OFICIAIS = ['', 'supply', 'mounted', 'foot', 'ranged'];

const confiancaCampo = () => ({ type: String, enum: CONFIANCA, default: '' });

const TropaSchema = new mongoose.Schema({
  nome:      { type: String, required: true, unique: true, trim: true },
  slug:      { type: String, default: '', trim: true, index: true },
  aliases:   [{ type: String, trim: true }],
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
  imagem:    { type: String, default: '', trim: true },

  // Taxonomia legada. Mantida por compatibilidade com comparador, simulador e dados antigos.
  tipo:      { type: String, enum: ['treinavel', 'especial'], default: 'treinavel' },
  combate:   { type: String, enum: ['corpo_a_corpo', 'distancia'], default: 'corpo_a_corpo' },
  rapida:    { type: Boolean, default: false },
  categoria: { type: String, enum: ['infantaria','distancia','cavalaria','dragao','pesada','transporte','outro'], default: 'outro' },
  funcoes:   [{ type: String, enum: ['ataque','defesa','farming','suporte','equilibrada'] }],

  // Camada de engenharia de combate. Independente da taxonomia legada acima.
  // Campos numéricos-base (vida/def/atqPerto/atqDist/vel/alcance) continuam nos paths históricos.
  perfilCombate: {
    tipoOficial: { type: String, enum: TIPOS_OFICIAIS, default: '' },
    funcoesTaticas: [{ type: String, enum: FUNCOES_TATICAS }],
    tier: { type: Number, default: null, min: 1, max: 99 },
    forteContra: [{ type: String, trim: true }],
    fracoContra: [{ type: String, trim: true }],
    habilidadesEspeciais: [{ type: String, trim: true }],
    funcaoRecomendada: { type: String, default: '', trim: true },
    observacoesEstrategicas: { type: String, default: '', trim: true },
    prioridadeAlvo: { type: String, default: '', trim: true },
    fonteInformacao: { type: String, default: '', trim: true },
    confianca: confiancaCampo(),
    confiancaCampos: {
      tipoOficial: confiancaCampo(),
      funcoesTaticas: confiancaCampo(),
      tier: confiancaCampo(),
      atributos: confiancaCampo(),
      counters: confiancaCampo(),
      habilidades: confiancaCampo(),
      funcaoRecomendada: confiancaCampo(),
      observacoesEstrategicas: confiancaCampo(),
      prioridadeAlvo: confiancaCampo(),
    },
  },

  desbloqueio: {
    tipo:       { type: String, enum: ['edificio','pesquisa','evento','outro',''], default: '' },
    fonte:      { type: String, default: '', trim: true },
    nivel:      { type: Number, default: null, min: 0 },
    observacao: { type: String, default: '', trim: true },
  },
  treinamento: {
    disponivel:    { type: Boolean, default: true },
    obtencao:      { type: String, enum: ['treino','evento','outro',''], default: '' },
    dadosCompletos:{ type: Boolean, default: false },
    custos: [{
      id:         { type: String, default: '', trim: true },
      nome:       { type: String, default: '', trim: true },
      quantidade: { type: Number, default: 0, min: 0 },
    }],
    requisitos: [{
      tipo:  { type: String, enum: ['pesquisa','edificio','outro'], default: 'outro' },
      nome:  { type: String, default: '', trim: true },
      nivel: { type: Number, default: 0, min: 0 },
    }],
    populacao: { type: Number, default: 0, min: 0 },
  },
  taxonomiaVersao: { type: Number, default: 0 },
  taxonomiaCombateVersao: { type: Number, default: 0 },
  i18n:      { type: mongoose.Schema.Types.Mixed, default: {} },
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: COLLECTIONS.tropas });

TropaSchema.index({ nome: 'text', desc: 'text' });

export default mongoose.model('Tropa', TropaSchema);
