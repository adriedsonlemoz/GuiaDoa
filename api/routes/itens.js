import { Router } from 'express';
import Item from '../models/Item.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

// ── GET /api/itens  (público — usado pelo frontend) ──────────────────────────
router.get('/', async (req, res) => {
  try {
    const { busca = '', pagina = 1, limite = 50 } = req.query;
    const filtro = busca
      ? { $or: [
          { nome:     { $regex: busca, $options: 'i' } },
          { descricao:{ $regex: busca, $options: 'i' } },
        ] }
      : {};

    const skip  = (Number(pagina) - 1) * Number(limite);
    const total = await Item.countDocuments(filtro);
    const itens = await Item.find(filtro)
      .sort({ nome: 1 })
      .skip(skip)
      .limit(Number(limite));

    res.json({
      itens,
      total,
      pagina:  Number(pagina),
      paginas: Math.ceil(total / Number(limite)) || 1,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/itens/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/itens  (admin) ──────────────────────────────────────────────────
router.post('/', autenticar, async (req, res) => {
  const { nome, icone, descricao, onde } = req.body;
  if (!nome?.trim()) return res.status(400).json({ erro: 'O nome do item é obrigatório.' });
  try {
    const item = await Item.create({
      nome: nome.trim(),
      icone: icone || '🎒',
      descricao: descricao?.trim() || '',
      onde: onde?.trim() || '',
    });
    res.status(201).json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Já existe um item com o nome "${nome}".` });
    res.status(500).json({ erro: err.message });
  }
});

// ── PUT /api/itens/:id  (admin) ───────────────────────────────────────────────
router.put('/:id', autenticar, async (req, res) => {
  const { nome, icone, descricao, onde } = req.body;
  if (!nome?.trim()) return res.status(400).json({ erro: 'O nome do item é obrigatório.' });
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { nome: nome.trim(), icone: icone || '🎒', descricao: descricao?.trim() || '', onde: onde?.trim() || '', atualizadoEm: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
    res.json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Já existe um item com o nome "${nome}".` });
    res.status(500).json({ erro: err.message });
  }
});

// ── DELETE /api/itens/:id  (admin) ───────────────────────────────────────────
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
    res.json({ mensagem: `"${item.nome}" removido com sucesso.` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
