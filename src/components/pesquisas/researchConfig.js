export const RESEARCH_FILTERS = [
  { id:'all', key:'research.filter.all' },
  { id:'production', key:'research.filter.production' },
  { id:'movement', key:'research.filter.movement' },
  { id:'combat', key:'research.filter.combat' },
];

export function matchesResearchFilter(pesquisa, filtro) {
  if (filtro === 'all') return true;
  if (filtro === 'production') return pesquisa.categoria === 'Produção';
  if (filtro === 'movement') return pesquisa.categoria === 'Movimento e Construção';
  if (filtro === 'combat') return pesquisa.categoria === 'Corpo a Corpo' || pesquisa.categoria === 'Ataque à Distância';
  return true;
}
