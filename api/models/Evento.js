import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';
import EventoFaseSchema from './eventos/EventoFase.js';
import EventoOcorrenciaSchema from './eventos/EventoOcorrencia.js';
import EventoRegraSchema from './eventos/EventoRegra.js';
import EventoRecompensaSchema from './eventos/EventoRecompensa.js';

const EventoSchema = new mongoose.Schema({
  slug:{ type:String, required:true, unique:true, trim:true },
  nome:{ type:String, required:true, trim:true },
  resumo:{ type:String, default:'', trim:true },
  descricao:{ type:String, default:'', trim:true },
  imagem:{ type:String, default:'', trim:true },
  categoria:{ type:String, default:'geral', trim:true, index:true },
  servidorFuso:{ type:String, default:'UTC', trim:true },
  horarioReset:{ type:String, default:'00:00', trim:true },
  inicioServidor:{ type:Date, default:null },
  fimServidor:{ type:Date, default:null },
  ativo:{ type:Boolean, default:true, index:true },
  fases:{ type:[EventoFaseSchema], default:[] },
  recompensas:{ type:[EventoRecompensaSchema], default:[] },
  regras:{ type:[EventoRegraSchema], default:[] },
  ocorrencias:{ type:[EventoOcorrenciaSchema], default:[] },
  historico:{ type:[new mongoose.Schema({
    data:{ type:Date, default:Date.now },
    tipo:{ type:String, default:'atualizacao', trim:true },
    descricao:{ type:String, default:'', trim:true },
  }, { _id:false })], default:[] },
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
EventoSchema.index({ fimServidor:1, ativo:1 });

export default mongoose.model('Evento', EventoSchema);
