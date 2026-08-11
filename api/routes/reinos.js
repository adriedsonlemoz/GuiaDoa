import { Router } from 'express';
import Reino from '../models/Reino.js';
import { autenticar } from '../middleware/auth.js';
import { dbReinos } from '../../src/data/reinos.js';

const router = Router();

// ── GET /api/reinos (público) ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const lista = await Reino.find().sort({ nome: 1 });
    res.json({ reinos: lista, total: lista.length });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/reinos/:slug (público) ──────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const reino = await Reino.findOne({ slug: req.params.slug });
    if (!reino) return res.status(404).json({ erro: 'Reino não encontrado.' });
    res.json(reino);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/reinos (admin) ──────────────────────────────────────────────────
router.post('/', autenticar, async (req, res) => {
  const { id, nome, fuso, regiao, idioma } = req.body;
  if (!id || !nome?.trim() || !fuso?.trim())
    return res.status(400).json({ erro: 'ID, nome e fuso são obrigatórios.' });
  const slug = nome.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  try {
    const reino = await Reino.create({ id, slug, nome: nome.trim(), fuso: fuso.trim(), regiao: regiao || '', idioma: idioma || '' });
    res.status(201).json(reino);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Já existe um reino com esse ID ou nome.` });
    res.status(500).json({ erro: err.message });
  }
});

// ── PUT /api/reinos/:slug (admin) ─────────────────────────────────────────────
router.put('/:slug', autenticar, async (req, res) => {
  const { id, nome, fuso, regiao, idioma } = req.body;
  try {
    const reino = await Reino.findOneAndUpdate(
      { slug: req.params.slug },
      { id, nome, fuso, regiao, idioma, atualizadoEm: new Date() },
      { new: true, runValidators: true }
    );
    if (!reino) return res.status(404).json({ erro: 'Reino não encontrado.' });
    res.json(reino);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: 'ID já em uso por outro reino.' });
    res.status(500).json({ erro: err.message });
  }
});

// ── DELETE /api/reinos/:slug (admin) ──────────────────────────────────────────
router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const reino = await Reino.findOneAndDelete({ slug: req.params.slug });
    if (!reino) return res.status(404).json({ erro: 'Reino não encontrado.' });
    res.json({ mensagem: `"${reino.nome}" removido com sucesso.` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/reinos/seed (admin) — importa dados estáticos ──────────────────
router.post('/seed', autenticar, async (req, res) => {
  try {
    let inseridos = 0, atualizados = 0;
    for (const r of dbReinos) {
      const slug = r.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await Reino.findOneAndUpdate(
        { slug },
        { id: r.id, slug, nome: r.nome, fuso: r.fuso, regiao: r.regiao || '', idioma: r.idioma || '', atualizadoEm: new Date() },
        { upsert: true, new: true }
      ).then(doc => doc ? atualizados++ : inseridos++);
    }
    res.json({ mensagem: 'Seed concluído.', inseridos, atualizados, total: dbReinos.length });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
