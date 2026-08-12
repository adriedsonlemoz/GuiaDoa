import { Router } from 'express';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { autenticar, exigirAdmin } from '../middleware/auth.js';
import { APP_VERSION } from '../version.js';

const router = Router();
const iniciouEm = Date.now();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const mongoEstado = () => {
  const mapa = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  const readyState = mongoose.connection.readyState;
  return {
    status: readyState === 1 ? 'ok' : readyState === 2 ? 'conectando' : 'indisponivel',
    estado: mapa[readyState] || 'desconhecido',
  };
};

const configuradoCloudinary = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const timeout = (ms) => new Promise((_, reject) => {
  const id = setTimeout(() => reject(new Error('timeout')), ms);
  id.unref?.();
});

async function verificarCloudinary() {
  if (!configuradoCloudinary()) return { status: 'nao_configurado' };
  try {
    await Promise.race([cloudinary.api.ping(), timeout(4500)]);
    return { status: 'ok' };
  } catch {
    return { status: 'indisponivel' };
  }
}

async function verificarGroq() {
  if (!process.env.GROQ_API_KEY) return { status: 'nao_configurado' };
  try {
    const r = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      signal: AbortSignal.timeout(4500),
    });
    return { status: r.ok ? 'ok' : 'indisponivel' };
  } catch {
    return { status: 'indisponivel' };
  }
}

function baseHealth() {
  const mongo = mongoEstado();
  const cloudinaryStatus = configuradoCloudinary() ? 'configurado' : 'nao_configurado';
  const groqStatus = process.env.GROQ_API_KEY ? 'configurado' : 'nao_configurado';
  return {
    status: mongo.status === 'ok' ? 'ok' : 'degradado',
    app: 'Guia DOA API',
    version: APP_VERSION,
    ambiente: process.env.NODE_ENV || 'development',
    uptimeSegundos: Math.floor((Date.now() - iniciouEm) / 1000),
    servicos: {
      api: { status: 'ok' },
      mongodb: mongo,
      cloudinary: { status: cloudinaryStatus },
      groq: { status: groqStatus },
    },
  };
}

router.get('/', (_req, res) => {
  res.locals.skipErrorEnvelope = true;
  const data = baseHealth();
  res.status(data.status === 'ok' ? 200 : 503).json(data);
});

router.get('/deep', autenticar, exigirAdmin, async (_req, res) => {
  res.locals.skipErrorEnvelope = true;
  const base = baseHealth();
  const [cloudinaryCheck, groqCheck] = await Promise.all([
    verificarCloudinary(),
    verificarGroq(),
  ]);
  base.servicos.cloudinary = cloudinaryCheck;
  base.servicos.groq = groqCheck;
  const criticoOk = base.servicos.mongodb.status === 'ok';
  const externosOk = [cloudinaryCheck, groqCheck].every(s => ['ok', 'nao_configurado'].includes(s.status));
  base.status = criticoOk && externosOk ? 'ok' : 'degradado';
  res.status(base.status === 'ok' ? 200 : 503).json(base);
});

export { baseHealth, mongoEstado };
export default router;
