export const detectarIntencao = (pergunta) => {
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
