import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { COLLECTION_PREFIX, mongoConnectOptions } from './config/database.js';
import { migrarColecoesLegadas } from './utils/migrateLegacyCollections.js';
import { garantirNovosReinos } from './utils/seedOfficialRealms.js';
import Reino from './models/Reino.js';

if (!process.env.MONGO_URI) {
  console.error('❌  MONGO_URI não definida. Configure a variável de ambiente no Render.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, mongoConnectOptions())
  .then(async () => {
    console.log('\n✅  MongoDB conectado');
    console.log(`🗄️   Banco:         ${mongoose.connection.name}`);
    console.log(`🏷️   Coleções:      ${COLLECTION_PREFIX}*`);

    if (String(process.env.MONGO_MIGRATE_LEGACY_COLLECTIONS || '').toLowerCase() === 'true') {
      const migracao = await migrarColecoesLegadas(mongoose.connection.db);
      console.log(`🔄  Migração:      ${migracao.migradas.length} coleção(ões) migrada(s)`);
    }

    const reinos = await garantirNovosReinos({ model: Reino });
    console.log(`🌍  Novos reinos:  ${reinos.inseridos} inserido(s), ${reinos.atualizados} atualizado(s)`);
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🛡️  API rodando em http://localhost:${PORT}`);
      console.log(`❤️   Health:       http://localhost:${PORT}/api/health`);
      console.log(`🎮  Painel Admin:  http://localhost:${PORT}/admin`);
      console.log(`⚙️   Setup Web:    http://localhost:${PORT}/admin/setup\n`);
    });
  })
  .catch(err => {
    console.error('❌  Falha ao conectar MongoDB:', err.message);
    process.exit(1);
  });
