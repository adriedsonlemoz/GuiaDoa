import { Router } from 'express';
import Dragao from '../models/Dragao.js';
import { autenticar } from '../middleware/auth.js';
import { sanitizeContentI18n } from '../utils/contentI18n.js';

const router = Router();

const ATTRS_BASE     = ['vida','defesa','ataquePerto','ataqueDistante','alcance','velocidade'];
const ATTRS_ELEMENTAL= ['ataqueElemental','impulsoElemental','barreiraElemental','bombardeioElemental','confrontoElemental','bloqueioElemental','rupturaElemental'];
const TODOS_ATTRS    = [...ATTRS_BASE, ...ATTRS_ELEMENTAL];
const I18N_FIELDS = ['nome', 'elemento', 'raridade', 'bonusMarcha', 'atributo', 'descricao', 'dicas'];

// ── GET /api/dragoes ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const lista = await Dragao.find().sort({ nome: 1 });
    res.json({ dragoes: lista, total: lista.length });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── GET /api/dragoes/:slug ───────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const d = await Dragao.findOne({ slug: req.params.slug });
    if (!d) return res.status(404).json({ erro: 'Dragão não encontrado.' });
    res.json(d);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── POST /api/dragoes (admin) ────────────────────────────────────────────────
router.post('/', autenticar, async (req, res) => {
  const { slug, nome, elemento, emoji, emojiDragao, cor, raridade, bonusMarcha, atributo, descricao, i18n } = req.body;
  if (!slug?.trim() || !nome?.trim())
    return res.status(400).json({ erro: 'Slug e nome são obrigatórios.' });
  try {
    const d = await Dragao.create({ slug: slug.trim(), nome: nome.trim(), elemento, emoji, emojiDragao, cor, raridade, bonusMarcha, atributo, descricao, i18n: sanitizeContentI18n(i18n, I18N_FIELDS), niveis:[] });
    res.status(201).json(d);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Slug "${slug}" já existe.` });
    res.status(500).json({ erro: err.message });
  }
});

// ── PUT /api/dragoes/:slug/meta (admin) ──────────────────────────────────────
router.put('/:slug/meta', autenticar, async (req, res) => {
  const { nome, elemento, emoji, emojiDragao, cor, raridade, bonusMarcha, atributo, descricao, i18n } = req.body;
  try {
    const d = await Dragao.findOneAndUpdate(
      { slug: req.params.slug },
      { nome, elemento, emoji, emojiDragao, cor, raridade, bonusMarcha, atributo, descricao, i18n: sanitizeContentI18n(i18n, I18N_FIELDS), atualizadoEm: new Date() },
      { new: true }
    );
    if (!d) return res.status(404).json({ erro: 'Dragão não encontrado.' });
    res.json(d);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── PUT /api/dragoes/:slug/nivel (admin) — upsert de 1 nível ─────────────────
router.put('/:slug/nivel', autenticar, async (req, res) => {
  const { nivel, xpNecessaria, ...attrs } = req.body;
  if (nivel == null) return res.status(400).json({ erro: 'Campo nivel é obrigatório.' });

  const atributos = {};
  TODOS_ATTRS.forEach(k => { if (attrs[k] !== undefined) atributos[k] = Number(attrs[k]) || 0; });

  try {
    // Remove o nível existente (se houver) e insere o novo
    const d = await Dragao.findOneAndUpdate(
      { slug: req.params.slug },
      { $pull: { niveis: { nivel: Number(nivel) } } },
      { new: true }
    );
    if (!d) return res.status(404).json({ erro: 'Dragão não encontrado.' });

    d.niveis.push({ nivel: Number(nivel), xpNecessaria: xpNecessaria ?? null, ...atributos });
    d.niveis.sort((a,b) => a.nivel - b.nivel);
    d.atualizadoEm = new Date();
    await d.save();
    res.json(d);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── DELETE /api/dragoes/:slug/nivel/:nivel (admin) ───────────────────────────
router.delete('/:slug/nivel/:nivel', autenticar, async (req, res) => {
  try {
    const d = await Dragao.findOneAndUpdate(
      { slug: req.params.slug },
      { $pull: { niveis: { nivel: Number(req.params.nivel) } } },
      { new: true }
    );
    if (!d) return res.status(404).json({ erro: 'Dragão não encontrado.' });
    res.json(d);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── DELETE /api/dragoes/:slug (admin) ────────────────────────────────────────
router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const d = await Dragao.findOneAndDelete({ slug: req.params.slug });
    if (!d) return res.status(404).json({ erro: 'Dragão não encontrado.' });
    res.json({ mensagem: `"${d.nome}" removido com sucesso.` });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

export default router;
