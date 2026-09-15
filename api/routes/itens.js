import { Router } from 'express';
import Item from '../models/Item.js';
import { autenticar } from '../middleware/auth.js';
import { sanitizeContentI18n } from '../utils/contentI18n.js';

const router = Router();
const I18N_FIELDS = ['nome','descricao','onde','origem','uso','limites','categoria','raridade','conteudoObservacao'];
const GRUPOS = new Set(['recursos','aceleracoes','geral','arcas']);
const clean = value => typeof value === 'string' ? value.trim() : '';

function slugifyItem(value) {
  return clean(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,120);
}

function nullableNumber(value, { min = 0 } = {}) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(min, number);
}

function inferGrupo(nome, categoria) {
  const text = `${nome || ''} ${categoria || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if (/\b(arca|bau|chest|caixas? de nanos|latas? de nanos|bolsa|pasta de finalizacao)\b/.test(text)) return 'arcas';
  if (/\baceleracao\b|speedup|marcha forcada|recuperacao forcada/.test(text)) return 'aceleracoes';
  if (/\b(recursos?|madeira|comida|pedra|metais?|ouro)\b/.test(text) && /\d/.test(text)) return 'recursos';
  return 'geral';
}

function sanitizeTags(values) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map(value => clean(value).slice(0,60)).filter(Boolean))].slice(0,24);
}

function sanitizeConteudo(values) {
  const rows = Array.isArray(values) ? values : [];
  const seen = new Set();
  const result = [];
  for (const row of rows.slice(0,60)) {
    const itemSlug = slugifyItem(row?.itemSlug);
    if (!itemSlug || seen.has(itemSlug)) continue;
    seen.add(itemSlug);
    result.push({
      itemSlug,
      quantidade: nullableNumber(row?.quantidade, { min:0 }) ?? 1,
      observacao: clean(row?.observacao).slice(0,240),
    });
  }
  return result;
}

function payloadItem(body) {
  const nome = clean(body.nome);
  const categoria = clean(body.categoria) || 'Geral';
  const grupo = GRUPOS.has(body.grupo) ? body.grupo : inferGrupo(nome, categoria);
  const precoValor = nullableNumber(body.preco?.valor ?? body.precoRubis);
  const precoOriginal = nullableNumber(body.preco?.valorOriginal ?? body.precoOriginalRubis);
  const efeitoValor = body.efeito?.valor === '' || body.efeito?.valor == null ? null : Number(body.efeito.valor);

  return {
    slug: slugifyItem(body.slug || nome),
    nome,
    icone: clean(body.icone) || '🎒',
    imagem: clean(body.imagem),
    categoria,
    grupo,
    destaque: Boolean(body.destaque),
    raridade: clean(body.raridade),
    quantidade: nullableNumber(body.quantidade),
    preco: {
      moeda:'rubis',
      valor:precoValor,
      valorOriginal:precoOriginal,
    },
    efeito: {
      tipo:clean(body.efeito?.tipo).slice(0,60),
      valor:Number.isFinite(efeitoValor) ? efeitoValor : null,
      unidade:clean(body.efeito?.unidade).slice(0,60),
    },
    conteudo:sanitizeConteudo(body.conteudo),
    conteudoObservacao:clean(body.conteudoObservacao).slice(0,1200),
    tags:sanitizeTags(body.tags),
    descricao:clean(body.descricao),
    origem:clean(body.origem),
    uso:clean(body.uso),
    limites:clean(body.limites),
    onde:clean(body.onde),
    ordem:Number.isFinite(Number(body.ordem)) ? Number(body.ordem) : 999,
    i18n:sanitizeContentI18n(body.i18n, I18N_FIELDS),
  };
}

router.get('/', async (req, res) => {
  try {
    const { busca = '', categoria = '', grupo = '', raridade = '', destaque = '', pagina = 1, limite = 50 } = req.query;
    const clauses = [];
    if (busca) clauses.push({ $or:[
      { nome:{ $regex:busca, $options:'i' } },
      { descricao:{ $regex:busca, $options:'i' } },
      { categoria:{ $regex:busca, $options:'i' } },
      { origem:{ $regex:busca, $options:'i' } },
      { uso:{ $regex:busca, $options:'i' } },
      { tags:{ $elemMatch:{ $regex:busca, $options:'i' } } },
    ] });
    if (categoria) clauses.push({ categoria });
    if (grupo && GRUPOS.has(grupo)) clauses.push({ grupo });
    if (raridade) clauses.push({ raridade });
    if (destaque === 'true') clauses.push({ destaque:true });
    const filtro = clauses.length ? { $and:clauses } : {};
    const page = Math.max(1, Number(pagina) || 1);
    const limit = Math.min(500, Math.max(1, Number(limite) || 50));
    const total = await Item.countDocuments(filtro);
    const itens = await Item.find(filtro).sort({ destaque:-1, ordem:1, nome:1 }).skip((page - 1) * limit).limit(limit);
    res.json({ itens, total, pagina:page, paginas:Math.ceil(total / limit) || 1 });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const item = await Item.findOne({ slug:slugifyItem(req.params.slug) });
    if (!item) return res.status(404).json({ erro:'Item não encontrado.' });
    res.json(item);
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ erro:'Item não encontrado.' });
    res.json(item);
  } catch (err) { res.status(400).json({ erro:'Identificador de item inválido.' }); }
});

router.post('/', autenticar, async (req, res) => {
  const data = payloadItem(req.body || {});
  if (!data.nome) return res.status(400).json({ erro:'O nome do item é obrigatório.' });
  try { res.status(201).json(await Item.create(data)); }
  catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro:`Já existe um item com o nome ou identificador "${data.nome}".` });
    res.status(500).json({ erro:err.message });
  }
});

router.put('/:id', autenticar, async (req, res) => {
  const data = payloadItem(req.body || {});
  if (!data.nome) return res.status(400).json({ erro:'O nome do item é obrigatório.' });
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { ...data, atualizadoEm:new Date() }, { new:true, runValidators:true });
    if (!item) return res.status(404).json({ erro:'Item não encontrado.' });
    res.json(item);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro:`Já existe um item com o nome ou identificador "${data.nome}".` });
    res.status(500).json({ erro:err.message });
  }
});

router.delete('/:id', autenticar, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ erro:'Item não encontrado.' });
    res.json({ mensagem:`"${item.nome}" removido com sucesso.` });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

export { inferGrupo, payloadItem, slugifyItem };
export default router;
