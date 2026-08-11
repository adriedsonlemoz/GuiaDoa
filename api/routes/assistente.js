import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// ── Reutiliza modelos já registrados ─────────────────────────────────────────
const mdl = (name, schema, col) => {
  if (mongoose.models[name]) return mongoose.models[name];
  return mongoose.model(name, schema, col);
};

// ── Schemas ───────────────────────────────────────────────────────────────────
const TropaSchema = new mongoose.Schema({
  nome: String, poder: Number, vida: Number, def: Number,
  atqPerto: Number, atqDist: Number, alcance: Number,
  vel: Number, car: Number, gestao: Number, desc: String,
  tipo: String, combate: String, rapida: Boolean,
}, { collection: 'doa_tropas' });

const ItemSchema = new mongoose.Schema({
  nome: String, icone: String, descricao: String, onde: String,
}, { collection: 'doa_itens' });

const EdificioSchema = new mongoose.Schema({
  nome: String, icone: String, tag: String, descricao: String,
  colunas: [{ key: String, label: String, tipo: String }],
  niveis: mongoose.Schema.Types.Mixed,
}, { collection: 'doa_edificios' });

const DragaoSchema = new mongoose.Schema({
  nome: String, slug: String, elemento: String, emoji: String,
  emojiDragao: String, raridade: String, cor: String,
  niveis: [{
    nivel: Number, xpNecessaria: Number,
    vida: Number, defesa: Number, ataquePerto: Number, ataqueDistante: Number,
    alcance: Number, velocidade: Number,
    ataqueElemental: Number, impulsoElemental: Number, barreiraElemental: Number,
    bombardeioElemental: Number, confrontoElemental: Number,
    bloqueioElemental: Number, rupturaElemental: Number,
  }],
}, { collection: 'doa_dragoes' });

const PesquisaSchema = new mongoose.Schema({
  nome: String, slug: String, icone: String, descricao: String,
  categoria: String, nivelMax: Number, ordem: Number,
  niveis: [{ nivel: Number, tempo: String }],
}, { collection: 'doa_pesquisas' });

const NivelSchema = new mongoose.Schema({
  nivel: Number, xp: Number,
}, { collection: 'doa_niveis' });

const ReinoSchema = new mongoose.Schema({
  id: Number, slug: String, nome: String,
  fuso: String, regiao: String, idioma: String,
}, { collection: 'doa_reinos' });

// ── Dados estáticos de aprimoramento (não vêm do MongoDB) ─────────────────────
const APRIMORAMENTO = {
  raridades: ['Incomum', 'Raro', 'Épico', 'Lendário', 'Mitológico'],
  custoBase: [5, 8, 12, 18, 30], // fósseis por nível (ciclo de 5)
  multiplicadores: {
    fosseis:   { Incomum: 1, Raro: 2,  Épico: 4, Lendário: 8,  Mitológico: 15 },
    pocoes:    { Incomum: 0, Raro: 1,  Épico: 2, Lendário: 4,  Mitológico: 8  },
    reliquias: { Incomum: 0, Raro: 0,  Épico: 1, Lendário: 2,  Mitológico: 4  },
  },
  atributos: [
    { nome: 'Vida',                 tipo: 'ofensivo',  desc: 'Aumenta a vida da tropa.' },
    { nome: 'Ataque Elemental',     tipo: 'ofensivo',  desc: 'Ataques causam dano elemental extra.' },
    { nome: 'Impulso Elemental',    tipo: 'ofensivo',  contra: 'Barreira Elemental',   desc: 'Aumenta o dano elemental. Combatido pela Barreira Elemental.' },
    { nome: 'Barreira Elemental',   tipo: 'defensivo', contra: 'Impulso Elemental',    desc: 'Reduz dano elemental recebido. Combatido pelo Impulso Elemental.' },
    { nome: 'Bombardeio Elemental', tipo: 'ofensivo',  contra: 'Confronto Elemental',  desc: 'Dano crítico elemental de 250%. Combatido pelo Confronto Elemental.' },
    { nome: 'Confronto Elemental',  tipo: 'defensivo', contra: 'Bombardeio Elemental', desc: 'Reduz chance de críticos elementais recebidos.' },
    { nome: 'Bloqueio Elemental',   tipo: 'defensivo', contra: 'Ruptura Elemental',    desc: 'Chance de bloquear 60% do dano elemental.' },
    { nome: 'Ruptura Elemental',    tipo: 'ofensivo',  contra: 'Bloqueio Elemental',   desc: 'Reduz a chance de bloqueio do alvo.' },
  ],
  categorias: [
    { cat: 1, tropas: 'Minotauros, Arqueiros, Dragões de Ataque Rápido' },
    { cat: 2, tropas: 'Dragões de Combate' },
    { cat: 3, tropas: 'Andarilhos da Areia, Hoplitas' },
    { cat: 4, tropas: 'Gigantes, Abissais, Terrores do Pântano' },
    { cat: 5, tropas: 'Espelhos de Fogo, Bigas de Fogo, Serpente Vingativa, Canhão Elétrico, Amarande' },
    { cat: 6, tropas: 'Ogro de Granito, Serpente Arsênica, Dragonete da Tempestade, Magmassauros, Guerreiro do Magma' },
    { cat: 7, tropas: 'Titã Petrificado, Dragão do Veneno, Golem do Trovão, Gigante do Gelo, Leviatã Ártico, Cavaleiro Dragão, Centauros Infernais, Condenadores, Cavaleiros Espectrais' },
    { cat: 8, tropas: 'Perseguidor das Sombras, Escaravelho de Guerra, Arruinador Dimensional, Megalibgwilia, Medusa, Gatuno Alado' },
    { cat: 9, tropas: 'Esmagadores Colossais, Fantasma do Trovão, Lordes da Lava' },
  ],
};

// Calcula custo de aprimoramento para um intervalo de níveis
const calcCustoApr = (raridade, nivelDe, nivelAte) => {
  const mF = APRIMORAMENTO.multiplicadores.fosseis[raridade]   || 0;
  const mP = APRIMORAMENTO.multiplicadores.pocoes[raridade]    || 0;
  const mR = APRIMORAMENTO.multiplicadores.reliquias[raridade] || 0;
  let f = 0, p = 0, r = 0;
  for (let n = nivelDe; n <= nivelAte; n++) {
    const base = APRIMORAMENTO.custoBase[(n - 1) % 5];
    f += base * mF; p += base * mP; r += base * mR;
  }
  return { fosseis: f, pocoes: p, reliquias: r };
};

// ── Busca todos os dados do MongoDB ──────────────────────────────────────────
const buildContext = async () => {
  try {
    const [tropas, itens, edificios, dragoes, pesquisas, niveis, reinos] = await Promise.all([
      mdl('AssT', TropaSchema,    'doa_tropas').find({}).lean(),
      mdl('AssI', ItemSchema,     'doa_itens').find({}).lean(),
      mdl('AssE', EdificioSchema, 'doa_edificios').find({}).lean(),
      mdl('AssD', DragaoSchema,   'doa_dragoes').find({}).lean(),
      mdl('AssP', PesquisaSchema, 'doa_pesquisas').find({}).sort({ categoria: 1, ordem: 1 }).lean(),
      mdl('AssN', NivelSchema,    'doa_niveis').find({}).sort({ nivel: 1 }).lean(),
      mdl('AssR', ReinoSchema,    'doa_reinos').find({}).sort({ id: 1 }).lean(),
    ]);

    // ── TROPAS ────────────────────────────────────────────────────────────────
    const tropasTxt = tropas.length
      ? [...tropas].sort((a, b) => (b.poder || 0) - (a.poder || 0)).map((t, i) => {
          const combate = t.combate === 'distancia' ? 'Distância' : 'Corpo a Corpo';
          const flags   = [t.rapida && 'Rápida', t.tipo === 'especial' && 'Especial'].filter(Boolean).join(' · ');
          return (
            `${i + 1}. **${t.nome}** [${combate}${flags ? ' · ' + flags : ''}]\n` +
            `   Poder:${t.poder ?? 0} | Vida:${t.vida ?? 0} | Def:${t.def ?? 0} | ` +
            `AtqPerto:${t.atqPerto ?? 0} | AtqDist:${t.atqDist ?? 0}\n` +
            `   Alcance:${t.alcance ?? 0} | Vel:${t.vel ?? 0} | Carga:${t.car ?? 0} | Gestão:${t.gestao ?? 0}` +
            (t.desc ? `\n   Habilidade: ${t.desc}` : '')
          );
        }).join('\n\n')
      : 'Nenhuma tropa cadastrada.';

    // ── ITENS ─────────────────────────────────────────────────────────────────
    const itensTxt = itens.length
      ? itens.map(i =>
          `• **${i.nome}**` +
          (i.descricao ? `: ${i.descricao}` : '') +
          (i.onde      ? ` | Onde obter: ${i.onde}` : '')
        ).join('\n')
      : 'Nenhum item cadastrado.';

    // ── EDIFÍCIOS — tabela completa de níveis ─────────────────────────────────
    const edificiosTxt = edificios.length
      ? edificios.map(e => {
          const niveisArr = Array.isArray(e.niveis) ? e.niveis : [];
          const cols      = e.colunas || [];
          const tabelaNiveis = niveisArr.length && cols.length
            ? '\n  Níveis:\n' + niveisArr.map(n =>
                `    Nv${n.nivel}: ` + cols.map(c => `${c.label}:${n[c.key] ?? '?'}`).join(' | ')
              ).join('\n')
            : '';
          return (
            `• **${e.nome}**${e.tag ? ` [${e.tag}]` : ''}` +
            (e.descricao ? ` — ${e.descricao}` : '') +
            tabelaNiveis
          );
        }).join('\n\n')
      : 'Nenhum edifício cadastrado.';

    // ── DRAGÕES — todos os níveis ─────────────────────────────────────────────
    const dragoesTxt = dragoes.length
      ? dragoes.map(d => {
          const nArr = Array.isArray(d.niveis) ? d.niveis : [];
          const tabelaNiveis = nArr.length
            ? '\n  Níveis:\n' + nArr.map(n =>
                `    Nv${n.nivel}` +
                (n.xpNecessaria ? ` (XP:${n.xpNecessaria.toLocaleString('pt-BR')})` : '') +
                ` | Vida:${n.vida ?? 0} | Def:${n.defesa ?? 0} | AtqPerto:${n.ataquePerto ?? 0}` +
                ` | AtqDist:${n.ataqueDistante ?? 0} | Elemental:${n.ataqueElemental ?? 0}`
              ).join('\n')
            : '';
          return (
            `• **${d.nome}**` +
            (d.elemento ? ` [${d.elemento}]` : '') +
            (d.raridade ? ` — ${d.raridade}` : '') +
            tabelaNiveis
          );
        }).join('\n\n')
      : 'Nenhum dragão cadastrado.';

    // ── PESQUISAS — agrupadas com todos os tempos ─────────────────────────────
    const pesquisasTxt = pesquisas.length
      ? (() => {
          const grupos = {};
          pesquisas.forEach(p => {
            const cat = p.categoria || 'Geral';
            if (!grupos[cat]) grupos[cat] = [];
            const niveisInfo = (p.niveis || []).length
              ? ` | Tempos: ${p.niveis.map(n => `Nv${n.nivel}=${n.tempo || '?'}`).join(', ')}`
              : '';
            grupos[cat].push(`  • **${p.nome}** (máx Nv${p.nivelMax ?? '?'})${niveisInfo}`);
          });
          return Object.entries(grupos)
            .map(([cat, lista]) => `[${cat}]\n${lista.join('\n')}`)
            .join('\n\n');
        })()
      : 'Nenhuma pesquisa cadastrada.';

    // ── NÍVEIS DO CASTELO ─────────────────────────────────────────────────────
    const niveisTxt = niveis.length
      ? niveis.map(n =>
          `  Nv${n.nivel}: ${n.xp != null ? n.xp.toLocaleString('pt-BR') + ' XP' : 'desconhecido'}`
        ).join('\n')
      : 'Tabela de níveis não cadastrada.';

    // ── REINOS ────────────────────────────────────────────────────────────────
    const reinosTxt = reinos.length
      ? reinos.map(r =>
          `  Reino ${r.id} — ${r.nome}` +
          (r.regiao ? ` | ${r.regiao}` : '') +
          (r.fuso   ? ` | ${r.fuso}` : '') +
          (r.idioma ? ` | ${r.idioma}` : '')
        ).join('\n')
      : 'Nenhum reino cadastrado.';

    // ── APRIMORAMENTO ─────────────────────────────────────────────────────────
    const aprTxt =
      `Raridades (em ordem): ${APRIMORAMENTO.raridades.join(' → ')}\n\n` +
      `Custo por nível (ciclo base de 5 atributos): ${APRIMORAMENTO.custoBase.join(', ')} fósseis\n` +
      `Multiplicadores de fósseis por raridade: ` +
        Object.entries(APRIMORAMENTO.multiplicadores.fosseis).map(([r, v]) => `${r}:x${v}`).join(' | ') + '\n' +
      `Multiplicadores de poções: ` +
        Object.entries(APRIMORAMENTO.multiplicadores.pocoes).map(([r, v]) => `${r}:x${v}`).join(' | ') + '\n' +
      `Multiplicadores de relíquias: ` +
        Object.entries(APRIMORAMENTO.multiplicadores.reliquias).map(([r, v]) => `${r}:x${v}`).join(' | ') + '\n\n' +
      `Atributos disponíveis:\n` +
        APRIMORAMENTO.atributos.map(a =>
          `  • ${a.nome} [${a.tipo}]${a.contra ? ` — contra: ${a.contra}` : ''}: ${a.desc}`
        ).join('\n') + '\n\n' +
      `Categorias de tropas para aprimoramento:\n` +
        APRIMORAMENTO.categorias.map(c =>
          `  Categoria ${c.cat}: ${c.tropas}`
        ).join('\n') + '\n\n' +
      `Exemplos de custo total calculado:\n` + [
        ['Épico', 1, 5], ['Épico', 1, 10], ['Lendário', 1, 5], ['Lendário', 1, 10], ['Mitológico', 1, 5],
      ].map(([r, de, ate]) => {
        const c = calcCustoApr(r, de, ate);
        return `  ${r} Nv${de}→${ate}: ${c.fosseis} fósseis | ${c.pocoes} poções | ${c.reliquias} relíquias`;
      }).join('\n');

    return { tropasTxt, itensTxt, edificiosTxt, dragoesTxt, pesquisasTxt, niveisTxt, reinosTxt, aprTxt, tropasDados: tropas };
  } catch (e) {
    console.error('[assistente] erro contexto:', e.message);
    return { tropasTxt:'', itensTxt:'', edificiosTxt:'', dragoesTxt:'', pesquisasTxt:'', niveisTxt:'', reinosTxt:'', aprTxt:'', tropasDados:[] };
  }
};

// ── Mapa de atributos: variações de linguagem natural → campo no banco ─────────
const ATTR_MAP = {
  // velocidade
  vel: ['velocidade','veloc','vel','veloz','rápid','rapida','rapido','corre','corr','ágil','agil','mais rápida','mais veloz','maior velocidade','que corre mais','que é mais rápid'],
  // vida / HP
  vida: ['vida','hp','life','aguenta','resiste','dura mais','mais vida','maior vida','mais hp','com mais vida'],
  // defesa
  def: ['defes','defen','resist','blindagem','mais defesa','maior defesa','mais resistente','tankea','tanka'],
  // ataque perto
  atqPerto: ['ataque perto','atq perto','corpo a corpo','melee','cac','dano perto','ataque corpo','bate mais perto','mais dano corpo'],
  // ataque distância
  atqDist: ['ataque dist','atq dist','distância','distancia','ranged','tiro','flecha','arco','atirador','dano dist','mais dano dist','ataque à distância'],
  // dano geral (max entre perto e dist)
  dano: ['dano','causa mais dano','mais dano','maior dano','ataque total','mais destrutiv','mais forte no ataque','ataca mais','bate mais'],
  // carga
  car: ['carga','car','carrega','capacidade','coleta','loot','recursos','pilhagem','mais carga','maior carga','mais recursos'],
  // alcance
  alcance: ['alcance','range','atirar mais longe','maior alcance','mais longe'],
  // gestão
  gestao: ['gestão','gestao','liderança','lideranca','comanda','mais tropas','maior gestão'],
  // poder
  poder: ['poder','mais poder','maior poder','mais poderosa','mais forte'],
};

// Detecta qual atributo e que tipo de análise o usuário quer
const detectarAnalise = (pergunta) => {
  const p = pergunta.toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, ''); // remove acentos para comparação

  // Detecta atributo
  let attrId = null;
  for (const [id, termos] of Object.entries(ATTR_MAP)) {
    if (termos.some(t => p.includes(t.normalize('NFD').replace(/\p{Diacritic}/gu, '')))) {
      attrId = id; break;
    }
  }
  if (!attrId) return null;

  // Detecta intenção analítica
  const top = p.match(/top\s*(\d+)|(\d+)\s*(mais|tropas?|melhores?|primeiras?)/i);
  const topN = top ? parseInt(top[1] || top[2]) : null;
  const isRanking  = /ordena|ranking|lista|classifica|rank/.test(p);
  const isComp     = /compara|versus|vs\b|melhor.*(x|ou)|diferenca|diferença/.test(p);
  const isFiltro   = /acima de|abaixo de|maior que|menor que|mais de|menos de|com\s+(\d+)|superior|inferior/.test(p);
  const isMin      = /menor|mais lenta?|pior|menos|minimo|mínimo|mais fraca?/.test(p);

  // Extrai nomes de tropas para comparação
  const nomesTropas = [];
  const compMatch = pergunta.match(/compar[ae]\s+(.+)/i) || pergunta.match(/(.+)\s+(?:versus?|vs\.?|x)\s+(.+)/i);
  if (compMatch) {
    const partes = compMatch[0].split(/versus?|vs\.?|\bx\b|,|\be\b/i).map(s =>
      s.replace(/compar[ae]/i, '').trim()
    ).filter(s => s.length > 1);
    nomesTropas.push(...partes);
  }

  // Extrai valor numérico para filtros
  const valorFiltro = parseFloat((p.match(/(\d+(?:[.,]\d+)?)\s*(?:de|pt|km|m)?/)?.[1] || '').replace(',', '.'));

  return { attrId, topN, isRanking, isComp, isFiltro, isMin, nomesTropas, valorFiltro };
};

// Resolve "dano" como max(atqPerto, atqDist)
const getAttrVal = (t, attrId) => {
  if (attrId === 'dano') return Math.max(t.atqPerto || 0, t.atqDist || 0);
  return t[attrId] || 0;
};

const ATTR_LABELS = {
  vel:'Velocidade', vida:'Vida', def:'Defesa', atqPerto:'Ataque Perto',
  atqDist:'Ataque Dist.', dano:'Dano', car:'Carga', alcance:'Alcance',
  gestao:'Gestão', poder:'Poder',
};

// Gera contexto analítico pré-calculado para passar ao LLM
const buildContextoAnalitico = (tropas, analise) => {
  if (!tropas.length || !analise) return '';
  const { attrId, topN, isRanking, isComp, isFiltro, isMin, nomesTropas, valorFiltro } = analise;
  const label = ATTR_LABELS[attrId];

  let linhas = [];

  if (isComp && nomesTropas.length >= 1) {
    // Comparação entre tropas específicas
    const encontradas = nomesTropas.map(nome => {
      const n = nome.toLowerCase();
      return tropas.find(t => t.nome.toLowerCase().includes(n));
    }).filter(Boolean);

    if (encontradas.length >= 1) {
      linhas.push(`📊 COMPARAÇÃO — ${label}:`);
      encontradas.forEach(t => {
        const v = getAttrVal(t, attrId);
        linhas.push(`  • ${t.nome}: ${label}=${v} | Poder=${t.poder} | Vida=${t.vida} | Def=${t.def} | AtqPerto=${t.atqPerto} | AtqDist=${t.atqDist} | Vel=${t.vel} | Carga=${t.car}`);
      });
      const melhor = encontradas.reduce((a, b) => getAttrVal(a, attrId) >= getAttrVal(b, attrId) ? a : b);
      linhas.push(`  ✅ Maior ${label}: ${melhor.nome} (${getAttrVal(melhor, attrId)})`);
      return linhas.join('\n');
    }
  }

  if (isFiltro && valorFiltro > 0) {
    // Filtro por valor numérico
    const filtradas = tropas
      .filter(t => isMin
        ? getAttrVal(t, attrId) < valorFiltro
        : getAttrVal(t, attrId) > valorFiltro
      )
      .sort((a, b) => getAttrVal(b, attrId) - getAttrVal(a, attrId));
    linhas.push(`📊 TROPAS COM ${label} ${isMin ? '<' : '>'} ${valorFiltro} (total: ${filtradas.length}):`);
    filtradas.slice(0, 20).forEach((t, i) => {
      linhas.push(`  ${i+1}. ${t.nome}: ${label}=${getAttrVal(t, attrId)}`);
    });
    return linhas.join('\n');
  }

  // Top N ou a melhor/pior
  const sorted = [...tropas].sort((a, b) =>
    isMin
      ? getAttrVal(a, attrId) - getAttrVal(b, attrId)
      : getAttrVal(b, attrId) - getAttrVal(a, attrId)
  ).filter(t => getAttrVal(t, attrId) > 0 || attrId === 'vida');

  const n = topN || (isRanking ? 10 : 1);
  const titulo = isMin
    ? `📊 ${n > 1 ? `TOP ${n} MENORES` : 'MENOR'} ${label.toUpperCase()}:`
    : `📊 ${n > 1 ? `TOP ${n} MAIORES` : 'MAIOR'} ${label.toUpperCase()}:`;
  linhas.push(titulo);
  sorted.slice(0, n).forEach((t, i) => {
    const v = getAttrVal(t, attrId);
    linhas.push(`  ${i+1}. ${t.nome}: ${label}=${v} | Poder=${t.poder}`);
  });
  return linhas.join('\n');
};

// ── Detecta intenção da pergunta para personalizar foco do sistema ─────────────
const detectarIntencao = (pergunta) => {
  const p = pergunta.toLowerCase();
  if (/aprimoramento|aperfei|fóssil|fosseil|raridade|incomum|raro|épico|lendário|mitológico|atributo elemental|bloqueio|ruptura|barreira|bombardeio|impulso|confronto/.test(p)) return 'aprimoramento';
  if (/torneio|pontos?|pontua|carneiro|boi|frango|veado|salmão|lagosta|aceleraç|talismã|fóssil|poção|matar trop|abat|general/.test(p)) return 'torneio';
  if (/pesquisa|árvore do conhecimento|tempo de pesquisa|categoria de pesquisa/.test(p)) return 'pesquisa';
  if (/dragão|dragao|dragon|elemento|raridade do dragão/.test(p)) return 'dragao';
  if (/edifício|edificio|fazenda|casa|mina|pedreira|serraria|fortaleza|fonte|sentinela|viveiro|fábrica|pérola/.test(p)) return 'edificio';
  if (/tropa|poder|vida|defesa|velocidade|alcance|carga|combate|corpo a corpo|distância|mais rápid|mais veloz|mais fort|maior ataque|maior vida|maior defesa|maior carga|maior alcance|mais dano|compara/.test(p)) return 'tropa';
  if (/nível|nivel|xp|poder necessário|castelo/.test(p)) return 'nivel';
  if (/reino|fuso|região|idioma/.test(p)) return 'reino';
  if (/ilha|savana|fazenda de pérola|guarnição|expansão/.test(p)) return 'ilha';
  return 'geral';
};

// ── POST /api/assistente ──────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { pergunta, historico = [] } = req.body;

  if (!pergunta || typeof pergunta !== 'string' || pergunta.trim().length < 2)
    return res.status(400).json({ erro: 'Pergunta inválida.' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey)
    return res.status(500).json({ erro: 'Chave da API não configurada.' });

  const { tropasTxt, itensTxt, edificiosTxt, dragoesTxt, pesquisasTxt, niveisTxt, reinosTxt, aprTxt, tropasDados } =
    await buildContext();

  const intencao = detectarIntencao(pergunta);

  // ── Análise pré-calculada para perguntas analíticas de tropas ─────────────
  // Reutiliza tropasDados já carregadas pelo buildContext (sem 2ª query ao banco)
  const analise = detectarAnalise(pergunta);
  const contextoAnalitico = (analise && tropasDados.length)
    ? buildContextoAnalitico(tropasDados, analise)
    : '';

  // ── Blocos de contexto relevantes por intenção ────────────────────────────
  const blocos = {
    tropa:        `━━ ⚔️ TROPAS (por poder):\n${tropasTxt}`,
    dragao:       `━━ 🐉 DRAGÕES (stats por nível):\n${dragoesTxt}`,
    edificio:     `━━ 🏗️ EDIFÍCIOS (tabela de níveis):\n${edificiosTxt}`,
    pesquisa:     `━━ 🔬 PESQUISAS (com tempos):\n${pesquisasTxt}`,
    nivel:        `━━ 🏰 NÍVEIS DO CASTELO:\n${niveisTxt}`,
    reino:        `━━ 🌍 REINOS:\n${reinosTxt}`,
    aprimoramento:`━━ 🔮 APRIMORAMENTO DE TROPAS:\n${aprTxt}`,
    item:         `━━ 🎒 ITENS:\n${itensTxt}`,
    torneio:      '',
    ilha:         '',
    geral:        '',
  };

  const blocosAtivos = intencao === 'geral'
    ? [blocos.tropa, blocos.dragao, blocos.edificio, blocos.pesquisa, blocos.nivel, blocos.reino, blocos.aprimoramento, blocos.item]
    : intencao === 'torneio'
    ? [blocos.tropa, blocos.item, blocos.aprimoramento]
    : [blocos[intencao], blocos.item].filter(Boolean);

  // Injeta análise pré-calculada no topo quando disponível
  const blocoAnalitico = contextoAnalitico
    ? `━━ 📊 ANÁLISE JÁ CALCULADA (use estes dados como resposta base):\n${contextoAnalitico}\n`
    : '';

  const systemPrompt = `Você é o CONSELHEIRO TÁTICO do Guia DOA — especialista em Dragon's of Aether (DOA). Você conhece tropas, dragões, edifícios, pesquisas, aprimoramentos, torneios, generais, ilhas e reinos.

━━ REGRAS:
1. Responda SEMPRE em português brasileiro informal e amigável.
2. Use os DADOS DO BANCO abaixo como fonte primária. Se não estiver nos dados, diga claramente.
3. Quando houver uma seção "📊 ANÁLISE JÁ CALCULADA", use esses resultados diretamente — eles já foram calculados e ordenados pelos dados reais do banco. Apresente-os de forma clara e amigável, sem recalcular.
4. Para CÁLCULOS — calcule diretamente com os números reais (ex: "50 lagostas = 50 × 5.000 = 250.000 pts").
5. Para COMPARAÇÕES — analise números, justifique e dê recomendação clara.
6. Para APRIMORAMENTO — use a tabela de custos e multiplicadores exatos.
7. Para ESTRATÉGIAS — passos concretos, nunca genéricos.
8. Use emojis para organizar (⚔️ 🐉 💡 ⚠️ 📊 🎯 🔬 🏰 🔮).
9. Seja direto. Máximo 6 parágrafos ou 10 itens.
10. NUNCA invente dados. Se não souber, diga explicitamente.

${blocoAnalitico}${blocosAtivos.join('\n\n')}

━━ 🏆 TORNEIOS — PONTUAÇÕES EXATAS:
▸ TREINO DE TROPAS: Qtd × Poder da Tropa × Bônus (x1/x2/x3/x4/x5). Sempre use bônus máximo disponível.
▸ TREINAMENTO DO DRAGÃO (carnes): Carneiro=100 | Boi=200 | Frango=500 | Veado=1.000 | Salmão=2.000 | Lagosta=5.000 pts
  Obtidas: Savanas nv1-10 (3 carneiros+2 bois+3 frangos/dia), missões, Loja de Surpresas, rubis.
▸ HABILIDADE DO DRAGÃO: Essência da Fúria = 100 pts/un. Fonte: Antropos nv10, Florestas nv10, Bastião, Expedição.
▸ TALISMÃS: Verde=20 | Azul=30 | Roxo=800 | Laranja=12.000 pts. Torre de Oração: 3/dia (aleatórios).
▸ EVOLUÇÃO DE TROPAS (fósseis): A cada 10 fósseis usados = 1 ponto. Fonte: Antropos nv1-10 → Lembranças Antigas → Loja.
▸ MATAR TROPAS: pontos por abates. Tática: trocar tropas fracas com aliados e se atacar mutuamente.
▸ TORNEIO DE CONHECIMENTO: Poção Primária=10 | Intermediária=30 | Superior=50 pts
▸ ACELERAÇÕES: Qtd × Minutos = pts. (1min=1pt, 1h=60pts, 1dia=1440pts, 2dias=2880pts, 4dias=5760pts)
▸ APRIMORAMENTO DE GENERAL: XP ganho pelos generais. Guarde cartas durante a semana, use em massa.
▸ ALIANÇA — Poder: treinar tropas+pesquisas+evoluir dragões. Atual: alimentar dragões+ajudar aliados.

━━ 🗺️ MECÂNICAS:
• Savanas nv1-10: 3 carneiros+2 bois+3 frangos/dia por savana
• Antropos nv1-10: Lembranças Antigas e Essências da Fúria
• Torre de Oração: 3 talismãs aleatórios/dia
• Loja de Surpresas: troca Lembranças Antigas por fósseis e itens raros
• Quartel do General: treinamento com cartas de XP
• Bastião dos Dragões + Expedição do Dragão: Essências da Fúria
• Ilhas (Principal, Fogo, Água, Bella, Terra): cada uma tem Casas, Fontes, Guarnições, Fazendas, Minas, Pedreiras, Serrarias, Fazendas de Pérolas. Ilhas Fogo/Bella/Terra precisam ser desbloqueadas.
• Rubis: moeda premium para carnes, talismãs, fósseis, acelerações

━━ 🔮 APRIMORAMENTO DE TROPAS (resumo):
${aprTxt}`;

  const mensagens = [
    ...historico.slice(-20).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: pergunta.trim() },
  ];

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...mensagens],
        max_tokens: 1400,
        temperature: 0.35,
        top_p: 0.85,
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('[assistente] Groq erro:', err);
      return res.status(502).json({ erro: 'Erro ao consultar o assistente. Tente novamente.' });
    }

    const data = await groqRes.json();
    const resposta = data.choices?.[0]?.message?.content?.trim() || 'Não consegui gerar uma resposta.';

    // Devolve também a intenção detectada para debug (opcional)
    res.json({ resposta, intencao });
  } catch (e) {
    console.error('[assistente] fetch error:', e.message);
    res.status(502).json({ erro: 'Falha na conexão com o assistente.' });
  }
});

export default router;
