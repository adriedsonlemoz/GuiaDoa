import { Router } from 'express';
import Pesquisa from '../models/Pesquisa.js';
import { autenticar } from '../middleware/auth.js';
import { sanitizeContentI18n } from '../utils/contentI18n.js';

const router = Router();
const I18N_FIELDS = ['nome', 'descricao'];

function gerarNiveis(nivelMax) {
  return Array.from({ length: nivelMax }, (_, i) => ({ nivel: i + 1, tempo: '' }));
}

// ── GET /api/pesquisas ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const lista = await Pesquisa.find().sort({ categoria: 1, ordem: 1 });
    res.json({ pesquisas: lista, total: lista.length });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── GET /api/pesquisas/:slug ──────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const p = await Pesquisa.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ erro: 'Pesquisa não encontrada.' });
    res.json(p);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── POST /api/pesquisas (admin) ───────────────────────────────────────────────
router.post('/', autenticar, async (req, res) => {
  const { slug, nome, icone, descricao, categoria, nivelMax, ordem, i18n } = req.body;
  if (!slug?.trim() || !nome?.trim() || !categoria)
    return res.status(400).json({ erro: 'Slug, nome e categoria são obrigatórios.' });
  try {
    const max = parseInt(nivelMax, 10) || 10;
    const p = await Pesquisa.create({
      slug: slug.trim(), nome: nome.trim(), icone: icone || '🔬',
      descricao: descricao || '', categoria, nivelMax: max, ordem: ordem || 0,
      niveis: gerarNiveis(max),
      i18n: sanitizeContentI18n(i18n, I18N_FIELDS),
    });
    res.status(201).json(p);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Slug "${slug}" já existe.` });
    res.status(500).json({ erro: err.message });
  }
});

// ── PUT /api/pesquisas/:slug/meta (admin) ─────────────────────────────────────
router.put('/:slug/meta', autenticar, async (req, res) => {
  const { nome, icone, descricao, categoria, nivelMax, ordem } = req.body;
  try {
    const p = await Pesquisa.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ erro: 'Pesquisa não encontrada.' });

    const max = parseInt(nivelMax, 10) || p.nivelMax;

    // Ajustar array de níveis se nivelMax mudou
    let novosNiveis = [...p.niveis];
    if (max > p.nivelMax) {
      for (let i = p.nivelMax + 1; i <= max; i++) {
        novosNiveis.push({ nivel: i, tempo: '' });
      }
    } else if (max < p.nivelMax) {
      novosNiveis = novosNiveis.filter(n => n.nivel <= max);
    }

    const atualizado = await Pesquisa.findOneAndUpdate(
      { slug: req.params.slug },
      { nome, icone, descricao, categoria, nivelMax: max, ordem, niveis: novosNiveis, i18n: sanitizeContentI18n(i18n, I18N_FIELDS), atualizadoEm: new Date() },
      { new: true }
    );
    res.json(atualizado);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── PUT /api/pesquisas/:slug/niveis (admin) ───────────────────────────────────
// Body: { niveis: [{ nivel: 1, tempo: '30m' }, ...] }
router.put('/:slug/niveis', autenticar, async (req, res) => {
  const { niveis } = req.body;
  if (!Array.isArray(niveis)) return res.status(400).json({ erro: 'niveis deve ser um array.' });
  try {
    const p = await Pesquisa.findOneAndUpdate(
      { slug: req.params.slug },
      { niveis, atualizadoEm: new Date() },
      { new: true }
    );
    if (!p) return res.status(404).json({ erro: 'Pesquisa não encontrada.' });
    res.json(p);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── DELETE /api/pesquisas/:slug (admin) ───────────────────────────────────────
router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const p = await Pesquisa.findOneAndDelete({ slug: req.params.slug });
    if (!p) return res.status(404).json({ erro: 'Pesquisa não encontrada.' });
    res.json({ ok: true, slug: req.params.slug });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

export default router;
