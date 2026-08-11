import express        from 'express';
import multer         from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier    from 'streamifier';
import Dica           from '../models/Dica.js';
import CategoriaDica  from '../models/CategoriaDica.js';
import { autenticar } from '../middleware/auth.js';

const router = express.Router();

// ─── Cloudinary config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer (memória — envia para Cloudinary ou salva base64) ─────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
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
const CATS_PADRAO = [
  { slug:'dragoes',   label:'Dragões',   icon:'🐉', ordem:0 },
  { slug:'tropas',    label:'Tropas',    icon:'⚔️',  ordem:1 },
  { slug:'campanha',  label:'Campanha',  icon:'🗺️',  ordem:2 },
  { slug:'grodz',     label:'Grodz',     icon:'🏰', ordem:3 },
  { slug:'zyvortian', label:'Zyvortian', icon:'👽', ordem:4 },
];

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
    const { slug, label, icon, ordem } = req.body;
    if (!slug || !label) return res.status(400).json({ erro: 'slug e label são obrigatórios' });
    const cat = await CategoriaDica.create({ slug, label, icon: icon || '📖', ordem: ordem || 0 });
    res.status(201).json(cat);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ erro: 'Categoria já existe' });
    res.status(500).json({ erro: e.message });
  }
});

// PATCH /api/dicas/categorias/:id
router.patch('/categorias/:id', autenticar, async (req, res) => {
  try {
    const cat = await CategoriaDica.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

// POST /api/dicas/categorias/seed — insere as categorias padrão
router.post('/categorias/seed', autenticar, async (req, res) => {
  try {
    let inseridas = 0, existentes = 0;
    for (const c of CATS_PADRAO) {
      const existe = await CategoriaDica.findOne({ slug: c.slug });
      if (!existe) { await CategoriaDica.create(c); inseridas++; }
      else existentes++;
    }
    res.json({ ok: true, inseridas, existentes });
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
    const dica = await Dica.findById(req.params.id);
    if (!dica) return res.status(404).json({ erro: 'Não encontrada' });
    res.json(dica);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// POST /api/dicas — cria dica (sem imagens ainda)
router.post('/', autenticar, async (req, res) => {
  try {
    const { titulo, categoria, conteudo, destaque, ordem } = req.body;
    if (!titulo || !categoria) return res.status(400).json({ erro: 'título e categoria são obrigatórios' });
    const dica = await Dica.create({ titulo, categoria, conteudo, destaque, ordem });
    res.status(201).json(dica);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

// PATCH /api/dicas/:id — atualiza dados (sem imagens)
router.patch('/:id', autenticar, async (req, res) => {
  try {
    const dica = await Dica.findByIdAndUpdate(
      req.params.id,
      { ...req.body, atualizadoEm: new Date() },
      { new: true }
    );
    if (!dica) return res.status(404).json({ erro: 'Não encontrada' });
    res.json(dica);
  } catch (e) { res.status(500).json({ erro: e.message }); }
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

    const novas = [];
    for (const file of req.files) {
      try {
        const result = await uploadParaCloudinary(file.buffer);
        novas.push({ url: result.secure_url, publicId: result.public_id, fonte: 'cloudinary' });
      } catch (e) {
        // Fallback local: converte para base64 data URL
        const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        novas.push({ url: dataUrl, publicId: '', fonte: 'local' });
      }
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
