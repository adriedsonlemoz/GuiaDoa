import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const ReinoSchema = new mongoose.Schema({
  id:{ type:Number, required:true, unique:true },
  slug:{ type:String, required:true, unique:true, trim:true },
  nome:{ type:String, required:true, trim:true },
  status:{ type:String, default:'', trim:true },
  aberturaEm:{ type:Date, default:null },
  fuso:{ type:String, default:'', trim:true },
  tipoEspecial:{ type:String, enum:['','hardcore','idade_dragao'], default:'', trim:true },
  horarios:{
    torneiosFim:{ type:String, default:'', trim:true },
    zyrvorthian:{ type:String, default:'', trim:true },
    batalhaDragao:{ type:String, default:'', trim:true },
  },
  historico:{
    status:{ type:String, default:'', trim:true },
    observacoes:{ type:String, default:'', trim:true },
  },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
  atualizadoEm:{ type:Date, default:Date.now },
}, { collection:COLLECTIONS.reinos });

ReinoSchema.index({ aberturaEm:-1, id:-1 });

export default mongoose.model('Reino', ReinoSchema);
