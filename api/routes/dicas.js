import express        from 'express';
import multer         from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier    from 'streamifier';
import Dica           from '../models/Dica.js';
import CategoriaDica  from '../models/CategoriaDica.js';
import { autenticar } from '../middleware/auth.js';
import { executarUploadLote } from '../utils/cloudinaryBatch.js';
import { sanitizeContentI18n } from '../utils/contentI18n.js';

const router = express.Router();
const I18N_DICA_FIELDS = ['titulo', 'resumo', 'conteudo'];
const MODULOS_DICA = new Set(['ilhas', 'edificios', 'tropas', 'dragoes', 'pesquisas', 'reinos', 'itens', 'niveis', 'torneios']);

function slugifyDica(texto) {
  return String(texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function sanitizeRefs(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(v => String(v || '').trim()).filter(Boolean))].slice(0, 40);
}

function sanitizeRelacionados(input = {}) {
  return {
    modulos: sanitizeRefs(input.modulos).filter(v => MODULOS_DICA.has(v)),
    edificios: sanitizeRefs(input.edificios),
    tropas: sanitizeRefs(input.tropas),
    dragoes: sanitizeRefs(input.dragoes),
    pesquisas: sanitizeRefs(input.pesquisas),
    reinos: sanitizeRefs(input.reinos),
  };
}

function sanitizeDicaBody(input = {}, { partial = false } = {}) {
  const out = {};
  const copy = (key, fn = v => v) => { if (!partial || key in input) out[key] = fn(input[key]); };
  copy('titulo', v => String(v || '').trim());
  copy('slug', v => slugifyDica(v));
  copy('categoria', v => String(v || '').trim());
  copy('resumo', v => String(v || '').trim());
  copy('conteudo', v => String(v || ''));
  copy('tipo', v => ['dica','guia','tutorial'].includes(v) ? v : 'dica');
  copy('leituraMin', v => Math.max(0, Math.min(120, Number(v) || 0)));
  copy('destaque', Boolean);
  copy('ativo', Boolean);
  copy('ordem', v => Number(v) || 0);
  copy('relacionados', sanitizeRelacionados);
  if (!partial || 'i18n' in input) out.i18n = sanitizeContentI18n(input.i18n, I18N_DICA_FIELDS);
  return out;
}
const I18N_CAT_FIELDS = ['label'];

// ─── Cloudinary config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer (memória temporária — persistência somente no Cloudinary) ─────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024, files: 10, fields: 20, fieldNestingDepth: 2 }, // 10 MB por imagem
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
  },
});

// ─── Helper: upload para Cloudinary via stream ────────────────────────────────
function uploadParaCloudinary(buffer, pasta = 'guiadoa/dicas') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: pasta, resource_type: 'image' },
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ─── Categorias padrão (seed) ─────────────────────────────────────────────────


// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIAS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/dicas/categorias — lista (público)
router.get('/categorias', async (req, res) => {
  try {
    const cats = await CategoriaDica.find({ ativo: true }).sort({ ordem: 1, label: 1 });
    res.json(cats);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// GET /api/dicas/categorias/todas — admin
router.get('/categorias/todas', autenticar, async (req, res) => {
  try {
    const cats = await CategoriaDica.find().sort({ ordem: 1, label: 1 });
    res.json(cats);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// POST /api/dicas/categorias — cria nova categoria
router.post('/categorias', autenticar, async (req, res) => {
  try {
    const { slug, label, icon, ordem, i18n } = req.body;
    if (!slug || !label) return res.status(400).json({ erro: 'slug e label são obrigatórios' });
    const cat = await CategoriaDica.create({ slug, label, icon: icon || '📖', ordem: ordem || 0, i18n: sanitizeContentI18n(i18n, I18N_CAT_FIELDS) });
    res.status(201).json(cat);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ erro: 'Categoria já existe' });
    res.status(500).json({ erro: e.message });
  }
});

// PATCH /api/dicas/categorias/:id
router.patch('/categorias/:id', autenticar, async (req, res) => {
  try {
    const body = { ...req.body };
    if ('i18n' in body) body.i18n = sanitizeContentI18n(body.i18n, I18N_CAT_FIELDS);
    const cat = await CategoriaDica.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!cat) return res.status(404).json({ erro: 'Não encontrada' });
    res.json(cat);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// DELETE /api/dicas/categorias/:id
router.delete('/categorias/:id', autenticar, async (req, res) => {
  try {
    await CategoriaDica.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// DICAS / TUTORIAIS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/dicas?categoria=dragoes — público, lista ativas
router.get('/', async (req, res) => {
  try {
    const filter = { ativo: true };
    if (req.query.categoria) filter.categoria = req.query.categoria;
    if (req.query.tropa) filter['relacionados.tropas'] = String(req.query.tropa).trim();
    const dicas = await Dica.find(filter).sort({ destaque: -1, ordem: 1, criadoEm: -1 });
    res.json(dicas);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// GET /api/dicas/admin — admin, lista todas
router.get('/admin', autenticar, async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoria) filter.categoria = req.query.categoria;
    const dicas = await Dica.find(filter).sort({ categoria: 1, ordem: 1, criadoEm: -1 });
    res.json(dicas);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// GET /api/dicas/:id
router.get('/:id', async (req, res) => {
  try {
    const dica = await Dica.findOne({ _id: req.params.id, ativo: true });
    if (!dica) return res.status(404).json({ erro: 'Não encontrada' });
    res.json(dica);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// POST /api/dicas — cria dica (sem imagens ainda)
router.post('/', autenticar, async (req, res) => {
  try {
    const body = sanitizeDicaBody(req.body);
    if (!('ativo' in req.body)) delete body.ativo;
    if (!('destaque' in req.body)) delete body.destaque;
    if (!('ordem' in req.body)) delete body.ordem;
    if (!body.titulo || !body.categoria) return res.status(400).json({ erro: 'título e categoria são obrigatórios' });
    if (!body.slug) body.slug = slugifyDica(body.titulo);
    const dica = await Dica.create(body);
    res.status(201).json(dica);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ erro: 'Já existe uma dica com esse identificador.' });
    res.status(500).json({ erro: e.message });
  }
});

// PATCH /api/dicas/:id — atualiza dados (sem imagens)
router.patch('/:id', autenticar, async (req, res) => {
  try {
    const body = sanitizeDicaBody(req.body, { partial: true });
    const dica = await Dica.findByIdAndUpdate(
      req.params.id,
      { ...body, atualizadoEm: new Date() },
      { new: true }
    );
    if (!dica) return res.status(404).json({ erro: 'Não encontrada' });
    res.json(dica);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ erro: 'Já existe uma dica com esse identificador.' });
    res.status(500).json({ erro: e.message });
  }
});

// DELETE /api/dicas/:id
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const dica = await Dica.findById(req.params.id);
    if (!dica) return res.status(404).json({ erro: 'Não encontrada' });
    // Remove imagens do Cloudinary
    for (const img of dica.imagens) {
      if (img.publicId && img.fonte === 'cloudinary') {
        await cloudinary.uploader.destroy(img.publicId).catch(() => {});
      }
    }
    await dica.deleteOne();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// ─── Upload de imagens ────────────────────────────────────────────────────────

// POST /api/dicas/:id/imagens — Cloudinary (padrão)
router.post('/:id/imagens', autenticar, upload.array('imagens', 10), async (req, res) => {
  try {
    const dica = await Dica.findById(req.params.id);
    if (!dica) return res.status(404).json({ erro: 'Não encontrada' });
    if (!req.files?.length) return res.status(400).json({ erro: 'Nenhuma imagem enviada' });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ erro: 'Cloudinary não configurado. O upload foi cancelado sem salvar imagens no banco.' });
    }

    let novas;
    try {
      novas = await executarUploadLote(req.files, {
        upload: (file) => uploadParaCloudinary(file.buffer),
        destroy: (publicId) => cloudinary.uploader.destroy(publicId),
      });
    } catch (uploadErr) {
      console.error('[dicas] upload Cloudinary:', uploadErr.message);
      return res.status(502).json({
        codigo: 'CLOUDINARY_UPLOAD_FAILED',
        erro: 'Falha ao enviar imagens ao Cloudinary. Nenhuma imagem foi salva.',
      });
    }

    dica.imagens.push(...novas);
    dica.atualizadoEm = new Date();
    await dica.save();
    res.json({ ok: true, adicionadas: novas.length, imagens: dica.imagens });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// DELETE /api/dicas/:id/imagens/:publicId — remove imagem
router.delete('/:id/imagens/:imgIndex', autenticar, async (req, res) => {
  try {
    const dica = await Dica.findById(req.params.id);
    if (!dica) return res.status(404).json({ erro: 'Não encontrada' });
    const idx = parseInt(req.params.imgIndex);
    const img = dica.imagens[idx];
    if (!img) return res.status(404).json({ erro: 'Imagem não encontrada' });

    if (img.publicId && img.fonte === 'cloudinary') {
      await cloudinary.uploader.destroy(img.publicId).catch(() => {});
    }
    dica.imagens.splice(idx, 1);
    await dica.save();
    res.json({ ok: true, imagens: dica.imagens });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

export default router;
