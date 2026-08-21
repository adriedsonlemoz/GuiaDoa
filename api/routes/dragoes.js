import { Router } from 'express';
import Dragao from '../models/Dragao.js';
import { autenticar } from '../middleware/auth.js';
import { sanitizeContentI18n } from '../utils/contentI18n.js';

const router = Router();

const ATTRS_BASE = ['vida','defesa','ataquePerto','ataqueDistante','alcance','velocidade'];
const ATTRS_ELEMENTAL = ['ataqueElemental','impulsoElemental','barreiraElemental','bombardeioElemental','confrontoElemental','bloqueioElemental','rupturaElemental'];
const TODOS_ATTRS = [...ATTRS_BASE, ...ATTRS_ELEMENTAL];
const I18N_FIELDS = ['nome', 'elemento', 'raridade', 'bonusMarcha', 'atributo', 'descricao', 'dicas'];

const str = value => String(value ?? '').trim();
const numOrNull = value => value === '' || value == null ? null : Number.isFinite(Number(value)) ? Number(value) : null;

function sanitizeCapture(input) {
  if (!input || typeof input !== 'object') return null;
  const item = input.item && typeof input.item === 'object' ? {
    codigo: str(input.item.codigo),
    nome: str(input.item.nome),
    imagem: str(input.item.imagem),
    i18n: sanitizeContentI18n(input.item.i18n, ['nome']),
  } : null;
  const campo = input.campo && typeof input.campo === 'object' ? {
    subtipo: str(input.campo.subtipo),
    nome: str(input.campo.nome),
    i18n: sanitizeContentI18n(input.campo.i18n, ['nome']),
  } : null;
  const niveis = Array.isArray(input.niveis)
    ? [...new Set(input.niveis.map(Number).filter(Number.isFinite))].sort((a,b) => a-b)
    : [];
  return {
    dragonId: str(input.dragonId),
    item,
    quantidade: numOrNull(input.quantidade),
    campo,
    niveis,
    nivelMin: numOrNull(input.nivelMin),
    nivelMax: numOrNull(input.nivelMax),
  };
}

function sanitizeObtencao(input) {
  if (!input || typeof input !== 'object') return {};
  const fonte = input.fonte && typeof input.fonte === 'object' ? {
    modulo: str(input.fonte.modulo),
    slug: str(input.fonte.slug),
    nome: str(input.fonte.nome),
    nivelMin: numOrNull(input.fonte.nivelMin),
    nivelMax: numOrNull(input.fonte.nivelMax),
  } : null;
  return {
    tipo: str(input.tipo) || 'desconhecido',
    resumo: str(input.resumo),
    dia: numOrNull(input.dia),
    fonte,
    captura: sanitizeCapture(input.captura),
    i18n: sanitizeContentI18n(input.i18n, ['resumo']),
  };
}

function sanitizeHabilidade(input) {
  const nome = str(input?.nome);
  const id = str(input?.id)
    || nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return {
    id,
    nome,
    tipo: str(input?.tipo) || 'batalha',
    imagem: str(input?.imagem),
    descricao: str(input?.descricao),
  };
}

// ── GET público ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const lista = await Dragao.find().sort({ ordem: 1, nome: 1 });
    res.json({ dragoes: lista, total: lista.length });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const d = await Dragao.findOne({ slug: req.params.slug });
    if (!d) return res.status(404).json({ erro: 'Dragão não encontrado.' });
    res.json(d);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── Metadados / obtenção ─────────────────────────────────────────────────────
router.post('/', autenticar, async (req, res) => {
  const { slug, nome, ordem, aliases, elemento, emoji, emojiDragao, imagem, cor, raridade, bonusMarcha, atributo, descricao, obtencao, i18n } = req.body;
  if (!str(slug) || !str(nome)) return res.status(400).json({ erro: 'Slug e nome são obrigatórios.' });
  try {
    const d = await Dragao.create({
      slug:str(slug), nome:str(nome), ordem:numOrNull(ordem) ?? 999, aliases:Array.isArray(aliases) ? aliases.map(str).filter(Boolean) : [], elemento:str(elemento), emoji:str(emoji), emojiDragao:str(emojiDragao), imagem:str(imagem),
      cor, raridade:str(raridade), bonusMarcha:str(bonusMarcha), atributo:str(atributo), descricao:str(descricao),
      obtencao:sanitizeObtencao(obtencao), i18n:sanitizeContentI18n(i18n, I18N_FIELDS), niveis:[], habilidades:[],
    });
    res.status(201).json(d);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Slug "${slug}" já existe.` });
    res.status(500).json({ erro: err.message });
  }
});

router.put('/:slug/meta', autenticar, async (req, res) => {
  const { nome, ordem, aliases, elemento, emoji, emojiDragao, imagem, cor, raridade, bonusMarcha, atributo, descricao, obtencao, i18n } = req.body;
  try {
    const d = await Dragao.findOneAndUpdate(
      { slug:req.params.slug },
      { nome:str(nome), ordem:numOrNull(ordem) ?? 999, aliases:Array.isArray(aliases) ? aliases.map(str).filter(Boolean) : [], elemento:str(elemento), emoji:str(emoji), emojiDragao:str(emojiDragao), imagem:str(imagem), cor,
        raridade:str(raridade), bonusMarcha:str(bonusMarcha), atributo:str(atributo), descricao:str(descricao),
        obtencao:sanitizeObtencao(obtencao), i18n:sanitizeContentI18n(i18n, I18N_FIELDS), atualizadoEm:new Date() },
      { new:true },
    );
    if (!d) return res.status(404).json({ erro:'Dragão não encontrado.' });
    res.json(d);
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

// ── Habilidades: cadastro simples, sem 90 níveis ─────────────────────────────
router.put('/:slug/habilidade', autenticar, async (req, res) => {
  const habilidade = sanitizeHabilidade(req.body);
  if (!habilidade.id || !habilidade.nome) return res.status(400).json({ erro:'Nome da habilidade é obrigatório.' });
  try {
    const d = await Dragao.findOne({ slug:req.params.slug });
    if (!d) return res.status(404).json({ erro:'Dragão não encontrado.' });
    const lista = Array.isArray(d.habilidades) ? [...d.habilidades] : [];
    const idx = lista.findIndex(h => h?.id === habilidade.id);
    if (idx >= 0) lista[idx] = habilidade; else lista.push(habilidade);
    d.habilidades = lista;
    d.atualizadoEm = new Date();
    await d.save();
    res.json(d);
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.delete('/:slug/habilidade/:id', autenticar, async (req, res) => {
  try {
    const d = await Dragao.findOneAndUpdate(
      { slug:req.params.slug },
      { $pull:{ habilidades:{ id:req.params.id } }, $set:{ atualizadoEm:new Date() } },
      { new:true },
    );
    if (!d) return res.status(404).json({ erro:'Dragão não encontrado.' });
    res.json(d);
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

// ── Atributos: snapshots esparsos (1, 5, 10, 51... somente os conhecidos) ──
router.put('/:slug/nivel', autenticar, async (req, res) => {
  const { nivel, xpNecessaria, ...attrs } = req.body;
  const nivelNum = Number(nivel);
  if (!Number.isInteger(nivelNum) || nivelNum < 1 || nivelNum > 999) return res.status(400).json({ erro:'Informe um nível válido.' });

  const atributos = {};
  TODOS_ATTRS.forEach(k => { if (attrs[k] !== undefined) atributos[k] = Number(attrs[k]) || 0; });
  try {
    const d = await Dragao.findOneAndUpdate({ slug:req.params.slug }, { $pull:{ niveis:{ nivel:nivelNum } } }, { new:true });
    if (!d) return res.status(404).json({ erro:'Dragão não encontrado.' });
    d.niveis.push({ nivel:nivelNum, xpNecessaria:xpNecessaria ?? null, ...atributos });
    d.niveis.sort((a,b) => a.nivel - b.nivel);
    d.atualizadoEm = new Date();
    await d.save();
    res.json(d);
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.delete('/:slug/nivel/:nivel', autenticar, async (req, res) => {
  try {
    const d = await Dragao.findOneAndUpdate(
      { slug:req.params.slug },
      { $pull:{ niveis:{ nivel:Number(req.params.nivel) } }, $set:{ atualizadoEm:new Date() } },
      { new:true },
    );
    if (!d) return res.status(404).json({ erro:'Dragão não encontrado.' });
    res.json(d);
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const d = await Dragao.findOneAndDelete({ slug:req.params.slug });
    if (!d) return res.status(404).json({ erro:'Dragão não encontrado.' });
    res.json({ mensagem:`"${d.nome}" removido com sucesso.` });
  } catch (err) { res.status(500).json({ erro:err.message }); }
});

export default router;
