import { Router } from 'express';
import Reino from '../models/Reino.js';
import ReinoFusao from '../models/ReinoFusao.js';
import Evento from '../models/Evento.js';
import { autenticar } from '../middleware/auth.js';
import { normalizarReinoPayload, serializarReino } from '../utils/reinos.js';
import { serializarEvento } from '../utils/eventos.js';
import { sanitizeContentI18n } from '../utils/contentI18n.js';

const I18N_FIELDS = ['nome','status','historico'];

const router = Router();

function sendError(res, err) {
  if (err.code === 11000) return res.status(409).json({ erro:'Já existe um reino com esse ID ou identificador.', codigo:'DUPLICADO' });
  return res.status(err.status || 500).json({ erro:err.message, ...(err.codigo ? { codigo:err.codigo } : {}), ...(err.detalhes ? { detalhes:err.detalhes } : {}) });
}

router.get('/', async (_req, res) => {
  try {
    const lista = await Reino.find().sort({ id:-1 }).lean();
    res.json({ reinos:lista.map(r => serializarReino(r)), total:lista.length });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.get('/admin/recentes', autenticar, async (req, res) => {
  try {
    const limite = Math.min(20, Math.max(1, Number(req.query.limite || 4)));
    const lista = await Reino.find().sort({ id:-1 }).limit(limite).lean();
    res.json({ reinos:lista.map(r => serializarReino(r)), total:lista.length, criterio:'maior ID numérico' });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const reino = await Reino.findOne({ slug:req.params.slug }).lean();
    if (!reino) return res.status(404).json({ erro:'Reino não encontrado.' });
    const [fusoes, eventos] = await Promise.all([
      ReinoFusao.find({ $or:[{ reinoOriginalId:reino.id }, { reinoParceiroId:reino.id }, { reinoResultanteId:reino.id }] }).sort({ dataFusao:-1 }).lean(),
      Evento.find({ ativo:true, 'ocorrencias.reinoId':reino.id }).lean(),
    ]);
    res.json({
      ...serializarReino(reino),
      fusoes,
      eventos: eventos.map(serializarEvento).map(evento => ({
        slug:evento.slug, nome:evento.nome,
        ocorrencia:(evento.ocorrencias || []).find(o => Number(o.reinoId) === Number(reino.id)) || null,
      })),
    });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.post('/', autenticar, async (req, res) => {
  try {
    const payload = normalizarReinoPayload(req.body);
    payload.i18n = sanitizeContentI18n(req.body.i18n, I18N_FIELDS);
    const reino = await Reino.create(payload);
    res.status(201).json(serializarReino(reino));
  } catch (err) { sendError(res, err); }
});

router.put('/:slug', autenticar, async (req, res) => {
  try {
    const payload = normalizarReinoPayload(req.body);
    payload.i18n = sanitizeContentI18n(req.body.i18n, I18N_FIELDS);
    const reino = await Reino.findOneAndUpdate(
      { slug:req.params.slug },
      { $set:payload, $unset:{ regiao:'', idioma:'' } },
      { new:true, runValidators:true },
    );
    if (!reino) return res.status(404).json({ erro:'Reino não encontrado.' });
    res.json(serializarReino(reino));
  } catch (err) { sendError(res, err); }
});

router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const reino = await Reino.findOneAndDelete({ slug:req.params.slug });
    if (!reino) return res.status(404).json({ erro:'Reino não encontrado.' });
    res.json({ mensagem:`"${reino.nome}" removido com sucesso.` });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

// Estrutura preparada para fusões futuras. Nenhuma fusão é criada automaticamente.
router.get('/:slug/fusoes/historico', async (req, res) => {
  try {
    const reino = await Reino.findOne({ slug:req.params.slug }).lean();
    if (!reino) return res.status(404).json({ erro:'Reino não encontrado.' });
    const fusoes = await ReinoFusao.find({ $or:[{ reinoOriginalId:reino.id }, { reinoParceiroId:reino.id }, { reinoResultanteId:reino.id }] }).sort({ dataFusao:-1 }).lean();
    res.json({ fusoes, total:fusoes.length });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

export default router;
