// Evidências experimentais fornecidas ao projeto. Não representam regras absolutas do jogo.
// O migrador correspondente só preenche campos novos vazios e preserva edições do MongoDB.
export const TROOP_COMBAT_EVIDENCE = [
  {
    nome: 'Escaravelho de Guerra',
    perfilCombate: {
      funcoesTaticas: ['melee', 'tank'],
      observacoesEstrategicas: 'Em vários relatórios, Escaravelhos sofreram a maior parte das perdas enquanto tropas de retaguarda permaneceram intactas ou sofreram muito menos. O comportamento é compatível com uma função de proteção, mas ainda é tratado como evidência experimental.',
      fonteInformacao: 'Relatórios de batalha e observações experimentais do projeto GUIA DOA (agosto de 2026).',
      confianca: 'experimental',
      confiancaCampos: { funcoesTaticas:'experimental', observacoesEstrategicas:'experimental' },
    },
    i18n: { 'en-US': {
      combateObservacoesEstrategicas: 'Across several battle reports, War Beetles took most losses while backline troops remained intact or suffered much less. This behavior is compatible with a protective role, but it is still treated as experimental evidence.',
      combateFonteInformacao: 'Battle reports and experimental observations from the GUIA DOA project (August 2026).',
    } },
  },
  {
    nome: 'Leviatã Ártico',
    perfilCombate: {
      funcoesTaticas: ['ranged'],
      observacoesEstrategicas: 'Em vários testes permaneceu protegido enquanto Escaravelhos de Guerra sofreram grandes perdas. Isso não significa que a unidade nunca seja atacada.',
      fonteInformacao: 'Relatórios de batalha e observações experimentais do projeto GUIA DOA (agosto de 2026).',
      confianca: 'experimental',
      confiancaCampos: { funcoesTaticas:'experimental', observacoesEstrategicas:'experimental' },
    },
    i18n: { 'en-US': {
      combateObservacoesEstrategicas: 'In several tests it remained protected while War Beetles suffered heavy losses. This does not mean the unit is never targeted.',
      combateFonteInformacao: 'Battle reports and experimental observations from the GUIA DOA project (August 2026).',
    } },
  },
  {
    nome: 'Espelhos de Fogo',
    perfilCombate: {
      funcoesTaticas: ['ranged'],
      observacoesEstrategicas: 'Há batalha registrada em que os Espelhos de Fogo foram completamente eliminados enquanto Leviatãs Árticos sobreviveram. Tropas de distância não devem ser tratadas como se compartilhassem automaticamente a mesma prioridade de alvo.',
      fonteInformacao: 'Relatórios de batalha e observações experimentais do projeto GUIA DOA (agosto de 2026).',
      confianca: 'experimental',
      confiancaCampos: { funcoesTaticas:'experimental', observacoesEstrategicas:'experimental', prioridadeAlvo:'hipotese' },
    },
    i18n: { 'en-US': {
      combateObservacoesEstrategicas: 'A recorded battle completely eliminated Fire Mirrors while Arctic Leviathans survived. Ranged troops should not automatically be assumed to share the same target priority.',
      combateFonteInformacao: 'Battle reports and experimental observations from the GUIA DOA project (August 2026).',
    } },
  },
  {
    nome: 'Magmassauros',
    perfilCombate: {
      observacoesEstrategicas: 'Os resultados variam muito: houve relatórios com 1.200/1.200 e 1.614/1.614 sobreviventes, mas também uma batalha em que 1.800 entraram e apenas 192 sobreviveram. Não há base para cadastrar uma regra dizendo que Magmassauros são ignorados pelo inimigo.',
      fonteInformacao: 'Relatórios de batalha e observações experimentais do projeto GUIA DOA (agosto de 2026).',
      confiancaCampos: { observacoesEstrategicas:'experimental', prioridadeAlvo:'hipotese' },
    },
    i18n: { 'en-US': {
      combateObservacoesEstrategicas: 'Results vary widely: reports include 1,200/1,200 and 1,614/1,614 survivors, but another battle sent 1,800 and only 192 survived. There is no basis for a rule claiming Magmassaurs are ignored by the enemy.',
      combateFonteInformacao: 'Battle reports and experimental observations from the GUIA DOA project (August 2026).',
    } },
  },
];
