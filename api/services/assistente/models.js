import mongoose from 'mongoose';
import { COLLECTIONS } from '../../config/database.js';

const model = (name, schema, collection) => {
  if (mongoose.models[name]) return mongoose.models[name];
  return mongoose.model(name, schema, collection);
};

const TropaSchema = new mongoose.Schema({
  nome: String, poder: Number, vida: Number, def: Number,
  atqPerto: Number, atqDist: Number, alcance: Number,
  vel: Number, car: Number, gestao: Number, desc: String,
  tipo: String, combate: String, rapida: Boolean,
}, { collection: COLLECTIONS.tropas });

const ItemSchema = new mongoose.Schema({
  nome: String, icone: String, descricao: String, onde: String,
}, { collection: COLLECTIONS.itens });

const EdificioSchema = new mongoose.Schema({
  nome: String, icone: String, tag: String, descricao: String,
  colunas: [{ key: String, label: String, tipo: String }],
  niveis: mongoose.Schema.Types.Mixed,
}, { collection: COLLECTIONS.edificios });

const DragaoSchema = new mongoose.Schema({
  nome: String, slug: String, elemento: String, emoji: String,
  emojiDragao: String, raridade: String, cor: String,
  niveis: [{
    nivel: Number, xpNecessaria: Number,
    vida: Number, defesa: Number, ataquePerto: Number, ataqueDistante: Number,
    alcance: Number, velocidade: Number,
    ataqueElemental: Number, impulsoElemental: Number, barreiraElemental: Number,
    bombardeioElemental: Number, confrontoElemental: Number,
    bloqueioElemental: Number, rupturaElemental: Number,
  }],
}, { collection: COLLECTIONS.dragoes });

const PesquisaSchema = new mongoose.Schema({
  nome: String, slug: String, icone: String, descricao: String,
  categoria: String, nivelMax: Number, ordem: Number,
  niveis: [{ nivel: Number, tempo: String }],
}, { collection: COLLECTIONS.pesquisas });

const NivelSchema = new mongoose.Schema({ nivel: Number, xp: Number }, { collection: COLLECTIONS.niveis });
const ReinoSchema = new mongoose.Schema({
  id: Number, slug: String, nome: String, fuso: String, regiao: String, idioma: String,
}, { collection: COLLECTIONS.reinos });

export async function carregarDadosAssistente() {
  const [tropas, itens, edificios, dragoes, pesquisas, niveis, reinos] = await Promise.all([
    model('AssT', TropaSchema, COLLECTIONS.tropas).find({}).lean(),
    model('AssI', ItemSchema, COLLECTIONS.itens).find({}).lean(),
    model('AssE', EdificioSchema, COLLECTIONS.edificios).find({}).lean(),
    model('AssD', DragaoSchema, COLLECTIONS.dragoes).find({}).lean(),
    model('AssP', PesquisaSchema, COLLECTIONS.pesquisas).find({}).sort({ categoria: 1, ordem: 1 }).lean(),
    model('AssN', NivelSchema, COLLECTIONS.niveis).find({}).sort({ nivel: 1 }).lean(),
    model('AssR', ReinoSchema, COLLECTIONS.reinos).find({}).sort({ id: 1 }).lean(),
  ]);
  return { tropas, itens, edificios, dragoes, pesquisas, niveis, reinos };
}
