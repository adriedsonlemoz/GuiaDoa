import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const ReinoFusaoSchema = new mongoose.Schema({
  reinoOriginalId:{ type:Number, required:true, min:1, index:true },
  reinoParceiroId:{ type:Number, required:true, min:1, index:true },
  dataFusao:{ type:Date, required:true },
  reinoResultanteId:{ type:Number, required:true, min:1, index:true },
  observacoes:{ type:String, default:'', trim:true },
  historico:{ type:[new mongoose.Schema({
    data:{ type:Date, default:Date.now },
    descricao:{ type:String, required:true, trim:true },
  }, { _id:false })], default:[] },
  atualizadoEm:{ type:Date, default:Date.now },
}, { collection:COLLECTIONS.reinoFusoes, timestamps:{ createdAt:'criadoEm', updatedAt:false } });

ReinoFusaoSchema.index({ reinoOriginalId:1, reinoParceiroId:1, dataFusao:1 });

export default mongoose.model('ReinoFusao', ReinoFusaoSchema);
