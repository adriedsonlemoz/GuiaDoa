import { Router } from 'express';
import Nivel from '../models/Nivel.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();
const parsePower = body => {
  const value = body?.poderNecessario ?? body?.xp;
  return value !== '' && value != null ? Math.max(0, parseInt(value, 10) || 0) : null;
};
const normalize = doc => {
  const raw = typeof doc?.toObject === 'function' ? doc.toObject() : { ...doc };
  raw.poderNecessario = raw.poderNecessario ?? raw.xp ?? null;
  delete raw.xp;
  return raw;
};

router.get('/todas', async (req, res) => {
  try {
    const niveis = await Nivel.find().sort({ nivel:1 }).lean();
    res.json(niveis.map(normalize));
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.get('/', autenticar, async (req, res) => {
  try {
    const { pagina=1, limite=100, busca='' } = req.query;
    const filtro = busca ? { nivel:parseInt(busca,10) || 0 } : {};
    const page = Math.max(1, parseInt(pagina,10) || 1);
    const size = Math.min(200, Math.max(1, parseInt(limite,10) || 100));
    const total = await Nivel.countDocuments(filtro);
    const niveis = await Nivel.find(filtro).sort({ nivel:1 }).skip((page-1)*size).limit(size).lean();
    res.json({ niveis:niveis.map(normalize), total, pagina:page, paginas:Math.ceil(total/size) });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

// Preenchimento rápido do Admin: cria/atualiza vários níveis em uma operação.
router.post('/lote', autenticar, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.niveis) ? req.body.niveis.slice(0, 100) : [];
    if (!items.length) return res.status(400).json({ erro:'Informe ao menos um nível' });
    const ops = items.map(item => ({
      updateOne: {
        filter:{ nivel:Math.max(1, parseInt(item.nivel,10) || 1) },
        update:{ $set:{ poderNecessario:parsePower(item), atualizadoEm:new Date() }, $unset:{ xp:'' } },
        upsert:true,
      },
    }));
    await Nivel.bulkWrite(ops, { ordered:false });
    const niveis = await Nivel.find({ nivel:{ $in:items.map(x=>parseInt(x.nivel,10)).filter(Boolean) } }).sort({ nivel:1 }).lean();
    res.json({ atualizados:niveis.length, niveis:niveis.map(normalize) });
  } catch (err) { res.status(400).json({ erro:err.message }); }
});

router.get('/:id', autenticar, async (req, res) => {
  try {
    const nivel = await Nivel.findById(req.params.id).lean();
    if (!nivel) return res.status(404).json({ erro:'Nível não encontrado' });
    res.json(normalize(nivel));
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.post('/', autenticar, async (req, res) => {
  try {
    const doc = new Nivel({ nivel:parseInt(req.body.nivel,10), poderNecessario:parsePower(req.body), atualizadoEm:new Date() });
    await doc.save();
    res.status(201).json(normalize(doc));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro:`Nível ${req.body.nivel} já existe` });
    res.status(400).json({ erro:err.message });
  }
});

router.put('/:id', autenticar, async (req, res) => {
  try {
    const doc = await Nivel.findByIdAndUpdate(req.params.id, {
      $set:{ nivel:parseInt(req.body.nivel,10), poderNecessario:parsePower(req.body), atualizadoEm:new Date() },
      $unset:{ xp:'' },
    }, { new:true, runValidators:true });
    if (!doc) return res.status(404).json({ erro:'Nível não encontrado' });
    res.json(normalize(doc));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro:`Nível ${req.body.nivel} já existe` });
    res.status(400).json({ erro:err.message });
  }
});

router.delete('/:id', autenticar, async (req, res) => {
  try {
    const doc = await Nivel.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ erro:'Nível não encontrado' });
    res.json({ mensagem:`Nível ${doc.nivel} removido com sucesso` });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

export default router;
