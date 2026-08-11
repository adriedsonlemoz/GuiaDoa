import { Router } from 'express';
import Tropa       from '../models/Tropa.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

// GET /api/tropas — lista (com busca, paginação e ordenação)
router.get('/', autenticar, async (req, res) => {
  try {
    const { busca = '', pagina = 1, limite = 50, ordenar = 'nome', dir = '1', tipo } = req.query;
    const filtro = {};
    if (busca) filtro.nome = { $regex: busca, $options: 'i' };
    if (tipo)  filtro.tipo = tipo;

    const total  = await Tropa.countDocuments(filtro);
    const tropas = await Tropa.find(filtro)
      .sort({ [ordenar]: parseInt(dir) })
      .skip((parseInt(pagina) - 1) * parseInt(limite))
      .limit(parseInt(limite))
      .lean();

    res.json({ tropas, total, pagina: parseInt(pagina), paginas: Math.ceil(total / parseInt(limite)) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/tropas/todas — sem paginação (para o app React)
router.get('/todas', async (req, res) => {
  try {
    const tropas = await Tropa.find().sort({ nome: 1 }).lean();
    res.json(tropas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/tropas/:id
router.get('/:id', autenticar, async (req, res) => {
  try {
    const tropa = await Tropa.findById(req.params.id);
    if (!tropa) return res.status(404).json({ erro: 'Tropa não encontrada' });
    res.json(tropa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/tropas — criar
router.post('/', autenticar, async (req, res) => {
  try {
    const tropa = new Tropa({ ...req.body, atualizadoEm: new Date() });
    await tropa.save();
    res.status(201).json(tropa);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ erro: 'Já existe uma tropa com esse nome' });
    res.status(400).json({ erro: err.message });
  }
});

// PUT /api/tropas/:id — atualizar
router.put('/:id', autenticar, async (req, res) => {
  try {
    const tropa = await Tropa.findByIdAndUpdate(
      req.params.id,
      { ...req.body, atualizadoEm: new Date() },
      { new: true, runValidators: true }
    );
    if (!tropa) return res.status(404).json({ erro: 'Tropa não encontrada' });
    res.json(tropa);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ erro: 'Já existe uma tropa com esse nome' });
    res.status(400).json({ erro: err.message });
  }
});

// DELETE /api/tropas/:id
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const tropa = await Tropa.findByIdAndDelete(req.params.id);
    if (!tropa) return res.status(404).json({ erro: 'Tropa não encontrada' });
    res.json({ mensagem: `"${tropa.nome}" removida com sucesso` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
