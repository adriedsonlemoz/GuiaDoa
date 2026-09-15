export const GRODZ_MECHANICS = Object.freeze({
  // Ataque normal e Devastar usam o MESMO contador diário.
  limiteDiarioCompartilhado: 99,
  ataqueLimiteDiario: 99,
  devastarLimiteDiario: 99,
  contadorCompartilhado: true,
  resetDiario: '00:00',
  devastarTempoHoras: 6,
  devastarTempoStatus: 'confirmado',
  pergaminhoItemSlug: 'pergaminho-devastar',
  pergaminhoNome: 'Ticket de Campanha de Devastar',
  pergaminhoImagem: '/assets/items/catalog/ticket-campanha-devastar.webp',
  origemPergaminho: 'zyrvorthian',
  origemMateriais: 'zyrvorthian',
  tropaPrincipal: { nome:'Magmassauros', slug:'magmassauros', quantidade:1000, nivelMaxSemPerdas:9 },
  nivel10SemPerdas: false,
  nivel10: {
    magmassauros: 5000,
    ogrosGranito: 5000,
  },
  armaduras: {
    semDragaoSelecionado: 'aleatoria_entre_dragoes_possuidos',
    grandeDragao: 'arca-superior-grande-dragao',
    agua: 'arca-superior-dragao-agua',
    terra: 'arca-superior-dragao-terra',
    fogo: 'arca-superior-dragao-fogo',
  },
});
