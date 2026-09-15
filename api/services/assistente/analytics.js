const ATTR_MAP = {
  // velocidade
  vel: ['speed','fast','fastest','velocity','velocidade','veloc','vel','veloz','rápid','rapida','rapido','corre','corr','ágil','agil','mais rápida','mais veloz','maior velocidade','que corre mais','que é mais rápid'],
  // vida / HP
  vida: ['vida','hp','life','aguenta','resiste','dura mais','mais vida','maior vida','mais hp','com mais vida'],
  // defesa
  def: ['defense','defence','armor','resistance','defes','defen','resist','blindagem','mais defesa','maior defesa','mais resistente','tankea','tanka'],
  // ataque perto
  atqPerto: ['ataque perto','atq perto','corpo a corpo','melee','cac','dano perto','ataque corpo','bate mais perto','mais dano corpo'],
  // ataque distância
  atqDist: ['ataque dist','atq dist','distância','distancia','ranged','tiro','flecha','arco','atirador','dano dist','mais dano dist','ataque à distância'],
  // dano geral (max entre perto e dist)
  dano: ['dano','causa mais dano','mais dano','maior dano','ataque total','mais destrutiv','mais forte no ataque','ataca mais','bate mais'],
  // carga
  car: ['load','carry','capacity','resources','loot','carga','car','carrega','capacidade','coleta','loot','recursos','pilhagem','mais carga','maior carga','mais recursos'],
  // alcance
  alcance: ['alcance','range','atirar mais longe','maior alcance','mais longe'],
  // gestão
  gestao: ['gestão','gestao','liderança','lideranca','comanda','mais tropas','maior gestão'],
  // poder
  poder: ['power','strongest','most powerful','poder','mais poder','maior poder','mais poderosa','mais forte'],
};

// Detecta qual atributo e que tipo de análise o usuário quer
export const detectarAnalise = (pergunta) => {
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
  const top = p.match(/top\s*(\d+)|(\d+)\s*(mais|tropas?|melhores?|primeiras?|best|troops?)/i);
  const topN = top ? parseInt(top[1] || top[2]) : null;
  const isRanking  = /ordena|ranking|lista|classifica|rank/.test(p);
  const isComp     = /compara|compare|versus|vs\b|melhor.*(x|ou)|better.*(x|or)|diferenca|diferença|difference/.test(p);
  const isFiltro   = /acima de|abaixo de|maior que|menor que|mais de|menos de|com\s+(\d+)|superior|inferior/.test(p);
  const isMin      = /menor|mais lenta?|pior|menos|minimo|mínimo|mais fraca?|lowest|slowest|worst|least|minimum|weakest/.test(p);

  // Extrai nomes de tropas para comparação
  const nomesTropas = [];
  const compMatch = pergunta.match(/(?:compar[ae]|compare)\s+(.+)/i) || pergunta.match(/(.+)\s+(?:versus?|vs\.?|x)\s+(.+)/i);
  if (compMatch) {
    const partes = compMatch[0].split(/versus?|vs\.?|\bx\b|,|\be\b/i).map(s =>
      s.replace(/compar[ae]|compare/i, '').trim()
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
export const buildContextoAnalitico = (tropas, analise) => {
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
