import { Router } from 'express';
import Evento from '../models/Evento.js';
import Reino from '../models/Reino.js';
import { autenticar } from '../middleware/auth.js';
import { normalizarEventoPayload, serializarEvento, validarOcorrenciasComReinos, resumoExclusaoEvento, alinharOcorrenciasAoPeriodo } from '../utils/eventos.js';

const router = Router();
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function normalizeWithRealms(body) {
  const payload = normalizarEventoPayload(body);
  const realmIds = [...new Set((payload.ocorrencias || []).map(o => Number(o.reinoId)).filter(Boolean))];
  const realms = realmIds.length ? await Reino.find({ id:{ $in:realmIds } }).lean() : [];
  return validarOcorrenciasComReinos(payload, realms);
}

function sendError(res, err) {
  if (err.code === 11000) return res.status(409).json({ erro:'Já existe um evento com este identificador.', codigo:'DUPLICADO' });
  return res.status(err.status || 500).json({ erro:err.message, ...(err.codigo ? { codigo:err.codigo } : {}), ...(err.detalhes ? { detalhes:err.detalhes } : {}) });
}

router.get('/', async (req, res) => {
  try {
    const reino = String(req.query.reino || '').trim().toLowerCase();
    const reinoId = Number(req.query.reinoId || 0);
    const filtro = { ativo:true };
    if (reinoId) filtro['ocorrencias.reinoId'] = reinoId;
    else if (reino) filtro['ocorrencias.reinoNome'] = new RegExp(`^${escapeRegex(reino)}$`, 'i');
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

router.get('/admin/:slug/impacto-exclusao', autenticar, async (req, res) => {
  try {
    const doc = await Evento.findOne({ slug:req.params.slug }).lean();
    if (!doc) return res.status(404).json({ erro:'Evento não encontrado.' });
    res.json({ nome:doc.nome, impacto:resumoExclusaoEvento(doc) });
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
    const payload = await normalizeWithRealms(req.body);
    const criado = await Evento.create(payload);
    res.status(201).json(serializarEvento(criado));
  } catch (err) { sendError(res, err); }
});

router.put('/:slug', autenticar, async (req, res) => {
  try {
    const payload = await normalizeWithRealms(req.body);
    const atualizado = await Evento.findOneAndUpdate({ slug:req.params.slug }, { $set:payload }, { new:true, runValidators:true });
    if (!atualizado) return res.status(404).json({ erro:'Evento não encontrado.' });
    res.json(serializarEvento(atualizado));
  } catch (err) { sendError(res, err); }
});

// As telas independentes do Admin salvam somente a seção alterada, mas reaproveitam a mesma normalização completa.
router.patch('/:slug/secao/:secao', autenticar, async (req, res) => {
  try {
    const atual = await Evento.findOne({ slug:req.params.slug }).lean();
    if (!atual) return res.status(404).json({ erro:'Evento não encontrado.' });
    const sections = {
      gerais:['nome','slug','resumo','descricao','imagem','categoria','ativo','i18n','fonte'],
      datas:['inicioServidor','fimServidor','servidorFuso','horarioReset','fases'],
      reinos:['ocorrencias'],
      recompensas:['recompensas','fases'],
      regras:['regras'],
      historico:['historico'],
    };
    const allowed = sections[req.params.secao];
    if (!allowed) return res.status(400).json({ erro:'Seção de evento inválida.' });
    const merged = { ...atual };
    for (const field of allowed) if (Object.prototype.hasOwnProperty.call(req.body, field)) merged[field] = req.body[field];
    // O Admin centraliza o período em “Datas e fases”. Ao alterar esse período,
    // todas as ocorrências confirmadas continuam alinhadas ao mesmo relógio/reset do servidor.
    if (req.params.secao === 'datas' && merged.inicioServidor && merged.fimServidor) {
      merged.ocorrencias = alinharOcorrenciasAoPeriodo(merged.ocorrencias, merged.inicioServidor, merged.fimServidor);
    }
    const payload = await normalizeWithRealms(merged);
    const atualizado = await Evento.findOneAndUpdate({ slug:req.params.slug }, { $set:payload }, { new:true, runValidators:true });
    res.json(serializarEvento(atualizado));
  } catch (err) { sendError(res, err); }
});

router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const doc = await Evento.findOne({ slug:req.params.slug }).lean();
    if (!doc) return res.status(404).json({ erro:'Evento não encontrado.' });
    const impacto = resumoExclusaoEvento(doc);
    if (String(req.query.confirmar || '') !== 'sim') {
      return res.status(409).json({ erro:'Confirme a exclusão após revisar o impacto.', requerConfirmacao:true, impacto });
    }
    await Evento.deleteOne({ slug:req.params.slug });
    res.json({ ok:true, impacto });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

export default router;
