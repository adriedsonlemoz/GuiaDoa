import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

if (!process.env.MONGO_URI) {
  console.error('❌  MONGO_URI não definida. Configure a variável de ambiente no Render.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('\n✅  MongoDB conectado');
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
