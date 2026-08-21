const GRUTA_NIVEIS = Array.from({ length: 10 }, (_, index) => {
  const nivel = index + 1;
  return {
    nivel,
    bonusOrbitasPct: nivel * 50,
    nivelMax: nivel === 10,
  };
});

const BASILICA_NIVEIS = [
  [1, 6, 3], [2, 7, 3], [3, 8, 4], [4, 9, 4], [5, 10, 5], [6, 11, 5],
  [7, 12, 6], [8, 13, 6], [9, 14, 6], [10, 15, 7], [11, 16, 7], [12, 17, 7],
  [13, 18, 8], [14, 19, 8], [15, 20, 8], [16, 21, 9], [17, 22, 9], [18, 23, 9],
  [19, 24, 9], [20, 24, 10],
].map(([nivel, ranhuras, nivelMaxPedra]) => ({ nivel, ranhuras, nivelMaxPedra, nivelMax:nivel === 20 }));

export const PEDRAS_ESPIRITUAIS = [
  {
    id:'ataque', nome:'Pedra Espiritual de Ataque', imagem:'/assets/edificios/especiais/pedra-ataque.webp',
    atributo:'ataquePerto', bonusBasePct:0.5,
    i18n:{ 'en-US':{ nome:'Attack Spirit Stone', atributo:'Melee Attack' } },
  },
  {
    id:'velocidade', nome:'Pedra Espiritual de Velocidade', imagem:'/assets/edificios/especiais/pedra-velocidade.webp',
    atributo:'velocidade', bonusBasePct:0.5,
    i18n:{ 'en-US':{ nome:'Speed Spirit Stone', atributo:'Speed' } },
  },
  {
    id:'alma', nome:'Pedra Espiritual da Alma', imagem:'/assets/edificios/especiais/pedra-alma.webp',
    atributo:'vida', bonusBasePct:0.5,
    i18n:{ 'en-US':{ nome:'Soul Spirit Stone', atributo:'Health' } },
  },
  {
    id:'defesa', nome:'Pedra Espiritual da Defesa', imagem:'/assets/edificios/especiais/pedra-defesa.webp',
    atributo:'defesa', bonusBasePct:0.5,
    i18n:{ 'en-US':{ nome:'Defense Spirit Stone', atributo:'Defense' } },
  },
  {
    id:'alcance', nome:'Pedra Espiritual de Alcance', imagem:'/assets/edificios/especiais/pedra-alcance.webp',
    atributo:'alcance', bonusBasePct:0.5,
    i18n:{ 'en-US':{ nome:'Range Spirit Stone', atributo:'Range' } },
  },
  {
    id:'ataque-distancia', nome:'Pedra Espiritual de Atq Dist', imagem:'/assets/edificios/especiais/pedra-ataque-distancia.webp',
    atributo:'ataqueDistancia', bonusBasePct:0.5,
    i18n:{ 'en-US':{ nome:'Ranged Attack Spirit Stone', atributo:'Ranged Attack' } },
  },
];

export const EDIFICIOS_ESPECIAIS = [
  {
    slug:'Gruta', nome:'Gruta', icone:'🕳️', tag:'Órbitas Espirituais', ordem:100,
    grupo:'especial', tipoModulo:'gruta', imagem:'/assets/edificios/especiais/gruta.webp',
    descricao:'Explore a Gruta para encontrar Órbitas Espirituais. Quanto maior o nível da Gruta, mais Órbitas Espirituais você encontrará.',
    colunas:[
      { key:'bonusOrbitasPct', label:'Bônus de Órbitas', tipo:'number' },
    ],
    niveis:GRUTA_NIVEIS,
    dadosEspeciais:{
      nivelMax:10,
      requerAlianca:true,
      requerBaseAlianca:true,
      exploracaoHoras:4,
      ajudasComRecompensa:5,
      orbitasPorPedraNivel1:100,
      bonusPorNivelPct:50,
      observacaoNivel:'O nível altera o bônus de Órbitas Espirituais encontradas.',
      fonte:'Prints do jogo enviados em 21/08/2026; níveis 4–10 visíveis e progressão de +50% por nível.',
    },
    i18n:{ 'en-US':{
      nome:'Cave', tag:'Spirit Orbs',
      descricao:'Explore the Cave to find Spirit Orbs. The higher the Cave level, the more Spirit Orbs you will find.',
    } },
  },
  {
    slug:'Basilica', nome:'Basílica', icone:'⛪', tag:'Pedras Espirituais', ordem:101,
    grupo:'especial', tipoModulo:'basilica', imagem:'/assets/edificios/especiais/basilica.webp',
    descricao:'A Pedra Espiritual alocada na Basílica desperta o legado dos dragões ancestrais e concede poder ao seu exército.',
    colunas:[
      { key:'ranhuras', label:'Ranhuras', tipo:'number' },
      { key:'nivelMaxPedra', label:'Nv. máx. da Pedra', tipo:'number' },
    ],
    niveis:BASILICA_NIVEIS,
    dadosEspeciais:{
      nivelMax:20,
      dependeDaGruta:true,
      ranhurasMax:24,
      gruposCompletosMax:4,
      pedras:PEDRAS_ESPIRITUAIS,
      combinacao:{
        pedrasMesmoNivel:3,
        orbitasPorPedraNivel1:100,
        evolucoesConfirmadas:[
          { de:1, para:2, adicionaisNivel1:2, totalEquivalenteNivel1:3, bonusPct:1 },
          { de:2, para:3, adicionaisNivel1:6, totalEquivalenteNivel1:9, bonusPct:2 },
          { de:3, para:4, adicionaisNivel1:18, totalEquivalenteNivel1:27, bonusPct:4 },
        ],
        projecaoFormula:{ multiplicadorCusto:3, multiplicadorBonus:2, confirmadaAteNivel:4, nivelMaxExistente:10 },
      },
      bonusConjuntoConfirmado:{
        nivelMinimoPedras:1,
        bonusPctPorAtributo:1.5,
        quantidadePedras:6,
      },
      fonte:'Prints do jogo enviados em 21/08/2026; níveis 1–20 da Basílica confirmados.',
    },
    i18n:{ 'en-US':{
      nome:'Basilica', tag:'Spirit Stones',
      descricao:'A Spirit Stone allocated in the Basilica awakens the legacy of the ancestral dragons and grants power to your army.',
    } },
  },
];

export { GRUTA_NIVEIS, BASILICA_NIVEIS };
