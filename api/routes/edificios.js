import { Router } from 'express';
import Edificio from '../models/Edificio.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();


// ── GET /api/edificios (público) ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const lista = await Edificio.find().sort({ ordem: 1, nome: 1 });
    res.json({ edificios: lista, total: lista.length });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/edificios/:slug ─────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const ed = await Edificio.findOne({ slug: req.params.slug });
    if (!ed) return res.status(404).json({ erro: 'Edifício não encontrado.' });
    res.json(ed);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/edificios (admin) ──────────────────────────────────────────────
router.post('/', autenticar, async (req, res) => {
  const { slug, nome, icone, tag, descricao, colunas, ordem } = req.body;
  if (!slug?.trim() || !nome?.trim())
    return res.status(400).json({ erro: 'Slug e nome são obrigatórios.' });
  try {
    const ed = await Edificio.create({ slug: slug.trim(), nome: nome.trim(), icone, tag, descricao, colunas: colunas || [], ordem: ordem || 0, niveis: [] });
    res.status(201).json(ed);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Já existe um edifício com o slug "${slug}".` });
    res.status(500).json({ erro: err.message });
  }
});

// ── PUT /api/edificios/:slug/meta (admin) ─────────────────────────────────────
router.put('/:slug/meta', autenticar, async (req, res) => {
  const { nome, icone, tag, descricao, colunas, ordem } = req.body;
  try {
    const ed = await Edificio.findOneAndUpdate(
      { slug: req.params.slug },
      { nome, icone, tag, descricao, colunas: colunas || [], ordem: ordem ?? 0, atualizadoEm: new Date() },
      { new: true, runValidators: true }
    );
    if (!ed) return res.status(404).json({ erro: 'Edifício não encontrado.' });
    res.json(ed);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── PUT /api/edificios/:slug/niveis (admin) — substitui array inteiro ─────────
router.put('/:slug/niveis', autenticar, async (req, res) => {
  const { niveis } = req.body;
  if (!Array.isArray(niveis)) return res.status(400).json({ erro: 'niveis deve ser um array.' });
  try {
    const ed = await Edificio.findOneAndUpdate(
      { slug: req.params.slug },
      { niveis, atualizadoEm: new Date() },
      { new: true }
    );
    if (!ed) return res.status(404).json({ erro: 'Edifício não encontrado.' });
    res.json(ed);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── DELETE /api/edificios/:slug (admin) ───────────────────────────────────────
router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const ed = await Edificio.findOneAndDelete({ slug: req.params.slug });
    if (!ed) return res.status(404).json({ erro: 'Edifício não encontrado.' });
    res.json({ mensagem: `"${ed.nome}" removido com sucesso.` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
