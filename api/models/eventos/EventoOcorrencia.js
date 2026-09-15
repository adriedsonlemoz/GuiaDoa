import mongoose from 'mongoose';

const EventoOcorrenciaSchema = new mongoose.Schema({
  codigo:{ type:String, required:true, trim:true },
  reinoId:{ type:Number, required:true, min:1, index:true },
  reinoNome:{ type:String, required:true, trim:true },
  fusoReino:{ type:String, default:'', trim:true },
  inicioServidor:{ type:Date, required:true },
  fimServidor:{ type:Date, required:true },
  confirmado:{ type:Boolean, default:true },
  observacao:{ type:String, default:'', trim:true },
}, { _id:false });

export default EventoOcorrenciaSchema;
