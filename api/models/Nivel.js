import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/database.js';

const NivelSchema = new mongoose.Schema({
  nivel:            { type: Number, required: true, unique: true, min: 1 },
  poderNecessario:  { type: Number, default: null }, // null = ainda não confirmado
  // Compatibilidade temporária com documentos anteriores à Beta 2.32.
  xp:               { type: Number, default: undefined },
  atualizadoEm:     { type: Date, default: Date.now },
}, { collection: COLLECTIONS.niveis });

export default mongoose.model('Nivel', NivelSchema);
