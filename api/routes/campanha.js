import { Router } from 'express';
import CampanhaLocal from '../models/CampanhaLocal.js';
import { autenticar } from '../middleware/auth.js';
import { normalizarCampanhaPayload, resumoCategorias } from '../utils/campanha.js';
import { CAMPANHA_CATEGORIAS, GRODZ_MECHANICS } from '../seeds/campanha.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const categoria = String(req.query.categoria || '').trim().toLowerCase();
    const filtro = { ativo:true };
    if (categoria && CAMPANHA_CATEGORIAS.includes(categoria)) filtro.categoria = categoria;
    const locais = await CampanhaLocal.find(filtro).sort({ categoria:1, subtipo:1, ordem:1, nivel:1, nome:1 }).lean();
    const todos = categoria ? await CampanhaLocal.find({ ativo:true }).select('categoria').lean() : locais;
    res.json({ locais, total:locais.length, categorias:resumoCategorias(todos), grodz:GRODZ_MECHANICS });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const local = await CampanhaLocal.findOne({ slug:req.params.slug, ativo:true }).lean();
    if (!local) return res.status(404).json({ erro:'Local de campanha não encontrado.' });
    res.json(local);
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.post('/', autenticar, async (req, res) => {
  try {
    const payload = normalizarCampanhaPayload(req.body);
    const criado = await CampanhaLocal.create(payload);
    res.status(201).json(criado);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro:'Já existe um registro com este identificador, subtipo e nível.' });
    res.status(err.status || 500).json({ erro:err.message });
  }
});

router.put('/:slug', autenticar, async (req, res) => {
  try {
    const payload = normalizarCampanhaPayload(req.body);
    const atualizado = await CampanhaLocal.findOneAndUpdate({ slug:req.params.slug }, { $set:payload }, { new:true, runValidators:true });
    if (!atualizado) return res.status(404).json({ erro:'Local de campanha não encontrado.' });
    res.json(atualizado);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro:'Já existe um registro com este identificador, subtipo e nível.' });
    res.status(err.status || 500).json({ erro:err.message });
  }
});

router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const removido = await CampanhaLocal.findOneAndDelete({ slug:req.params.slug });
    if (!removido) return res.status(404).json({ erro:'Local de campanha não encontrado.' });
    res.json({ ok:true, mensagem:`${removido.nome} removido.` });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

export default router;
