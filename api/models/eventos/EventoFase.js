import mongoose from 'mongoose';
import EventoRecompensaSchema from './EventoRecompensa.js';

const EventoFaseSchema = new mongoose.Schema({
  codigo:{ type:String, required:true, trim:true },
  nome:{ type:String, required:true, trim:true },
  ordem:{ type:Number, default:0, min:0 },
  diaInicio:{ type:Number, default:null, min:1, max:999 },
  diaFim:{ type:Number, default:null, min:1, max:999 },
  inicioServidor:{ type:Date, default:null },
  fimServidor:{ type:Date, default:null },
  objetivo:{ type:String, default:'', trim:true },
  descricao:{ type:String, default:'', trim:true },
  observacao:{ type:String, default:'', trim:true },
  torneioId:{ type:String, default:'', trim:true },
  mecanica:{ type:String, default:'', trim:true },
  recompensas:{ type:[EventoRecompensaSchema], default:[] },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

export default EventoFaseSchema;
