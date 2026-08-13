import { Router } from 'express';
import Item from '../models/Item.js';
import { autenticar } from '../middleware/auth.js';
import { sanitizeContentI18n } from '../utils/contentI18n.js';

const router = Router();
const I18N_FIELDS = ['nome', 'descricao', 'onde', 'origem', 'uso', 'limites', 'categoria', 'raridade'];
const clean = value => typeof value === 'string' ? value.trim() : '';
const payloadItem = body => ({
  nome: clean(body.nome),
  icone: clean(body.icone) || '🎒',
  imagem: clean(body.imagem),
  categoria: clean(body.categoria) || 'Geral',
  raridade: clean(body.raridade),
  quantidade: body.quantidade === '' || body.quantidade == null ? null : Math.max(0, Number(body.quantidade) || 0),
  descricao: clean(body.descricao),
  origem: clean(body.origem),
  uso: clean(body.uso),
  limites: clean(body.limites),
  onde: clean(body.onde),
  ordem: Number.isFinite(Number(body.ordem)) ? Number(body.ordem) : 999,
  i18n: sanitizeContentI18n(body.i18n, I18N_FIELDS),
});

router.get('/', async (req, res) => {
  try {
    const { busca = '', categoria = '', raridade = '', pagina = 1, limite = 50 } = req.query;
    const clauses = [];
    if (busca) clauses.push({ $or: [
      { nome: { $regex: busca, $options: 'i' } },
      { descricao: { $regex: busca, $options: 'i' } },
      { categoria: { $regex: busca, $options: 'i' } },
      { origem: { $regex: busca, $options: 'i' } },
      { uso: { $regex: busca, $options: 'i' } },
    ] });
    if (categoria) clauses.push({ categoria });
    if (raridade) clauses.push({ raridade });
    const filtro = clauses.length ? { $and: clauses } : {};
    const page = Math.max(1, Number(pagina) || 1);
    const limit = Math.min(500, Math.max(1, Number(limite) || 50));
    const total = await Item.countDocuments(filtro);
    const itens = await Item.find(filtro).sort({ ordem: 1, nome: 1 }).skip((page - 1) * limit).limit(limit);
    res.json({ itens, total, pagina: page, paginas: Math.ceil(total / limit) || 1 });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
    res.json(item);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.post('/', autenticar, async (req, res) => {
  const data = payloadItem(req.body || {});
  if (!data.nome) return res.status(400).json({ erro: 'O nome do item é obrigatório.' });
  try { res.status(201).json(await Item.create(data)); }
  catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Já existe um item com o nome "${data.nome}".` });
    res.status(500).json({ erro: err.message });
  }
});

router.put('/:id', autenticar, async (req, res) => {
  const data = payloadItem(req.body || {});
  if (!data.nome) return res.status(400).json({ erro: 'O nome do item é obrigatório.' });
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { ...data, atualizadoEm: new Date() }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
    res.json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Já existe um item com o nome "${data.nome}".` });
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:id', autenticar, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });
    res.json({ mensagem: `"${item.nome}" removido com sucesso.` });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

export default router;
