import 'dotenv/config';
import mongoose from 'mongoose';
import { COLLECTION_PREFIX, mongoConnectOptions } from '../config/database.js';
import { migrarColecoesLegadas } from '../utils/migrateLegacyCollections.js';

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI não definida.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI, mongoConnectOptions());
  console.log(`MongoDB: ${mongoose.connection.name}`);
  console.log(`Prefixo atual: ${COLLECTION_PREFIX}`);
  const resultado = await migrarColecoesLegadas(mongoose.connection.db);
  console.log(`\nMigradas: ${resultado.migradas.length}`);
  console.log(`Conflitos: ${resultado.conflitos.length}`);
  if (resultado.conflitos.length) {
    console.log('Nenhuma coleção existente foi sobrescrita.');
  }
} catch (err) {
  console.error('❌ Falha na migração:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
