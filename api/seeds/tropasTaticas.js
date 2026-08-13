const UNLOCKS = {
  'Transportes Blindados': { tipo:'edificio', fonte:'Fábrica', nivel:6, observacao:'A Fábrica libera o treinamento desta unidade.' },
  'Gigantes': { tipo:'edificio', fonte:'Fábrica', nivel:14, observacao:'A Fábrica libera o treinamento desta unidade.' },
  'Espelhos de Fogo': { tipo:'edificio', fonte:'Fábrica', nivel:18, observacao:'A Fábrica libera o treinamento desta unidade.' },
  'Dragonetes da Tempestade': { tipo:'edificio', fonte:'Fábrica', nivel:21, observacao:'A Fábrica libera o treinamento desta unidade.' },
  'Canhões Elétricos': { tipo:'edificio', fonte:'Fábrica', nivel:24, observacao:'A Fábrica libera o treinamento desta unidade.' },
  'Serpente Vingativa': { tipo:'edificio', fonte:'Fábrica', nivel:27, observacao:'A Fábrica libera o treinamento desta unidade.' },
  'Magmassauros': { tipo:'edificio', fonte:'Fábrica', nivel:30, observacao:'A Fábrica libera o treinamento desta unidade.' },
  'Dragão do Veneno': { tipo:'edificio', fonte:'Viveiro', nivel:25, observacao:'O Viveiro libera o treinamento desta unidade.' },
  'Cavaleiro Dragão': { tipo:'edificio', fonte:'Viveiro', nivel:30, observacao:'O Viveiro libera o treinamento desta unidade.' },
};

const EN_UNLOCKS = {
  'Transportes Blindados': { desbloqueioFonte:'Factory', desbloqueioObservacao:'The Factory unlocks training for this unit.' },
  'Gigantes': { desbloqueioFonte:'Factory', desbloqueioObservacao:'The Factory unlocks training for this unit.' },
  'Espelhos de Fogo': { desbloqueioFonte:'Factory', desbloqueioObservacao:'The Factory unlocks training for this unit.' },
  'Dragonetes da Tempestade': { desbloqueioFonte:'Factory', desbloqueioObservacao:'The Factory unlocks training for this unit.' },
  'Canhões Elétricos': { desbloqueioFonte:'Factory', desbloqueioObservacao:'The Factory unlocks training for this unit.' },
  'Serpente Vingativa': { desbloqueioFonte:'Factory', desbloqueioObservacao:'The Factory unlocks training for this unit.' },
  'Magmassauros': { desbloqueioFonte:'Factory', desbloqueioObservacao:'The Factory unlocks training for this unit.' },
  'Dragão do Veneno': { desbloqueioFonte:'Nursery', desbloqueioObservacao:'The Nursery unlocks training for this unit.' },
  'Cavaleiro Dragão': { desbloqueioFonte:'Nursery', desbloqueioObservacao:'The Nursery unlocks training for this unit.' },
};

function combat(t) {
  return (Number(t.atqDist) || 0) > (Number(t.atqPerto) || 0) ? 'distancia' : 'corpo_a_corpo';
}

function category(t) {
  const n = String(t.nome || '').toLowerCase();
  if (/drag[aã]o|dragonete/.test(n)) return 'dragao';
  if (/arqueir|mago|espelho|canh[aã]o/.test(n)) return 'distancia';
  if (/cavaleir|biga|centauro|montad/.test(n)) return 'cavalaria';
  if (/transporte|carregador|escev/.test(n)) return 'transporte';
  if (/gigante|ogro|golem|tit[aã]|minotauro/.test(n)) return 'pesada';
  if (t.tipo === 'especial') return 'outro';
  return 'infantaria';
}

function roles(t) {
  const attack = Math.max(Number(t.atqPerto) || 0, Number(t.atqDist) || 0);
  const durability = (Number(t.vida) || 0) / 4 + (Number(t.def) || 0) * 2;
  const load = Number(t.car) || 0;
  const out = [];
  if (attack >= durability * .65 || attack >= 1800) out.push('ataque');
  if (durability >= attack * 1.35 || (Number(t.def) || 0) >= 900) out.push('defesa');
  if (load >= 700) out.push('farming');
  if (!out.length) out.push('equilibrada');
  return out;
}

export function tacticalMetadata(tropa) {
  const unlock = UNLOCKS[tropa.nome] || null;
  const en = EN_UNLOCKS[tropa.nome] || null;
  return {
    combate: combat(tropa),
    categoria: category(tropa),
    funcoes: roles(tropa),
    ...(unlock ? { desbloqueio: unlock } : {}),
    ...(en ? { i18nUnlock: en } : {}),
    taxonomiaVersao: 1,
  };
}

export { UNLOCKS };
