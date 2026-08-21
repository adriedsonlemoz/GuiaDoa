import mongoose from 'mongoose';

const EventoRecompensaItemSchema = new mongoose.Schema({
  id:{ type:String, default:'', trim:true },
  nome:{ type:String, required:true, trim:true },
  quantidade:{ type:Number, default:1, min:0 },
  observacao:{ type:String, default:'', trim:true },
  tipoReferencia:{ type:String, enum:['','tropa','item','dragao','edificio','pesquisa'], default:'' },
  referenciaSlug:{ type:String, default:'', trim:true },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

export default EventoRecompensaItemSchema;
