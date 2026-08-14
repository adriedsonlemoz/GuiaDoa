import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { COLLECTION_PREFIX, mongoConnectOptions } from './config/database.js';
import { migrarColecoesLegadas } from './utils/migrateLegacyCollections.js';
import { executarMigracaoAutomatica } from './services/autoMigration.js';
import { executarMigracoesConteudo } from './services/contentMigrations.js';

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

    const migracao = await executarMigracaoAutomatica();
    if (migracao.ok) {
      if (migracao.ignorada) {
        console.log('📦  Migração auto: já aplicada nesta versão — MongoDB preservado');
      } else {
        const inseridos = Object.values(migracao.relatorio).reduce((n, r) => n + (r.inseridos || 0), 0);
        const completados = Object.values(migracao.relatorio).reduce((n, r) => n + (r.completados || 0), 0);
        console.log(`📦  Migração auto: ${inseridos} inserido(s), ${completados} completado(s)`);
      }
      console.log(`👤  Primeiro admin: ${migracao.usuarioNecessario ? 'ainda precisa ser criado' : 'configurado'}`);
    } else {
      console.error(`⚠️   Migração automática falhou: ${migracao.erro}`);
    }

    const conteudo = await executarMigracoesConteudo();
    if (conteudo.ok && !conteudo.ignorada) {
      console.log(`📚  Conteúdo:      ${conteudo.inseridas || 0} dica(s), ${conteudo.tropasAtualizadas || 0} tropa(s) classificadas, ${conteudo.campanhaInseridas || 0} local(is) PvE inserido(s)`);
    } else if (!conteudo.ok) {
      console.error(`⚠️   Migração de conteúdo falhou: ${conteudo.erro}`);
    }

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🛡️  API rodando em http://localhost:${PORT}`);
      console.log(`❤️   Health:       http://localhost:${PORT}/api/health`);
      console.log(`🎮  Painel Admin:  http://localhost:${PORT}/admin`);
      console.log(`🧭  Primeiro acesso: frontend do GUIA DOA\n`);
    });
  })
  .catch(err => {
    console.error('❌  Falha ao conectar MongoDB:', err.message);
    process.exit(1);
  });
