import 'dotenv/config';
import express  from 'express';
import cors     from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import authRoutes  from './routes/auth.js';
import tropaRoutes from './routes/tropas.js';
import nivelRoutes from './routes/niveis.js';
import setupRoutes from './routes/setup.js';
import itemRoutes      from './routes/itens.js';
import edificioRoutes  from './routes/edificios.js';
import dragaoRoutes    from './routes/dragoes.js';
import pesquisaRoutes  from './routes/pesquisas.js';
import reinoRoutes      from './routes/reinos.js';
import assistenteRoutes from './routes/assistente.js';
import traducoesRoutes  from './routes/traducoes.js';
import dicasRoutes      from './routes/dicas.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Middlewares ──────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'https://guiadoa.vercel.app',
  'https://guiadoa.onrender.com',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
];

app.use(cors({
  origin: (origin, cb) => {
    // Permite requests sem origin (ex: Capacitor/APK, curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// ── Rotas de API ─────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/tropas', tropaRoutes);
app.use('/api/niveis', nivelRoutes);
app.use('/api/setup',  setupRoutes);
app.use('/api/itens',     itemRoutes);
app.use('/api/edificios', edificioRoutes);
app.use('/api/dragoes',  dragaoRoutes);
app.use('/api/pesquisas', pesquisaRoutes);
app.use('/api/reinos',      reinoRoutes);
app.use('/api/assistente', assistenteRoutes);
app.use('/api/traducoes',  traducoesRoutes);
app.use('/api/dicas',      dicasRoutes);

// ── Painel Admin (HTML estático) ─────────────────────────────────────────────
app.use('/admin', express.static(join(__dirname, 'admin')));
app.get('/admin',       (_, res) => res.sendFile(join(__dirname, 'admin', 'index.html')));
app.get('/admin/setup', (_, res) => res.sendFile(join(__dirname, 'admin', 'setup.html')));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_, res) => res.json({ status: 'ok', app: 'Guia DOA API', version: '1.0.0' }));

// ── Erro global — sempre retorna JSON, nunca HTML ─────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Erro global:', err.message);
  res.status(err.status || 500).json({ erro: err.message || 'Erro interno do servidor' });
});

// ── MongoDB ──────────────────────────────────────────────────────────────────
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
      console.log(`🎮  Painel Admin:  http://localhost:${PORT}/admin`);
      console.log(`⚙️   Setup Web:    http://localhost:${PORT}/admin/setup\n`);
    });
  })
  .catch(err => {
    console.error('❌  Falha ao conectar MongoDB:', err.message);
    process.exit(1);
  });
