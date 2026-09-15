import mongoose from 'mongoose';
import EventoRecompensaItemSchema from './EventoRecompensaItem.js';

const EventoRecompensaSchema = new mongoose.Schema({
  id:{ type:String, default:'', trim:true },
  tipo:{ type:String, enum:['individual','ranking','evento'], default:'individual' },
  ordem:{ type:Number, default:0, min:0 },
  requisito:{ type:Number, default:null, min:0 },
  classificacao:{ type:String, default:'', trim:true },
  posicaoInicio:{ type:Number, default:null, min:1, max:9999 },
  posicaoFim:{ type:Number, default:null, min:1, max:9999 },
  titulo:{ type:String, default:'', trim:true },
  itens:{ type:[EventoRecompensaItemSchema], default:[] },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

export default EventoRecompensaSchema;
