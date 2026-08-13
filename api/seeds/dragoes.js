// Catálogo canônico de dragões.
// A progressão é preenchida aos poucos: não inferimos níveis/atributos que não foram confirmados.
// Retratos abaixo foram recortados das capturas fornecidas pelo usuário.

const capturaPendente = (nome) => ({
  tipo: 'captura',
  resumo: `${nome} precisa ser capturado. O local e os fragmentos ainda não foram cadastrados.`,
  fonte: null,
});

const dragon = ({ id, nome, elemento, cor, obtencao, habilidades = [], niveis = [] }) => ({
  id,
  nome,
  elemento,
  cor,
  emoji: '🐉',
  emojiDragao: '🐉',
  imagem: `/assets/dragons/${id}.webp`,
  raridade: '',
  descricao: '',
  obtencao,
  habilidades,
  niveis,
});

const HABILIDADES_GRANDE_DRAGAO = [
  {
    id: 'orbe_protecao',
    nome: 'Orbe de Proteção',
    tipo: 'batalha',
    descricao: 'Cria um escudo ao redor do Grande Dragão, diminuindo o dano recebido e refletindo ataques. Apenas na Batalha dos Dragões.',
  },
  {
    id: 'grande_inferno',
    nome: 'Grande Inferno',
    tipo: 'batalha',
    descricao: 'Fortalece tropas dracônicas em combate. Os valores exatos variam com a evolução da habilidade e serão cadastrados somente quando confirmados.',
  },
  {
    id: 'protecao',
    nome: 'Proteção',
    tipo: 'batalha',
    descricao: 'Limita o dano recebido pelo Grande Dragão a cada rodada. Os valores exatos variam com a evolução da habilidade.',
  },
  {
    id: 'disparo_fogo',
    nome: 'Disparo de Fogo',
    tipo: 'batalha',
    descricao: 'Habilidade ofensiva do Grande Dragão que atinge tropas inimigas. Os valores exatos por nível não são armazenados no guia.',
  },
  {
    id: 'fortaleza_inexpugnavel',
    nome: 'Fortaleza Inexpugnável',
    tipo: 'batalha',
    descricao: 'Habilidade defensiva do Grande Dragão com efeito de batalha e efeito em campo.',
  },
  {
    id: 'touro_vermelho',
    nome: 'Touro Vermelho',
    tipo: 'comum',
    descricao: 'Aumenta o Ataque do Dragão por 24 horas.',
  },
  {
    id: 'ossos_roxos',
    nome: 'Ossos Roxos',
    tipo: 'comum',
    descricao: 'Melhora a Defesa do Dragão por 24 horas.',
  },
  {
    id: 'transformar',
    nome: 'Transformar',
    tipo: 'comum',
    descricao: 'Permite alterar a forma visual do Dragão.',
  },
  {
    id: 'chamado_dragao',
    nome: 'Chamado do Dragão',
    tipo: 'comum',
    descricao: 'Aumenta temporariamente a população da primeira cidade.',
  },
];

const NIVEIS_GRANDE_DRAGAO = [
  {
    nivel: 1,
    vida: 0,
    defesa: 0,
    ataquePerto: 0,
    ataqueDistante: 0,
    alcance: 375,
    velocidade: 0,
    ataqueElemental: 0,
    impulsoElemental: 0,
    barreiraElemental: 0,
    bombardeioElemental: 0,
    confrontoElemental: 0,
    bloqueioElemental: 0,
    rupturaElemental: 0,
  },
  {
    // Snapshot confirmado pela tela de atributos do Nv.51.
    nivel: 51,
    vida: 20459996,
    defesa: 2169999,
    ataquePerto: 5424999,
    ataqueDistante: 5424999,
    alcance: 3500,
    velocidade: 1625,
    ataqueElemental: 569625,
    impulsoElemental: 1386,
    barreiraElemental: 1386,
    bombardeioElemental: 1260,
    confrontoElemental: 1260,
    bloqueioElemental: 1050,
    rupturaElemental: 1050,
  },
];

export const DRAGOES_SEED = [
  dragon({
    id: 'grande_dragao',
    nome: 'Grande Dragão',
    elemento: 'Principal',
    cor: '#B75A35',
    obtencao: {
      tipo: 'inicial',
      resumo: 'É o dragão principal da cidade e faz parte da progressão inicial da conta.',
      fonte: null,
    },
    habilidades: HABILIDADES_GRANDE_DRAGAO,
    niveis: NIVEIS_GRANDE_DRAGAO,
  }),
  dragon({
    id: 'dragao_agua',
    nome: 'Dragão da Água',
    elemento: 'Água',
    cor: '#2F8DA8',
    obtencao: {
      tipo: 'recompensa',
      dia: 2,
      resumo: 'Recebido no 2º dia de jogo no realm em que a conta entrou.',
      fonte: null,
    },
  }),
  dragon({
    id: 'dragao_beladona',
    nome: 'Dragão Beladona',
    elemento: 'Beladona',
    cor: '#6750A4',
    obtencao: {
      tipo: 'fragmentos',
      resumo: 'Os fragmentos podem ser obtidos em Campos de Floresta do nível 6 ao 10.',
      fonte: {
        modulo: 'campos',
        slug: 'campo-floresta',
        nome: 'Campo de Floresta',
        nivelMin: 6,
        nivelMax: 10,
      },
    },
  }),
  dragon({ id:'dragao_terra', nome:'Dragão da Terra', elemento:'Terra', cor:'#776548', obtencao:capturaPendente('O Dragão da Terra') }),
  dragon({ id:'dragao_fogo', nome:'Dragão do Fogo', elemento:'Fogo', cor:'#C94B20', obtencao:capturaPendente('O Dragão do Fogo') }),
  dragon({ id:'dragao_toxico', nome:'Dragão Tóxico', elemento:'Tóxico', cor:'#704D8C', obtencao:capturaPendente('O Dragão Tóxico') }),
  dragon({ id:'dragao_gelo', nome:'Dragão do Gelo', elemento:'Gelo', cor:'#75AFC6', obtencao:capturaPendente('O Dragão do Gelo') }),
  dragon({ id:'dragao_espinha_negra', nome:'Dragão da Espinha Negra', elemento:'Espinha Negra', cor:'#463B52', obtencao:capturaPendente('O Dragão da Espinha Negra') }),
  dragon({ id:'dragao_trovao', nome:'Dragão do Trovão', elemento:'Trovão', cor:'#718A9E', obtencao:capturaPendente('O Dragão do Trovão') }),
  dragon({ id:'dragao_celestial', nome:'Dragão Celestial', elemento:'Celestial', cor:'#60A87E', obtencao:capturaPendente('O Dragão Celestial') }),
  dragon({ id:'dragao_paradisiaco', nome:'Dragão Paradisíaco', elemento:'Paradisíaco', cor:'#8DA5A0', obtencao:capturaPendente('O Dragão Paradisíaco') }),
  dragon({ id:'dragao_dourado', nome:'Dragão Dourado', elemento:'Dourado', cor:'#C79A23', obtencao:capturaPendente('O Dragão Dourado') }),
  dragon({ id:'dragao_tirano', nome:'Dragão Tirano', elemento:'Tirano', cor:'#745055', obtencao:capturaPendente('O Dragão Tirano') }),
  dragon({ id:'dragao_fada', nome:'Dragão Fada', elemento:'Fada', cor:'#61A9AC', obtencao:capturaPendente('O Dragão Fada') }),
];
