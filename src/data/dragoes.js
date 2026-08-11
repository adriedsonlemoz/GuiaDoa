// ==========================================================
// dragoes.js — Base de dados dos Dragões do DOA
//
// Cada dragão contém:
//   - id, nome, elemento, emoji/cor
//   - bonusMarcha: bônus de marcha (conforme tela do jogo)
//   - tropasAfetadas: tropas beneficiadas na marcha
//   - atributo: tipo de bônus (Ataque, Alcance, Vida, etc.)
//   - porcentagemPorNivel: % de bônus por nível
//   - descricao: texto de lore / descrição geral
//   - habilidades: lista de habilidades passivas
//   - dicas: dicas táticas de uso
// ==========================================================

export const dbDragoes = [
  {
    id: 'grande_dragao',
    nome: 'Grande Dragão',
    elemento: 'Fogo',
    cor: '#C85C2A',
    corSecundaria: '#8B3010',
    corFundo: 'rgba(200,92,42,0.12)',
    emoji: '🔥',
    emojiDragao: '🐉',
    raridade: 'Lendário',
    corRaridade: '#FFD700',
    bonusMarcha: '5% de ataque a Dragão de Ataque Ráp. e Dragões de Combate por nível do Grande Dragão nesta marcha.',
    atributo: 'Ataque',
    porcentagemPorNivel: 5,
    tropasAfetadas: ['Dragão de Ataque Rápido', 'Dragões de Combate'],
    descricao:
      'O Grande Dragão é o símbolo máximo do poder dracônico. Forjado nas entranhas dos vulcões antigos, ele comanda o campo de batalha com chamas devastadoras e uma presença que faz tremer até os mais corajosos guerreiros.',

    // ── NÍVEL DO DRAGÃO ───────────────────────────────────────────────────
    // Dados conhecidos via print. xpNecessaria = XP total do nível.
    nivelDragao: {
      nivelVisto: 20,
      xpConhecida: [
        { nivel: 20, xpNecessaria: 4517 },
      ],
    },

    // ── ATRIBUTOS BASE (Nv.1 conforme jogo) ──────────────────────────────
    atributosBase: {
      vida:           0,
      defesa:         0,
      ataquePerto:    0,
      ataqueDistante: 0,
      alcance:        375,
      velocidade:     0,
    },

    // ── ITENS DE ALIMENTAÇÃO ──────────────────────────────────────────────
    itensAlimentacao: [
      {
        id: 'touro_vermelho',
        nome: 'Touro Vermelho',
        emoji: '🐂',
        cor: '#C85C2A',
        desc: 'Aumenta o Ataque de seu Dragão por 24 horas.',
      },
      {
        id: 'ossos_roxos',
        nome: 'Ossos Roxos',
        emoji: '🦴',
        cor: '#8B4EA0',
        desc: 'Melhora a Defesa do Dragão por 24 horas.',
      },
      {
        id: 'chamado_dragao',
        nome: 'Chamado do Dragão',
        emoji: '📯',
        cor: '#5C7FA3',
        desc: 'Aumenta a população de sua primeira cidade em 20.000 por 24 horas.',
      },
      {
        id: 'transformar',
        nome: 'Transformar',
        emoji: '✨',
        cor: '#B8965A',
        desc: 'Escolha o visual de seu Dragão.',
      },
    ],

    // ── HABILIDADES REAIS (dados do jogo) ─────────────────────────────────
    habilidades: [
      {
        id: 'disparo_fogo',
        nome: 'Disparo de Fogo',
        emoji: '🔥',
        corTipo: '#2E7D32',
        tipo: 'Efeito de Batalha',
        // XP necessária por nível (dados conhecidos via prints)
        xpConhecida: [
          { nivel: 1, xpNecessaria: 200 },
        ],
        nivelAtual: {
          nivel: 1,
          xp: '0/200',
          descricao:
            '10% de chance de ativar habilidade. Tropas inimigas de maior defesa atacadas primeiro. Dano faz com que as tropas inimigas percam 16.616 de PV. Máximo de inimigos perdidos: 100. Inválido(a) no Campo de Batalha do Dragão.',
        },
        nivelMax: {
          descricao:
            '60% de chance de ativar habilidade. Tropas inimigas de maior defesa atacadas primeiro. Dano faz com que as tropas inimigas percam 389.723.520 de PV. Máximo de inimigos perdidos: 13.000. Inválido(a) no Campo de Batalha do Dragão.',
        },
      },
      {
        id: 'fortaleza_inexpugnavel',
        nome: 'Fortaleza Inexpugnável',
        emoji: '🏰',
        corTipo: '#2E7D32',
        tipo: 'Efeito de Batalha + Efeito em Campo',
        xpConhecida: [
          { nivel: 1, xpNecessaria: 200 },
        ],
        nivelAtual: {
          nivel: 1,
          xp: '0/200',
          descricao:
            'Efeito de Batalha: Quando o Grande Dragão está vivo, dano recebido é reduzido em 10%. Inválido(a) no Campo de Batalha dos Dragões.\n\nEfeito em Campo: Quando o Grande Dragão recebe um dano fatal, ele sobrevive com 1 PV, o qual pode ser ativado uma vez por batalha. Apenas na Batalha dos Dragões.',
        },
        nivelMax: {
          descricao:
            'Efeito de Batalha: Quando o Grande Dragão está vivo, dano recebido é reduzido em 30%. Inválido(a) no Campo de Batalha dos Dragões.\n\nEfeito em Campo: Quando o Grande Dragão recebe um dano fatal, ele sobrevive com 1 PV, o qual pode ser ativado uma vez por batalha. Apenas na Batalha dos Dragões.',
        },
      },
      {
        id: 'grande_inferno',
        nome: 'Grande Inferno',
        emoji: '🌋',
        corTipo: '#2E7D32',
        tipo: 'Efeito de Batalha',
        xpConhecida: [
          { nivel: 1, xpNecessaria: 200 },
        ],
        nivelAtual: {
          nivel: 1,
          xp: '0/200',
          descricao:
            'Adiciona 2% de Vida e +2% de Defesa a Dragões de Combate, Dragonete da Tempestade, Cavaleiro Dragão. Inválido(a) no Campo de Batalha do Dragão.',
        },
        nivelMax: {
          descricao:
            'Adiciona 34% de Vida e +34% de Defesa a Dragões de Combate, Dragonete da Tempestade, Cavaleiro Dragão. Inválido(a) no Campo de Batalha do Dragão.',
        },
      },
      {
        id: 'protecao',
        nome: 'Proteção',
        emoji: '🛡️',
        corTipo: '#2E7D32',
        tipo: 'Efeito de Batalha',
        xpConhecida: [
          { nivel: 1, xpNecessaria: 200 },
        ],
        nivelAtual: {
          nivel: 1,
          xp: '0/200',
          descricao:
            'A cada rodada, o dano recebido só será de 90% do valor total de PV do Grande Dragão. Inválido(a) no Campo de Batalha do Dragão.',
        },
        nivelMax: {
          descricao:
            'A cada rodada, o dano recebido só será de 9% do valor total de PV do Grande Dragão. Inválido(a) no Campo de Batalha do Dragão.',
        },
      },
      {
        id: 'orbe_protecao',
        nome: 'Orbe de Proteção',
        emoji: '🔮',
        corTipo: '#7B1C1C',
        tipo: 'Efeito em Campo',
        xpConhecida: [
          { nivel: 1,  xpNecessaria: 200  },
          { nivel: 9,  xpNecessaria: 1500 },
        ],
        nivelAtual: {
          nivel: 9,
          xp: '809/1500',
          duracao: '2 turno(s)',
          defesa: '103.325',
          descricao:
            'Usando magia antiga, um Orbe de Proteção pode criar um escudo ao redor de seu Grande Dragão, diminuindo o dano recebido e refletindo ataques. Apenas na Batalha dos Dragões.',
        },
        nivelMax: {
          defesa: '74.975.842',
          descricao:
            'Usando magia antiga, um Orbe de Proteção pode criar um escudo ao redor de seu Grande Dragão, diminuindo o dano recebido e refletindo ataques. Apenas na Batalha dos Dragões.',
        },
      },
    ],

    dicas: [
      'Ideal para marchas ofensivas com foco em Dragões de Combate.',
      'Combine com melhorias de nível máximo para ampliar o bônus de ataque.',
      'O Orbe de Proteção é essencial na Batalha dos Dragões — priorize incrementar.',
      'Use Touro Vermelho antes de ataques importantes para boost de ataque temporário.',
      'Fortaleza Inexpugnável com 30% de redução de dano é uma das passivas mais fortes do jogo.',
    ],
  },
  {
    id: 'dragao_agua',
    nome: 'Dragão da Água',
    elemento: 'Água',
    cor: '#3A7FB5',
    corSecundaria: '#1A5C8A',
    corFundo: 'rgba(58,127,181,0.12)',
    emoji: '💧',
    emojiDragao: '🐲',
    raridade: 'Épico',
    corRaridade: '#9B59B6',
    bonusMarcha: '+5% de Alcance por nível do Grande Dragão a todos os Abissais nesta marcha.',
    atributo: 'Alcance',
    porcentagemPorNivel: 5,
    tropasAfetadas: ['Abissais'],
    descricao:
      'Nascido nas profundezas dos oceanos subterrâneos, o Dragão da Água domina as correntes e marés da batalha. Seus escamas refletem a luz como cristais e suas ondas de força ampliam o alcance das tropas Abissais.',
    habilidades: [
      { nome: 'Maré Profunda', desc: 'Aumenta o alcance de todas as tropas Abissais em combate.' },
      { nome: 'Névoa Oceânica', desc: 'Cria névoa que dificulta a mira dos inimigos.' },
      { nome: 'Corrente Sombria', desc: 'Ataque à distância que penetra defesas de tropas terrestres.' },
    ],
    dicas: [
      'Especializado em Abissais — monte marchas focadas nesse tipo de tropa.',
      'O bônus de Alcance é determinado pelo nível do Grande Dragão, não do próprio Dragão da Água.',
      'Excelente contra formações inimigas compactas pela vantagem de alcance.',
    ],
  },
  {
    id: 'dragao_beladona',
    nome: 'Dragão Beladona',
    elemento: 'Veneno',
    cor: '#6B4A9B',
    corSecundaria: '#4A2878',
    corFundo: 'rgba(107,74,155,0.12)',
    emoji: '☠️',
    emojiDragao: '🐉',
    raridade: 'Épico',
    corRaridade: '#9B59B6',
    bonusMarcha: '+2,5% de Ataque por nível de Dragão Beladona a todos os Terrores do Pântano nesta marcha.',
    atributo: 'Ataque',
    porcentagemPorNivel: 2.5,
    tropasAfetadas: ['Terrores do Pântano'],
    descricao:
      'Criatura das sombras pantanosas, o Dragão Beladona exala venenos lendários que enfraquecem inimigos e fortalecem aliados com toxinas ofensivas. Seus Terrores do Pântano tornam-se implacáveis sob sua influência.',
    habilidades: [
      { nome: 'Toxina Letal', desc: 'Envenena tropas inimigas, reduzindo sua resistência gradualmente.' },
      { nome: 'Aura do Pântano', desc: 'Amplifica o ataque dos Terrores do Pântano aliados.' },
      { nome: 'Névoa Venenosa', desc: 'Dispersa nuvem tóxica que desorganiza formações inimigas.' },
    ],
    dicas: [
      'Combine Terrores do Pântano em alta quantidade para maximizar o bônus de ataque.',
      'O bônus é calculado pelo nível do próprio Dragão Beladona.',
      'Eficiente em ataques de longa duração onde o veneno acumula efeito.',
    ],
  },
  {
    id: 'dragao_terra',
    nome: 'Dragão da Terra',
    elemento: 'Terra',
    cor: '#7A5C2A',
    corSecundaria: '#5A3C10',
    corFundo: 'rgba(122,92,42,0.12)',
    emoji: '🪨',
    emojiDragao: '🐉',
    raridade: 'Épico',
    corRaridade: '#9B59B6',
    bonusMarcha: '+2,5% de Vida por nível do Dragão da Terra a todos os Ogros de Granito nesta marcha.',
    atributo: 'Vida',
    porcentagemPorNivel: 2.5,
    tropasAfetadas: ['Ogros de Granito'],
    descricao:
      'Surgido das profundezas da terra, o Dragão da Terra é um colosso de granito vivo. Sua presença na batalha fortalece a resistência dos Ogros de Granito, tornando-os praticamente intransponíveis.',
    habilidades: [
      { nome: 'Pele de Pedra', desc: 'Aumenta enormemente a vida dos Ogros de Granito aliados.' },
      { nome: 'Tremor Sísmico', desc: 'Abala o terreno sob inimigos, reduzindo sua mobilidade.' },
      { nome: 'Fortaleza Viva', desc: 'Cria barreira de pedra que absorve dano para tropas próximas.' },
    ],
    dicas: [
      'Ideal para defesas e marchas de resistência prolongada.',
      'Ogros de Granito com bônus de vida são difíceis de eliminar — use como tanque.',
      'Combine com itens de aprimoramento de vida para resultados devastadores.',
    ],
  },
];

// Acesso rápido por id
export const getDragaoById = (id) => dbDragoes.find((d) => d.id === id) || null;
