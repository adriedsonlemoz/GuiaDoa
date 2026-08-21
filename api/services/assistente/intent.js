export const detectarIntencao = (pergunta) => {
  const p = pergunta.toLowerCase();
  if (/aprimoramento|aperfei|fóssil|fosseil|raridade|incomum|raro|épico|lendário|mitológico|atributo elemental|bloqueio|ruptura|barreira|bombardeio|impulso|confronto|enhance|enhancement|fossil|rarity|uncommon|rare|epic|legendary|mythic/.test(p)) return 'aprimoramento';
  if (/torneio|pontos?|pontua|carneiro|boi|frango|veado|salmão|lagosta|aceleraç|talismã|fóssil|poção|matar trop|abat|general|tournament|points?|ram|beef|chicken|deer|salmon|lobster|speed.?up|talisman|potion|kill troops?/.test(p)) return 'torneio';
  if (/pesquisa|árvore do conhecimento|tempo de pesquisa|categoria de pesquisa|research|knowledge tree|research time/.test(p)) return 'pesquisa';
  if (/dragão|dragao|dragon|elemento|raridade do dragão|element|dragon rarity/.test(p)) return 'dragao';
  if (/edifício|edificio|fazenda|casa|mina|pedreira|serraria|fortaleza|fonte|sentinela|viveiro|fábrica|pérola|gruta|basílica|basilica|órbita espiritual|orbita espiritual|pedra espiritual|building|farm|house|mine|quarry|sawmill|fortress|spring|sentinel|nursery|factory|pearl|cave|spirit orb|spirit stone/.test(p)) return 'edificio';
  if (/tropa|poder|vida|defesa|velocidade|alcance|carga|combate|corpo a corpo|distância|mais rápid|mais veloz|mais fort|maior ataque|maior vida|maior defesa|maior carga|maior alcance|mais dano|compara|troop|power|health|defense|speed|range|load|combat|melee|ranged|fastest|strongest|highest attack|compare/.test(p)) return 'tropa';
  if (/nível|nivel|xp|poder necessário|castelo|level|required power|castle/.test(p)) return 'nivel';
  if (/reino|fuso|região|idioma|realm|timezone|region|language/.test(p)) return 'reino';
  if (/ilha|savana|fazenda de pérola|guarnição|expansão|island|savanna|pearl farm|garrison|expansion/.test(p)) return 'ilha';
  return 'geral';
};
