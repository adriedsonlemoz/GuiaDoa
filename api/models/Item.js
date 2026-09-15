import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const PrecoSchema = new mongoose.Schema({
  moeda: { type:String, enum:['rubis'], default:'rubis' },
  valor: { type:Number, default:null, min:0 },
  valorOriginal: { type:Number, default:null, min:0 },
}, { _id:false });

const EfeitoSchema = new mongoose.Schema({
  tipo: { type:String, default:'', trim:true },
  valor: { type:Number, default:null },
  unidade: { type:String, default:'', trim:true },
}, { _id:false });

const ConteudoItemSchema = new mongoose.Schema({
  itemSlug: { type:String, default:'', trim:true, lowercase:true },
  quantidade: { type:Number, default:1, min:0 },
  observacao: { type:String, default:'', trim:true },
}, { _id:false });

const ItemSchema = new mongoose.Schema({
  slug:       { type:String, default:'', trim:true, lowercase:true },
  nome:       { type:String, required:true, unique:true, trim:true },
  icone:      { type:String, default:'🎒' },
  imagem:     { type:String, default:'', trim:true },

  // `categoria` continua livre por compatibilidade. `grupo` controla as abas públicas.
  categoria:  { type:String, default:'Geral', trim:true },
  grupo:      { type:String, enum:['recursos','aceleracoes','geral','arcas'], default:'geral' },
  destaque:   { type:Boolean, default:false },
  raridade:   { type:String, default:'', trim:true },
  quantidade: { type:Number, default:null, min:0 },

  preco:      { type:PrecoSchema, default:() => ({}) },
  efeito:     { type:EfeitoSchema, default:() => ({}) },
  conteudo:   { type:[ConteudoItemSchema], default:[] },
  conteudoObservacao: { type:String, default:'', trim:true },
  tags:       { type:[String], default:[] },

  descricao:  { type:String, default:'' },
  origem:     { type:String, default:'' },
  uso:        { type:String, default:'' },
  limites:    { type:String, default:'' },
  onde:       { type:String, default:'' },
  ordem:      { type:Number, default:999 },
  i18n:       { type:mongoose.Schema.Types.Mixed, default:{} },
  criadoEm:     { type:Date, default:Date.now },
  atualizadoEm: { type:Date, default:Date.now },
}, { collection:COLLECTIONS.itens });

ItemSchema.index({ slug:1 }, { unique:true, sparse:true, partialFilterExpression:{ slug:{ $gt:'' } } });
ItemSchema.index({ grupo:1, ordem:1, nome:1 });
ItemSchema.index({ destaque:-1, grupo:1, ordem:1 });
ItemSchema.index({ nome:'text', descricao:'text', categoria:'text', origem:'text', uso:'text', tags:'text' });

ItemSchema.pre('save', function(next) {
  this.atualizadoEm = new Date();
  next();
});

export default mongoose.model('Item', ItemSchema);
