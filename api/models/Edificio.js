import mongoose from 'mongoose';

// Cada coluna tem: key (interno), label (exibição), tipo ('text' | 'number')
const ColunaSchema = new mongoose.Schema({
  key:   { type: String, required: true },
  label: { type: String, required: true },
  tipo:  { type: String, enum: ['text', 'number'], default: 'number' },
}, { _id: false });

const EdificioSchema = new mongoose.Schema({
  slug:      { type: String, required: true, unique: true, trim: true }, // ex: 'Casa'
  nome:      { type: String, required: true, trim: true },
  icone:     { type: String, default: '🏗️' },
  tag:       { type: String, default: '' },    // ex: 'Pop.', 'Alim.'
  descricao: { type: String, default: '' },
  ordem:     { type: Number, default: 0 },     // ordem no seletor
  colunas:   [ColunaSchema],                   // define as colunas da tabela de níveis
  niveis:    { type: mongoose.Schema.Types.Mixed, default: [] }, // [{nivel:1, pop:5, prodHora:100, ...}]
  atualizadoEm: { type: Date, default: Date.now },
}, { collection: 'doa_edificios' });

export default mongoose.model('Edificio', EdificioSchema);
