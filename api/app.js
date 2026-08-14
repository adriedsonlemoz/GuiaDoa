import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import tropaRoutes from './routes/tropas.js';
import nivelRoutes from './routes/niveis.js';
import setupRoutes from './routes/setup.js';
import itemRoutes from './routes/itens.js';
import edificioRoutes from './routes/edificios.js';
import dragaoRoutes from './routes/dragoes.js';
import pesquisaRoutes from './routes/pesquisas.js';
import reinoRoutes from './routes/reinos.js';
import assistenteRoutes from './routes/assistente.js';
import dicasRoutes from './routes/dicas.js';
import healthRoutes from './routes/health.js';
import allianceTrackerRoutes from './routes/allianceTracker.js';
import { APP_VERSION } from './version.js';
import { requestContext, padronizarRespostasDeErro, erroGlobal } from './utils/apiError.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1);

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'https://guia-doa.vercel.app',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean) : []),
];

function getRequestOrigin(req) {
  const forwardedHost = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
  const forwardedProto = (req.get('x-forwarded-proto') || req.protocol || '').split(',')[0].trim();
  if (!forwardedHost || !forwardedProto) return '';
  return `${forwardedProto}://${forwardedHost}`;
}

function corsOptions(req, cb) {
  const origin = req.get('origin');
  const selfOrigin = getRequestOrigin(req);
  const permitido = !origin || origin === selfOrigin || ALLOWED_ORIGINS.includes(origin);

  if (permitido) {
    return cb(null, {
      origin: origin || true,
      credentials: true,
    });
  }

  const err = new Error('Origem não permitida pelo CORS.');
  err.status = 403;
  return cb(err);
}

app.use(requestContext);
app.use(padronizarRespostasDeErro);
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tropas', tropaRoutes);
app.use('/api/niveis', nivelRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/itens', itemRoutes);
app.use('/api/edificios', edificioRoutes);
app.use('/api/dragoes', dragaoRoutes);
app.use('/api/pesquisas', pesquisaRoutes);
app.use('/api/reinos', reinoRoutes);
app.use('/api/assistente', assistenteRoutes);
app.use('/api/dicas', dicasRoutes);
app.use('/api/alliance-tracker', allianceTrackerRoutes);

// Assets públicos também ficam disponíveis no domínio da API para o Admin.
// Isso mantém caminhos como /assets/dragons/... válidos tanto no Vercel quanto no Render.
app.use('/assets', express.static(join(__dirname, '..', 'public', 'assets'), { maxAge: '7d' }));
app.use('/img', express.static(join(__dirname, '..', 'public', 'img'), { maxAge: '7d' }));

app.use('/admin', express.static(join(__dirname, 'admin')));
app.get('/admin', (_, res) => res.sendFile(join(__dirname, 'admin', 'index.html')));
app.get('/admin/setup', (_, res) => res.redirect(302, '/admin'));

app.get('/', (_, res) => res.json({ status: 'ok', app: 'Guia DOA API', version: APP_VERSION }));

app.use((req, res) => {
  res.status(404).json({ codigo: 'ROTA_NAO_ENCONTRADA', erro: 'Rota não encontrada.' });
});

app.use(erroGlobal);

export { ALLOWED_ORIGINS };
export default app;
