import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const RewardItemSchema = new mongoose.Schema({
  nome:{ type:String, required:true, trim:true },
  quantidade:{ type:Number, default:1, min:0 },
  observacao:{ type:String, default:'', trim:true },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

const RewardGroupSchema = new mongoose.Schema({
  tipo:{ type:String, enum:['individual','ranking','evento'], default:'individual' },
  requisito:{ type:Number, default:null, min:0 },
  classificacao:{ type:String, default:'', trim:true },
  itens:{ type:[RewardItemSchema], default:[] },
}, { _id:false });

const PhaseSchema = new mongoose.Schema({
  codigo:{ type:String, required:true, trim:true },
  nome:{ type:String, required:true, trim:true },
  diaInicio:{ type:Number, required:true, min:1, max:99 },
  diaFim:{ type:Number, required:true, min:1, max:99 },
  objetivo:{ type:String, default:'', trim:true },
  observacao:{ type:String, default:'', trim:true },
  recompensas:{ type:[RewardGroupSchema], default:[] },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

const OccurrenceSchema = new mongoose.Schema({
  codigo:{ type:String, required:true, trim:true },
  reinoId:{ type:Number, required:true, min:1, index:true },
  reinoNome:{ type:String, required:true, trim:true },
  fusoReino:{ type:String, default:'', trim:true },
  inicioServidor:{ type:Date, required:true },
  fimServidor:{ type:Date, required:true },
  confirmado:{ type:Boolean, default:true },
  observacao:{ type:String, default:'', trim:true },
}, { _id:false });

const EventoSchema = new mongoose.Schema({
  slug:{ type:String, required:true, unique:true, trim:true },
  nome:{ type:String, required:true, trim:true },
  resumo:{ type:String, default:'', trim:true },
  descricao:{ type:String, default:'', trim:true },
  categoria:{ type:String, default:'geral', trim:true, index:true },
  servidorFuso:{ type:String, default:'UTC', trim:true },
  horarioReset:{ type:String, default:'00:00', trim:true },
  ativo:{ type:Boolean, default:true, index:true },
  fases:{ type:[PhaseSchema], default:[] },
  recompensas:{ type:[RewardGroupSchema], default:[] },
  regras:{ type:[String], default:[] },
  ocorrencias:{ type:[OccurrenceSchema], default:[] },
  fonte:{
    tipo:{ type:String, default:'manual', trim:true },
    data:{ type:String, default:'', trim:true },
    descricao:{ type:String, default:'', trim:true },
    verificado:{ type:Boolean, default:false },
  },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
  atualizadoEm:{ type:Date, default:Date.now },
}, { collection:COLLECTIONS.eventos, timestamps:{ createdAt:'criadoEm', updatedAt:false } });

EventoSchema.index({ 'ocorrencias.reinoId':1, ativo:1 });

export default mongoose.model('Evento', EventoSchema);
