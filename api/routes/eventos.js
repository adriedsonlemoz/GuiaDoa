import { Router } from 'express';
import Evento from '../models/Evento.js';
import { autenticar } from '../middleware/auth.js';
import { normalizarEventoPayload, serializarEvento } from '../utils/eventos.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const reino = String(req.query.reino || '').trim().toLowerCase();
    const reinoId = Number(req.query.reinoId || 0);
    const filtro = { ativo:true };
    if (reinoId) filtro['ocorrencias.reinoId'] = reinoId;
    else if (reino) filtro['ocorrencias.reinoNome'] = new RegExp(`^${reino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const docs = await Evento.find(filtro).sort({ nome:1 }).lean();
    const eventos = docs.map(doc => serializarEvento(doc));
    res.json({ eventos, total:eventos.length, regraConfirmacao:'Ausência de ocorrência para um reino significa não confirmado.' });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.get('/admin/todos', autenticar, async (_req, res) => {
  try {
    const docs = await Evento.find({}).sort({ nome:1 }).lean();
    res.json({ eventos:docs.map(doc => serializarEvento(doc)), total:docs.length });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const doc = await Evento.findOne({ slug:req.params.slug, ativo:true }).lean();
    if (!doc) return res.status(404).json({ erro:'Evento não encontrado.' });
    res.json(serializarEvento(doc));
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.post('/', autenticar, async (req, res) => {
  try {
    const payload = normalizarEventoPayload(req.body);
    const criado = await Evento.create(payload);
    res.status(201).json(serializarEvento(criado));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro:'Já existe um evento com este identificador.' });
    res.status(err.status || 500).json({ erro:err.message });
  }
});

router.put('/:slug', autenticar, async (req, res) => {
  try {
    const payload = normalizarEventoPayload(req.body);
    const atualizado = await Evento.findOneAndUpdate({ slug:req.params.slug }, { $set:payload }, { new:true, runValidators:true });
    if (!atualizado) return res.status(404).json({ erro:'Evento não encontrado.' });
    res.json(serializarEvento(atualizado));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro:'Já existe outro evento com este identificador.' });
    res.status(err.status || 500).json({ erro:err.message });
  }
});

router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const removido = await Evento.findOneAndDelete({ slug:req.params.slug });
    if (!removido) return res.status(404).json({ erro:'Evento não encontrado.' });
    res.json({ ok:true });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

export default router;
