import { Router } from 'express';
import Pesquisa from '../models/Pesquisa.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

// ── Dados para seed ──────────────────────────────────────────────────────────
const SEED = [
  // ── Corpo a Corpo ──────────────────────────────────────────────────────────
  { slug:'cc-maestria-golpe',    nome:'Maestria do Golpe',           icone:'⚔️',  categoria:'Corpo a Corpo',         nivelMax:10, ordem:0,
    descricao:'A Maestria do Golpe aumenta o dano de unidades corpo a corpo. Cada aprimoramento aumenta o dano de ataques corpo a corpo em 1%.' },
  { slug:'cc-maestria-defesa',   nome:'Maestria da Defesa',          icone:'🛡️',  categoria:'Corpo a Corpo',         nivelMax:10, ordem:1,
    descricao:'A Maestria da Defesa aumenta a defesa de todas as unidades. Cada aprimoramento aumenta sua defesa em 1%.' },
  { slug:'cc-maestria-vida',     nome:'Maestria da Vida',            icone:'❤️',  categoria:'Corpo a Corpo',         nivelMax:10, ordem:2,
    descricao:'A Maestria da Vida aumenta a vida de todas as unidades. Cada aprimoramento aumenta sua vida em 1%.' },
  { slug:'cc-percepcao',         nome:'Percepção',                   icone:'👁️',  categoria:'Corpo a Corpo',         nivelMax:10, ordem:3,
    descricao:'Aprimore Percepção para visualizar informações detalhadas dos inimigos a caminho.' },
  { slug:'cc-fugaz',             nome:'Fugaz',                       icone:'⚡',  categoria:'Corpo a Corpo',         nivelMax:10, ordem:4,
    descricao:'Garanta uma vantagem inicial às suas tropas no campo de batalha. Cada aprimoramento aumenta a velocidade de combate das suas tropas em 5%.' },
  { slug:'cc-dev-territorio',    nome:'Desenvolvimento de Território',icone:'🗺️',  categoria:'Corpo a Corpo',         nivelMax:5,  ordem:5,
    descricao:'Combine várias tecnologias para desenvolver territórios. Cada nível aumenta a taxa de produção de todos os territórios ocupados em 2%.' },
  { slug:'cc-devastar',         nome:'Devastar Eficiente',           icone:'💥',  categoria:'Corpo a Corpo',         nivelMax:1,  ordem:6,
    descricao:'Melhora a eficiência das tropas ao devastar o campo de batalha. Cada melhoria reduz o tempo de espera para atacar campo de Antropos em 5%.' },

  // ── Ataque à Distância ────────────────────────────────────────────────────
  { slug:'ad-maestria-alcance',  nome:'Maestria do Alcance',         icone:'🏹',  categoria:'Ataque à Distância',    nivelMax:10, ordem:0,
    descricao:'A Maestria do Alcance aumenta o dano de unidades de ataque à distância. Cada aprimoramento aumenta o dano de ataques à distância em 1%.' },
  { slug:'ad-maestria-golpe',    nome:'Maestria do Golpe',           icone:'⚔️',  categoria:'Ataque à Distância',    nivelMax:10, ordem:1,
    descricao:'A Maestria do Golpe aumenta o dano de unidades corpo a corpo. Cada aprimoramento aumenta o dano de ataques corpo a corpo em 1%.' },
  { slug:'ad-maestria-defesa',   nome:'Maestria da Defesa',          icone:'🛡️',  categoria:'Ataque à Distância',    nivelMax:10, ordem:2,
    descricao:'A Maestria da Defesa aumenta a defesa de todas as unidades. Cada aprimoramento aumenta sua defesa em 1%.' },
  { slug:'ad-maestria-vida',     nome:'Maestria da Vida',            icone:'❤️',  categoria:'Ataque à Distância',    nivelMax:10, ordem:3,
    descricao:'A Maestria da Vida aumenta a vida de todas as unidades. Cada aprimoramento aumenta sua vida em 1%.' },
  { slug:'ad-percepcao',         nome:'Percepção',                   icone:'👁️',  categoria:'Ataque à Distância',    nivelMax:10, ordem:4,
    descricao:'Aprimore Percepção para visualizar informações detalhadas dos inimigos a caminho.' },
  { slug:'ad-fugaz',             nome:'Fugaz',                       icone:'⚡',  categoria:'Ataque à Distância',    nivelMax:10, ordem:5,
    descricao:'Garanta uma vantagem inicial às suas tropas no campo de batalha. Cada aprimoramento aumenta a velocidade de combate das suas tropas em 5%.' },
  { slug:'ad-dev-territorio',    nome:'Desenvolvimento de Território',icone:'🗺️',  categoria:'Ataque à Distância',    nivelMax:5,  ordem:6,
    descricao:'Combine várias tecnologias para desenvolver territórios. Cada nível aumenta a taxa de produção de todos os territórios ocupados em 2%.' },
  { slug:'ad-devastar',         nome:'Devastar Eficiente',           icone:'💥',  categoria:'Ataque à Distância',    nivelMax:1,  ordem:7,
    descricao:'Melhora a eficiência das tropas ao devastar o campo de batalha. Cada melhoria reduz o tempo de espera para atacar campo de Antropos em 5%.' },

  // ── Produção ──────────────────────────────────────────────────────────────
  { slug:'pr-agricultura',       nome:'Agricultura',                 icone:'🌾',  categoria:'Produção',              nivelMax:10, ordem:0,
    descricao:'Agricultura melhora o cultivo e a pecuária. Cada aprimoramento aumenta a produção de Comida em 10%.' },
  { slug:'pr-marcenaria',        nome:'Marcenaria',                  icone:'🪵',  categoria:'Produção',              nivelMax:10, ordem:1,
    descricao:'Marcenaria melhora o corte, serragem e acabamento da madeira. Cada aprimoramento aumenta a produção de Madeira em 10%.' },
  { slug:'pr-alvenaria',         nome:'Alvenaria',                   icone:'🪨',  categoria:'Produção',              nivelMax:10, ordem:2,
    descricao:'Alvenaria melhora as técnicas de extração e acabamento de pedras. Cada aprimoramento aumenta a produção de Pedra em 10%.' },
  { slug:'pr-ligas',             nome:'Ligas',                       icone:'⚙️',  categoria:'Produção',              nivelMax:10, ordem:3,
    descricao:'A pesquisa de Ligas permite a melhora das técnicas de usinagem e mineração. Cada aprimoramento aumenta a produção de Metais em 10%.' },
  { slug:'pr-metalurgia',        nome:'Metalurgia',                  icone:'🔩',  categoria:'Produção',              nivelMax:10, ordem:4,
    descricao:'Avanços em Metalurgia levam a melhores armas e armaduras. Cada aprimoramento aumenta o ataque e a defesa de suas tropas em 5%.' },
  { slug:'pr-forja-armadura',    nome:'Forja de Armadura',           icone:'🔨',  categoria:'Produção',              nivelMax:10, ordem:5,
    descricao:'As técnicas de forja da Tribo dos Anões ajudam o forno de forja a esfriar rapidamente. Cada aprimoramento reduz o tempo de espera para forjar armaduras em 1.' },
  { slug:'pr-clarividencia',     nome:'Clarividência',               icone:'🔮',  categoria:'Produção',              nivelMax:15, ordem:6,
    descricao:'Treine seus espiões em Clarividência para receber informações de espionagem mais detalhadas.' },

  // ── Movimento e Construção ────────────────────────────────────────────────
  { slug:'mv-formacao-rapida',   nome:'Formação Rápida',             icone:'🏃',  categoria:'Movimento e Construção',nivelMax:10, ordem:0,
    descricao:'Formação Rápida é uma ciência e uma arte. Cada aprimoramento aumenta a velocidade de marcha de suas tropas em 10%.' },
  { slug:'mv-calibracao-armas',  nome:'Calibração de Armas',         icone:'🎯',  categoria:'Movimento e Construção',nivelMax:10, ordem:1,
    descricao:'Calibração de Armas conferia aos Antigos as mais mortíferas tropas de longo alcance da história. Cada aprimoramento aumenta o alcance de suas tropas de longo alcance em 5.' },
  { slug:'mv-medicina',          nome:'Medicina',                    icone:'💊',  categoria:'Movimento e Construção',nivelMax:10, ordem:2,
    descricao:'Medicina ajuda suas tropas a se recuperarem de ferimentos. Cada aprimoramento aumenta a Vida das tropas em 5%.' },
  { slug:'mv-dragoaria',         nome:'Dragoaria',                   icone:'🐉',  categoria:'Movimento e Construção',nivelMax:10, ordem:3,
    descricao:'Conhecer os dragões ajuda você a aproveitar o máximo de sua força. Cada aprimoramento aumenta a velocidade de Dragões de Combate e de Dragões de Ataque Rápido.' },
  { slug:'mv-levitacao',         nome:'Levitação',                   icone:'🧲',  categoria:'Movimento e Construção',nivelMax:10, ordem:4,
    descricao:'Os Antigos conseguiam inverter a gravidade e mover imensos blocos e colunas. Cada aprimoramento aumenta a velocidade de construção em 10%.' },
  { slug:'mv-combate-aereo',     nome:'Combate Aéreo',               icone:'🦅',  categoria:'Movimento e Construção',nivelMax:10, ordem:5,
    descricao:'Treine seus Dragões para a batalha! Cada aprimoramento aumenta as habilidades de ataque de todos os Dragões.' },
  { slug:'mv-conhecimento-dragao',nome:'Conhecimento de Dragão',     icone:'📚',  categoria:'Movimento e Construção',nivelMax:10, ordem:6,
    descricao:'Os antigos curandeiros sabiam muito sobre a fisiologia dos Dragões. Cada nível aumenta a taxa de cura de seus Dragões.' },
];

function gerarNiveis(nivelMax) {
  return Array.from({ length: nivelMax }, (_, i) => ({ nivel: i + 1, tempo: '' }));
}

// ── GET /api/pesquisas ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const lista = await Pesquisa.find().sort({ categoria: 1, ordem: 1 });
    res.json({ pesquisas: lista, total: lista.length });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── GET /api/pesquisas/:slug ──────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const p = await Pesquisa.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ erro: 'Pesquisa não encontrada.' });
    res.json(p);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── POST /api/pesquisas (admin) ───────────────────────────────────────────────
router.post('/', autenticar, async (req, res) => {
  const { slug, nome, icone, descricao, categoria, nivelMax, ordem } = req.body;
  if (!slug?.trim() || !nome?.trim() || !categoria)
    return res.status(400).json({ erro: 'Slug, nome e categoria são obrigatórios.' });
  try {
    const max = parseInt(nivelMax, 10) || 10;
    const p = await Pesquisa.create({
      slug: slug.trim(), nome: nome.trim(), icone: icone || '🔬',
      descricao: descricao || '', categoria, nivelMax: max, ordem: ordem || 0,
      niveis: gerarNiveis(max),
    });
    res.status(201).json(p);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Slug "${slug}" já existe.` });
    res.status(500).json({ erro: err.message });
  }
});

// ── PUT /api/pesquisas/:slug/meta (admin) ─────────────────────────────────────
router.put('/:slug/meta', autenticar, async (req, res) => {
  const { nome, icone, descricao, categoria, nivelMax, ordem } = req.body;
  try {
    const p = await Pesquisa.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ erro: 'Pesquisa não encontrada.' });

    const max = parseInt(nivelMax, 10) || p.nivelMax;

    // Ajustar array de níveis se nivelMax mudou
    let novosNiveis = [...p.niveis];
    if (max > p.nivelMax) {
      for (let i = p.nivelMax + 1; i <= max; i++) {
        novosNiveis.push({ nivel: i, tempo: '' });
      }
    } else if (max < p.nivelMax) {
      novosNiveis = novosNiveis.filter(n => n.nivel <= max);
    }

    const atualizado = await Pesquisa.findOneAndUpdate(
      { slug: req.params.slug },
      { nome, icone, descricao, categoria, nivelMax: max, ordem, niveis: novosNiveis, atualizadoEm: new Date() },
      { new: true }
    );
    res.json(atualizado);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── PUT /api/pesquisas/:slug/niveis (admin) ───────────────────────────────────
// Body: { niveis: [{ nivel: 1, tempo: '30m' }, ...] }
router.put('/:slug/niveis', autenticar, async (req, res) => {
  const { niveis } = req.body;
  if (!Array.isArray(niveis)) return res.status(400).json({ erro: 'niveis deve ser um array.' });
  try {
    const p = await Pesquisa.findOneAndUpdate(
      { slug: req.params.slug },
      { niveis, atualizadoEm: new Date() },
      { new: true }
    );
    if (!p) return res.status(404).json({ erro: 'Pesquisa não encontrada.' });
    res.json(p);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── DELETE /api/pesquisas/:slug (admin) ───────────────────────────────────────
router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const p = await Pesquisa.findOneAndDelete({ slug: req.params.slug });
    if (!p) return res.status(404).json({ erro: 'Pesquisa não encontrada.' });
    res.json({ ok: true, slug: req.params.slug });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// ── POST /api/pesquisas/seed (admin) ─────────────────────────────────────────
router.post('/seed', autenticar, async (req, res) => {
  try {
    await Pesquisa.deleteMany({});
    const docs = SEED.map(s => ({ ...s, niveis: gerarNiveis(s.nivelMax) }));
    await Pesquisa.insertMany(docs);
    res.json({ ok: true, total: docs.length });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

export default router;
