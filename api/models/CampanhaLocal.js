import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const TropaSchema = new mongoose.Schema({
  nome:{ type:String, required:true, trim:true },
  quantidade:{ type:Number, required:true, min:0 },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

const RecursoSchema = new mongoose.Schema({
  tipo:{ type:String, required:true, trim:true },
  valor:{ type:Number, default:null, min:0 },
  exibicao:{ type:String, required:true, trim:true },
  exato:{ type:Boolean, default:true },
}, { _id:false });

const RecompensaSchema = new mongoose.Schema({
  codigo:{ type:String, required:true, trim:true },
  simbolo:{ type:String, default:'', trim:true },
  nome:{ type:String, default:'', trim:true },
  quantidade:{ type:Number, default:null, min:0 },
  nomeConfirmado:{ type:Boolean, default:false },
  observacao:{ type:String, default:'', trim:true },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

const CampoSchema = new mongoose.Schema({
  recursoPrincipal:{ type:String, default:'', trim:true },
  producaoHora:{ type:Number, default:null, min:0 },
  producaoExibicao:{ type:String, default:'', trim:true },
}, { _id:false });

const EstrategiaSchema = new mongoose.Schema({
  publicada:{ type:Boolean, default:false },
  titulo:{ type:String, default:'', trim:true },
  resumo:{ type:String, default:'', trim:true },
  passos:{ type:[String], default:[] },
  requisitos:{ type:[String], default:[] },
  observacoes:{ type:String, default:'', trim:true },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });


const GuiaApoioSchema = new mongoose.Schema({
  nome:{ type:String, required:true, trim:true },
  quantidade:{ type:Number, required:true, min:0 },
  alternativa:{ type:String, default:'', trim:true },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

const GuiaPesquisaSchema = new mongoose.Schema({
  nome:{ type:String, required:true, trim:true },
  nivel:{ type:Number, required:true, min:0, max:99 },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

const GuiaAtaqueSchema = new mongoose.Schema({
  codigo:{ type:String, required:true, trim:true },
  titulo:{ type:String, required:true, trim:true },
  resumo:{ type:String, default:'', trim:true },
  status:{ type:String, enum:['validacao','confirmado'], default:'validacao' },
  tropaPrincipal:{ type:String, default:'', trim:true },
  quantidade:{ type:Number, default:null, min:0 },
  apoios:{ type:[GuiaApoioSchema], default:[] },
  pesquisas:{ type:[GuiaPesquisaSchema], default:[] },
  passos:{ type:[String], default:[] },
  observacoes:{ type:String, default:'', trim:true },
  fonte:{
    tipo:{ type:String, default:'manual', trim:true },
    url:{ type:String, default:'', trim:true },
    descricao:{ type:String, default:'', trim:true },
  },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
}, { _id:false });

const CampanhaLocalSchema = new mongoose.Schema({
  slug:{ type:String, required:true, unique:true, trim:true },
  categoria:{ type:String, required:true, enum:['antropos','campos','zyrvorthian','grodz'], index:true },
  subtipo:{ type:String, default:'', trim:true, index:true },
  nivel:{ type:Number, default:null, min:0, index:true },
  nome:{ type:String, required:true, trim:true },
  ordem:{ type:Number, default:0 },
  ativo:{ type:Boolean, default:true, index:true },
  tropas:{ type:[TropaSchema], default:[] },
  recursos:{ type:[RecursoSchema], default:[] },
  recompensas:{ type:[RecompensaSchema], default:[] },
  campo:{ type:CampoSchema, default:() => ({}) },
  estrategia:{ type:EstrategiaSchema, default:() => ({}) },
  guiasAtaque:{ type:[GuiaAtaqueSchema], default:[] },
  fonte:{
    tipo:{ type:String, default:'manual' },
    data:{ type:String, default:'' },
    descricao:{ type:String, default:'' },
    verificado:{ type:Boolean, default:false },
  },
  i18n:{ type:mongoose.Schema.Types.Mixed, default:{} },
  atualizadoEm:{ type:Date, default:Date.now },
}, { collection:COLLECTIONS.campanhaLocais, timestamps:{ createdAt:'criadoEm', updatedAt:false } });

// O subtipo faz parte da identidade do nível: Savana Nv. 6 e Floresta Nv. 6
// precisam coexistir na mesma coleção. Para Antropos, subtipo permanece vazio.
CampanhaLocalSchema.index(
  { categoria:1, subtipo:1, nivel:1 },
  { unique:true, partialFilterExpression:{ nivel:{ $type:'number' } }, name:'categoria_1_subtipo_1_nivel_1' },
);

export default mongoose.model('CampanhaLocal', CampanhaLocalSchema);
