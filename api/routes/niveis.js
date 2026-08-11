import { Router } from 'express';
import Nivel        from '../models/Nivel.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

// ── GET /api/niveis/todas — público, sem auth ─────────────────────────────────
router.get('/todas', async (req, res) => {
  try {
    const niveis = await Nivel.find().sort({ nivel: 1 }).lean();
    res.json(niveis);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/niveis — lista paginada (admin) ──────────────────────────────────
router.get('/', autenticar, async (req, res) => {
  try {
    const { pagina = 1, limite = 100, busca = '' } = req.query;
    const filtro = busca ? { nivel: parseInt(busca) || 0 } : {};
    const total  = await Nivel.countDocuments(filtro);
    const niveis = await Nivel.find(filtro)
      .sort({ nivel: 1 })
      .skip((parseInt(pagina) - 1) * parseInt(limite))
      .limit(parseInt(limite))
      .lean();
    res.json({ niveis, total, pagina: parseInt(pagina), paginas: Math.ceil(total / parseInt(limite)) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/niveis/:id ───────────────────────────────────────────────────────
router.get('/:id', autenticar, async (req, res) => {
  try {
    const nivel = await Nivel.findById(req.params.id);
    if (!nivel) return res.status(404).json({ erro: 'Nível não encontrado' });
    res.json(nivel);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/niveis — criar ──────────────────────────────────────────────────
router.post('/', autenticar, async (req, res) => {
  try {
    const { nivel, xp } = req.body;
    const doc = new Nivel({
      nivel: parseInt(nivel),
      xp:    xp !== '' && xp != null ? parseInt(xp) : null,
      atualizadoEm: new Date(),
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ erro: `Nível ${req.body.nivel} já existe` });
    res.status(400).json({ erro: err.message });
  }
});

// ── PUT /api/niveis/:id — atualizar ──────────────────────────────────────────
router.put('/:id', autenticar, async (req, res) => {
  try {
    const { nivel, xp } = req.body;
    const doc = await Nivel.findByIdAndUpdate(
      req.params.id,
      {
        nivel: parseInt(nivel),
        xp:    xp !== '' && xp != null ? parseInt(xp) : null,
        atualizadoEm: new Date(),
      },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ erro: 'Nível não encontrado' });
    res.json(doc);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ erro: `Nível ${req.body.nivel} já existe` });
    res.status(400).json({ erro: err.message });
  }
});

// ── DELETE /api/niveis/:id ────────────────────────────────────────────────────
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const doc = await Nivel.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ erro: 'Nível não encontrado' });
    res.json({ mensagem: `Nível ${doc.nivel} removido com sucesso` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/niveis/importar — upsert em lote ───────────────────────────────
// Body: { niveis: [[num, xp|null], ...] }
router.post('/importar', autenticar, async (req, res) => {
  try {
    const { niveis } = req.body;
    if (!Array.isArray(niveis) || niveis.length === 0)
      return res.status(400).json({ erro: 'Envie um array em "niveis"' });

    const ops = niveis.map(([n, xp]) => ({
      updateOne: {
        filter: { nivel: n },
        update: { $set: { nivel: n, xp: xp ?? null, atualizadoEm: new Date() } },
        upsert: true,
      },
    }));

    const result = await Nivel.bulkWrite(ops);
    res.json({
      mensagem: 'Importação concluída',
      inseridos:    result.upsertedCount,
      atualizados:  result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
