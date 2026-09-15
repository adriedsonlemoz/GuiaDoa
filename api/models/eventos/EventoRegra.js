import mongoose from 'mongoose';

const EventoRegraSchema = new mongoose.Schema({
  id:{ type:String, required:true, trim:true },
  ordem:{ type:Number, default:0, min:0 },
  texto:{ type:String, required:true, trim:true },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

export default EventoRegraSchema;
