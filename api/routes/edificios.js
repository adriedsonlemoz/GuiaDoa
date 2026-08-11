import { Router } from 'express';
import Edificio from '../models/Edificio.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

// ── Dados estáticos para importação ─────────────────────────────────────────
const EDIFICIOS_META = {
  Casa:           { icone: '🏠', tag: 'Pop.',    ordem: 0, descricao: 'Aumenta a população máxima da cidade, essencial para recrutar e sustentar tropas.' },
  Fazenda:        { icone: '🌾', tag: 'Alim.',   ordem: 1, descricao: 'Produz alimento continuamente para sustentar tropas e o crescimento da cidade.' },
  FazendaPerolas: { icone: '🔮', tag: 'Pérolas', ordem: 2, descricao: 'Produz pérolas valiosas usadas em pesquisas e negociações avançadas.' },
  FonteDaCura:    { icone: '💧', tag: 'Cura',    ordem: 3, descricao: 'Aumenta o limite de tropas que podem se curar simultaneamente no hospital.' },
  PontoDeReuniao: { icone: '⚔️', tag: 'Marcha',  ordem: 4, descricao: 'Aumenta o limite de marchas e a quantidade de tropas enviadas por vez.' },
  Sentinela:      { icone: '👁️', tag: 'Def.',    ordem: 5, descricao: 'Revela informações progressivas sobre ataques inimigos conforme sobe de nível.' },
  Fortaleza:      { icone: '🏰', tag: 'Fort.',   ordem: 6, descricao: 'Expande territórios, pontos de reforço e áreas disponíveis da cidade.' },
  Mina:           { icone: '⛏️', tag: 'Ouro',    ordem: 7, descricao: 'Extrai ouro continuamente para financiar pesquisas e construções avançadas.' },
  Pedra:          { icone: '🪨', tag: 'Pedra',   ordem: 8, descricao: 'Extrai pedra continuamente, recurso essencial para obras e aprimoramentos.' },
  Serraria:       { icone: '🌲', tag: 'Madeira', ordem: 9, descricao: 'Produz madeira continuamente, necessária para diversas construções da cidade.' },
  Fabrica:        { icone: '🏭', tag: 'Prod.',   ordem: 10, descricao: 'Permite treinar unidades de guerra avançadas à medida que sobe de nível.' },
  Viveiro:        { icone: '🥚', tag: 'Dragão',  ordem: 11, descricao: 'Acelera o treinamento de dragões e desbloqueia novas espécies raras.' },
};

const EDIFICIOS_COLUNAS = {
  Casa:           [{ key: 'popAumento',    label: 'Aumento Pop.',  tipo: 'number' }],
  Fazenda:        [{ key: 'pop',           label: 'Pop.',          tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  FazendaPerolas: [{ key: 'pop',           label: 'Pop.',          tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  FonteDaCura:    [{ key: 'maxTropas',     label: 'Máx. Tropas',  tipo: 'number' }],
  PontoDeReuniao: [{ key: 'marchas',       label: 'Marchas',       tipo: 'number' }, { key: 'tropasPorMarcha', label: 'Tropas/Marcha', tipo: 'number' }],
  Sentinela:      [{ key: 'desc',          label: 'Efeito',        tipo: 'text'   }],
  Fortaleza:      [{ key: 'territorios',   label: 'Territórios',  tipo: 'number' }, { key: 'reforcos', label: 'Reforços', tipo: 'number' }, { key: 'areas', label: 'Áreas', tipo: 'number' }],
  Mina:           [{ key: 'pop',           label: 'Pop.',          tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  Pedra:          [{ key: 'pop',           label: 'Pop.',          tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  Serraria:       [{ key: 'pop',           label: 'Pop.',          tipo: 'number' }, { key: 'prodHora', label: 'Prod./h', tipo: 'number' }, { key: 'cap', label: 'Cap. Máx.', tipo: 'number' }],
  Fabrica:        [{ key: 'desc',          label: 'Efeito',        tipo: 'text'   }],
  Viveiro:        [{ key: 'desc',          label: 'Efeito',        tipo: 'text'   }],
};

const EDIFICIOS_NIVEIS = {
  Casa: [
    { nivel: 1,  popAumento: 37   }, { nivel: 2,  popAumento: 100  }, { nivel: 3,  popAumento: 187  },
    { nivel: 4,  popAumento: 300  }, { nivel: 5,  popAumento: 437  }, { nivel: 6,  popAumento: 600  },
    { nivel: 7,  popAumento: 787  }, { nivel: 8,  popAumento: 1000 }, { nivel: 9,  popAumento: 1237 },
    { nivel: 10, popAumento: 1500 }, { nivel: 11, popAumento: 1787 }, { nivel: 12, popAumento: 2100 },
    { nivel: 13, popAumento: 2437 }, { nivel: 14, popAumento: 2800 }, { nivel: 15, popAumento: 3187 },
    { nivel: 16, popAumento: 3600 }, { nivel: 17, popAumento: 4037 }, { nivel: 18, popAumento: 4500 },
    { nivel: 19, popAumento: 4987 }, { nivel: 20, popAumento: 5500 }, { nivel: 21, popAumento: 6037 },
    { nivel: 22, popAumento: 6600 }, { nivel: 23, popAumento: 7187 }, { nivel: 24, popAumento: 7800 },
    { nivel: 25, popAumento: 8437 }, { nivel: 26, popAumento: 9100 }, { nivel: 27, popAumento: 9787 },
    { nivel: 28, popAumento: 10500}, { nivel: 29, popAumento: 11237}, { nivel: 30, popAumento: 12000},
  ],
  Fazenda: [
    { nivel: 1,  pop: 5,   prodHora: 100,   cap: 10000   }, { nivel: 2,  pop: 10,  prodHora: 300,   cap: 30000   },
    { nivel: 3,  pop: 20,  prodHora: 600,   cap: 60000   }, { nivel: 4,  pop: 60,  prodHora: 1000,  cap: 100000  },
    { nivel: 5,  pop: 120, prodHora: 1500,  cap: 150000  }, { nivel: 6,  pop: 210, prodHora: 2100,  cap: 210000  },
    { nivel: 7,  pop: 280, prodHora: 2800,  cap: 280000  }, { nivel: 8,  pop: 360, prodHora: 3600,  cap: 360000  },
    { nivel: 9,  pop: 450, prodHora: 4500,  cap: 450000  }, { nivel: 10, pop: 550, prodHora: 5500,  cap: 550000  },
    { nivel: 11, pop: 550, prodHora: 5850,  cap: 585000  }, { nivel: 12, pop: 550, prodHora: 6200,  cap: 620000  },
    { nivel: 13, pop: 550, prodHora: 6550,  cap: 655000  }, { nivel: 14, pop: 550, prodHora: 6900,  cap: 690000  },
    { nivel: 15, pop: 550, prodHora: 7250,  cap: 725000  }, { nivel: 16, pop: 550, prodHora: 7700,  cap: 770000  },
    { nivel: 17, pop: 550, prodHora: 8150,  cap: 815000  }, { nivel: 18, pop: 550, prodHora: 8600,  cap: 860000  },
    { nivel: 19, pop: 550, prodHora: 9050,  cap: 905000  }, { nivel: 20, pop: 550, prodHora: 9500,  cap: 950000  },
    { nivel: 21, pop: 550, prodHora: 10100, cap: 1010000 }, { nivel: 22, pop: 550, prodHora: 10700, cap: 1070000 },
    { nivel: 23, pop: 550, prodHora: 11300, cap: 1130000 }, { nivel: 24, pop: 550, prodHora: 11900, cap: 1190000 },
    { nivel: 25, pop: 550, prodHora: 12500, cap: 1250000 }, { nivel: 26, pop: 550, prodHora: 13300, cap: 1330000 },
    { nivel: 27, pop: 550, prodHora: 14100, cap: 1410000 }, { nivel: 28, pop: 550, prodHora: 14900, cap: 1490000 },
    { nivel: 29, pop: 550, prodHora: 15700, cap: 1570000 }, { nivel: 30, pop: 550, prodHora: 16500, cap: 1650000 },
    { nivel: 31, pop: 550, prodHora: 17500, cap: 1750000 }, { nivel: 32, pop: 550, prodHora: 18500, cap: 1850000 },
    { nivel: 33, pop: 550, prodHora: 19500, cap: 1950000 }, { nivel: 34, pop: 550, prodHora: 20500, cap: 2050000 },
    { nivel: 35, pop: 550, prodHora: 21500, cap: 2150000 },
  ],
  FazendaPerolas: [
    { nivel: 1,  pop: 10,   prodHora: 4,   cap: 192   }, { nivel: 2,  pop: 30,   prodHora: 12,  cap: 576   },
    { nivel: 3,  pop: 60,   prodHora: 24,  cap: 1152  }, { nivel: 4,  pop: 100,  prodHora: 40,  cap: 1920  },
    { nivel: 5,  pop: 150,  prodHora: 60,  cap: 2880  }, { nivel: 6,  pop: 210,  prodHora: 84,  cap: 4032  },
    { nivel: 7,  pop: 280,  prodHora: 112, cap: 5376  }, { nivel: 8,  pop: 360,  prodHora: 144, cap: 6912  },
    { nivel: 9,  pop: 450,  prodHora: 180, cap: 8640  }, { nivel: 10, pop: 550,  prodHora: 220, cap: 10560 },
    { nivel: 11, pop: 660,  prodHora: 264, cap: 12672 }, { nivel: 12, pop: 780,  prodHora: 312, cap: 14976 },
    { nivel: 13, pop: 910,  prodHora: 364, cap: 17472 }, { nivel: 14, pop: 1050, prodHora: 420, cap: 20160 },
    { nivel: 15, pop: 1200, prodHora: 480, cap: 23040 }, { nivel: 16, pop: 1360, prodHora: 544, cap: 26112 },
    { nivel: 17, pop: 1530, prodHora: 612, cap: 29376 }, { nivel: 18, pop: 1710, prodHora: 684, cap: 32832 },
    { nivel: 19, pop: 1900, prodHora: 760, cap: 36480 }, { nivel: 20, pop: 2100, prodHora: 840, cap: 40320 },
  ],
  FonteDaCura: [
    { nivel: 1,  maxTropas: 36    }, { nivel: 2,  maxTropas: 108   }, { nivel: 3,  maxTropas: 216   },
    { nivel: 4,  maxTropas: 360   }, { nivel: 5,  maxTropas: 540   }, { nivel: 6,  maxTropas: 756   },
    { nivel: 7,  maxTropas: 1008  }, { nivel: 8,  maxTropas: 1296  }, { nivel: 9,  maxTropas: 1620  },
    { nivel: 10, maxTropas: 1980  }, { nivel: 11, maxTropas: 2376  }, { nivel: 12, maxTropas: 2808  },
    { nivel: 13, maxTropas: 3276  }, { nivel: 14, maxTropas: 3780  }, { nivel: 15, maxTropas: 4320  },
    { nivel: 16, maxTropas: 4896  }, { nivel: 17, maxTropas: 5508  }, { nivel: 18, maxTropas: 6156  },
    { nivel: 19, maxTropas: 6840  }, { nivel: 20, maxTropas: 7560  }, { nivel: 21, maxTropas: 8316  },
    { nivel: 22, maxTropas: 9108  }, { nivel: 23, maxTropas: 9936  }, { nivel: 24, maxTropas: 10800 },
    { nivel: 25, maxTropas: 11700 }, { nivel: 26, maxTropas: 12636 }, { nivel: 27, maxTropas: 13608 },
    { nivel: 28, maxTropas: 14616 }, { nivel: 29, maxTropas: 15660 }, { nivel: 30, maxTropas: 16740 },
    { nivel: 31, maxTropas: 17856 }, { nivel: 32, maxTropas: 19008 }, { nivel: 33, maxTropas: 20196 },
    { nivel: 34, maxTropas: 21420 }, { nivel: 35, maxTropas: 22680 },
  ],
  PontoDeReuniao: [
    { nivel: 1,  marchas: 1,  tropasPorMarcha: 10000  }, { nivel: 2,  marchas: 1,  tropasPorMarcha: 15000  },
    { nivel: 3,  marchas: 2,  tropasPorMarcha: 20000  }, { nivel: 4,  marchas: 2,  tropasPorMarcha: 25000  },
    { nivel: 5,  marchas: 3,  tropasPorMarcha: 30000  }, { nivel: 6,  marchas: 3,  tropasPorMarcha: 35000  },
    { nivel: 7,  marchas: 4,  tropasPorMarcha: 40000  }, { nivel: 8,  marchas: 4,  tropasPorMarcha: 45000  },
    { nivel: 9,  marchas: 5,  tropasPorMarcha: 50000  }, { nivel: 10, marchas: 5,  tropasPorMarcha: 55000  },
    { nivel: 11, marchas: 6,  tropasPorMarcha: 60000  }, { nivel: 12, marchas: 6,  tropasPorMarcha: 65000  },
    { nivel: 13, marchas: 7,  tropasPorMarcha: 70000  }, { nivel: 14, marchas: 7,  tropasPorMarcha: 75000  },
    { nivel: 15, marchas: 8,  tropasPorMarcha: 80000  }, { nivel: 16, marchas: 8,  tropasPorMarcha: 85000  },
    { nivel: 17, marchas: 9,  tropasPorMarcha: 90000  }, { nivel: 18, marchas: 9,  tropasPorMarcha: 93000  },
    { nivel: 19, marchas: 9,  tropasPorMarcha: 96000  }, { nivel: 20, marchas: 10, tropasPorMarcha: 100000 },
  ],
  Sentinela: [
    { nivel: 1,  desc: 'Os Sentinela pode sentir inimigos se aproximando.' },
    { nivel: 2,  desc: 'Aprimore para o Nível 3 para desbloquear novas habilidades.' },
    { nivel: 3,  desc: 'O Sentinela pode dizer se uma missão inimiga é de ataque ou espionagem.' },
    { nivel: 4,  desc: 'Aprimore para o Nível 5 para desbloquear novas habilidades.' },
    { nivel: 5,  desc: 'O Sentinela sabe quando você será atacado.' },
    { nivel: 6,  desc: 'Aprimore para o Nível 7 para desbloquear novas habilidades.' },
    { nivel: 7,  desc: 'O Sentinela pode identificar o título e a Aliança do agressor.' },
    { nivel: 8,  desc: 'Aprimore para o Nível 9 para desbloquear novas habilidades.' },
    { nivel: 9,  desc: 'O Sentinela sabe o Nível do General inimigo.' },
    { nivel: 10, desc: 'Aprimore para o Nível 11 para desbloquear novas habilidades.' },
    { nivel: 11, desc: 'O Sentinela pode estimar o número de invasores e as coordenadas do agressor.' },
    { nivel: 12, desc: 'Aprimore para o Nível 13 para desbloquear novas habilidades.' },
    { nivel: 13, desc: 'O Sentinela pode identificar o tipos das tropas invasoras.' },
    { nivel: 14, desc: 'Aprimore para o Nível 15 para desbloquear novas habilidades.' },
    { nivel: 15, desc: 'O Sentinela pode identificar o número aproximado de cada tipo de tropa invasora.' },
    { nivel: 16, desc: 'Aprimore para o Nível 17 para desbloquear novas habilidades.' },
    { nivel: 17, desc: 'O Sentinela pode adivinhar o número exato de cada tipo de tropa invasora.' },
    { nivel: 18, desc: 'Aprimore para o Nível 20 para desbloquear novas habilidades.' },
    { nivel: 19, desc: 'Aprimore para o Nível 20 para desbloquear novas habilidades.' },
    { nivel: 20, desc: 'O Sentinela pode dizer o nome do Invasor.' },
    { nivel: 21, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.1.' },
    { nivel: 22, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.2.' },
    { nivel: 23, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.3.' },
    { nivel: 24, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.4.' },
    { nivel: 25, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.5.' },
    { nivel: 26, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.6.' },
    { nivel: 27, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.7.' },
    { nivel: 28, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.8.' },
    { nivel: 29, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.9.' },
    { nivel: 30, desc: 'A Sentinela desbloqueia sua Pesquisa Pessoal [Insight] Nv.10.' },
  ],
  Fortaleza: [
    { nivel: 1,  territorios: 1,  reforcos: 1,  areas: 0 }, { nivel: 2,  territorios: 1,  reforcos: 1,  areas: 2 },
    { nivel: 3,  territorios: 2,  reforcos: 2,  areas: 1 }, { nivel: 4,  territorios: 2,  reforcos: 2,  areas: 2 },
    { nivel: 5,  territorios: 3,  reforcos: 3,  areas: 1 }, { nivel: 6,  territorios: 3,  reforcos: 3,  areas: 2 },
    { nivel: 7,  territorios: 4,  reforcos: 4,  areas: 1 }, { nivel: 8,  territorios: 4,  reforcos: 4,  areas: 2 },
    { nivel: 9,  territorios: 5,  reforcos: 5,  areas: 1 }, { nivel: 10, territorios: 5,  reforcos: 5,  areas: 2 },
    { nivel: 11, territorios: 6,  reforcos: 5,  areas: 1 }, { nivel: 12, territorios: 6,  reforcos: 6,  areas: 2 },
    { nivel: 13, territorios: 6,  reforcos: 6,  areas: 1 }, { nivel: 14, territorios: 7,  reforcos: 7,  areas: 2 },
    { nivel: 15, territorios: 7,  reforcos: 7,  areas: 1 }, { nivel: 16, territorios: 8,  reforcos: 8,  areas: 2 },
    { nivel: 17, territorios: 8,  reforcos: 8,  areas: 1 }, { nivel: 18, territorios: 9,  reforcos: 9,  areas: 1 },
    { nivel: 19, territorios: 9,  reforcos: 9,  areas: 1 }, { nivel: 20, territorios: 10, reforcos: 10, areas: 1 },
  ],
  Mina: [
    { nivel: 1,  pop: 5,   prodHora: 100,   cap: 10000   }, { nivel: 2,  pop: 10,  prodHora: 300,   cap: 30000   },
    { nivel: 3,  pop: 20,  prodHora: 600,   cap: 60000   }, { nivel: 4,  pop: 60,  prodHora: 1000,  cap: 100000  },
    { nivel: 5,  pop: 120, prodHora: 1500,  cap: 150000  }, { nivel: 6,  pop: 210, prodHora: 2100,  cap: 210000  },
    { nivel: 7,  pop: 280, prodHora: 2800,  cap: 280000  }, { nivel: 8,  pop: 360, prodHora: 3600,  cap: 360000  },
    { nivel: 9,  pop: 450, prodHora: 4500,  cap: 450000  }, { nivel: 10, pop: 550, prodHora: 5500,  cap: 550000  },
    { nivel: 11, pop: 550, prodHora: 5850,  cap: 585000  }, { nivel: 12, pop: 550, prodHora: 6200,  cap: 620000  },
    { nivel: 13, pop: 550, prodHora: 6550,  cap: 655000  }, { nivel: 14, pop: 550, prodHora: 6900,  cap: 690000  },
    { nivel: 15, pop: 550, prodHora: 7250,  cap: 725000  }, { nivel: 16, pop: 550, prodHora: 7700,  cap: 770000  },
    { nivel: 17, pop: 550, prodHora: 8150,  cap: 815000  }, { nivel: 18, pop: 550, prodHora: 8600,  cap: 860000  },
    { nivel: 19, pop: 550, prodHora: 9050,  cap: 905000  }, { nivel: 20, pop: 550, prodHora: 9500,  cap: 950000  },
    { nivel: 21, pop: 550, prodHora: 10100, cap: 1010000 }, { nivel: 22, pop: 550, prodHora: 10700, cap: 1070000 },
    { nivel: 23, pop: 550, prodHora: 11300, cap: 1130000 }, { nivel: 24, pop: 550, prodHora: 11900, cap: 1190000 },
    { nivel: 25, pop: 550, prodHora: 12500, cap: 1250000 }, { nivel: 26, pop: 550, prodHora: 13300, cap: 1330000 },
    { nivel: 27, pop: 550, prodHora: 14100, cap: 1410000 }, { nivel: 28, pop: 550, prodHora: 14900, cap: 1490000 },
    { nivel: 29, pop: 550, prodHora: 15700, cap: 1570000 }, { nivel: 30, pop: 550, prodHora: 16500, cap: 1650000 },
    { nivel: 31, pop: 550, prodHora: 17500, cap: 1750000 }, { nivel: 32, pop: 550, prodHora: 18500, cap: 1850000 },
    { nivel: 33, pop: 550, prodHora: 19500, cap: 1950000 }, { nivel: 34, pop: 550, prodHora: 20500, cap: 2050000 },
    { nivel: 35, pop: 550, prodHora: 21500, cap: 2150000 },
  ],
  Pedra: [
    { nivel: 1,  pop: 5,   prodHora: 100,   cap: 10000   }, { nivel: 2,  pop: 10,  prodHora: 300,   cap: 30000   },
    { nivel: 3,  pop: 20,  prodHora: 600,   cap: 60000   }, { nivel: 4,  pop: 60,  prodHora: 1000,  cap: 100000  },
    { nivel: 5,  pop: 120, prodHora: 1500,  cap: 150000  }, { nivel: 6,  pop: 210, prodHora: 2100,  cap: 210000  },
    { nivel: 7,  pop: 280, prodHora: 2800,  cap: 280000  }, { nivel: 8,  pop: 360, prodHora: 3600,  cap: 360000  },
    { nivel: 9,  pop: 450, prodHora: 4500,  cap: 450000  }, { nivel: 10, pop: 550, prodHora: 5500,  cap: 550000  },
    { nivel: 11, pop: 550, prodHora: 5850,  cap: 585000  }, { nivel: 12, pop: 550, prodHora: 6200,  cap: 620000  },
    { nivel: 13, pop: 550, prodHora: 6550,  cap: 655000  }, { nivel: 14, pop: 550, prodHora: 6900,  cap: 690000  },
    { nivel: 15, pop: 550, prodHora: 7250,  cap: 725000  }, { nivel: 16, pop: 550, prodHora: 7700,  cap: 770000  },
    { nivel: 17, pop: 550, prodHora: 8150,  cap: 815000  }, { nivel: 18, pop: 550, prodHora: 8600,  cap: 860000  },
    { nivel: 19, pop: 550, prodHora: 9050,  cap: 905000  }, { nivel: 20, pop: 550, prodHora: 9500,  cap: 950000  },
    { nivel: 21, pop: 550, prodHora: 10100, cap: 1010000 }, { nivel: 22, pop: 550, prodHora: 10700, cap: 1070000 },
    { nivel: 23, pop: 550, prodHora: 11300, cap: 1130000 }, { nivel: 24, pop: 550, prodHora: 11900, cap: 1190000 },
    { nivel: 25, pop: 550, prodHora: 12500, cap: 1250000 }, { nivel: 26, pop: 550, prodHora: 13300, cap: 1330000 },
    { nivel: 27, pop: 550, prodHora: 14100, cap: 1410000 }, { nivel: 28, pop: 550, prodHora: 14900, cap: 1490000 },
    { nivel: 29, pop: 550, prodHora: 15700, cap: 1570000 }, { nivel: 30, pop: 550, prodHora: 16500, cap: 1650000 },
    { nivel: 31, pop: 550, prodHora: 17500, cap: 1750000 }, { nivel: 32, pop: 550, prodHora: 18500, cap: 1850000 },
    { nivel: 33, pop: 550, prodHora: 19500, cap: 1950000 }, { nivel: 34, pop: 550, prodHora: 20500, cap: 2050000 },
    { nivel: 35, pop: 550, prodHora: 21500, cap: 2150000 },
  ],
  Serraria: [
    { nivel: 1,  pop: 5,   prodHora: 100,   cap: 10000   }, { nivel: 2,  pop: 10,  prodHora: 300,   cap: 30000   },
    { nivel: 3,  pop: 20,  prodHora: 600,   cap: 60000   }, { nivel: 4,  pop: 60,  prodHora: 1000,  cap: 100000  },
    { nivel: 5,  pop: 120, prodHora: 1500,  cap: 150000  }, { nivel: 6,  pop: 210, prodHora: 2100,  cap: 210000  },
    { nivel: 7,  pop: 280, prodHora: 2800,  cap: 280000  }, { nivel: 8,  pop: 360, prodHora: 3600,  cap: 360000  },
    { nivel: 9,  pop: 450, prodHora: 4500,  cap: 450000  }, { nivel: 10, pop: 550, prodHora: 5500,  cap: 550000  },
    { nivel: 11, pop: 550, prodHora: 5850,  cap: 585000  }, { nivel: 12, pop: 550, prodHora: 6200,  cap: 620000  },
    { nivel: 13, pop: 550, prodHora: 6550,  cap: 655000  }, { nivel: 14, pop: 550, prodHora: 6900,  cap: 690000  },
    { nivel: 15, pop: 550, prodHora: 7250,  cap: 725000  }, { nivel: 16, pop: 550, prodHora: 7700,  cap: 770000  },
    { nivel: 17, pop: 550, prodHora: 8150,  cap: 815000  }, { nivel: 18, pop: 550, prodHora: 8600,  cap: 860000  },
    { nivel: 19, pop: 550, prodHora: 9050,  cap: 905000  }, { nivel: 20, pop: 550, prodHora: 9500,  cap: 950000  },
    { nivel: 21, pop: 550, prodHora: 10100, cap: 1010000 }, { nivel: 22, pop: 550, prodHora: 10700, cap: 1070000 },
    { nivel: 23, pop: 550, prodHora: 11300, cap: 1130000 }, { nivel: 24, pop: 550, prodHora: 11900, cap: 1190000 },
    { nivel: 25, pop: 550, prodHora: 12500, cap: 1250000 }, { nivel: 26, pop: 550, prodHora: 13300, cap: 1330000 },
    { nivel: 27, pop: 550, prodHora: 14100, cap: 1410000 }, { nivel: 28, pop: 550, prodHora: 14900, cap: 1490000 },
    { nivel: 29, pop: 550, prodHora: 15700, cap: 1570000 }, { nivel: 30, pop: 550, prodHora: 16500, cap: 1650000 },
    { nivel: 31, pop: 550, prodHora: 17500, cap: 1750000 }, { nivel: 32, pop: 550, prodHora: 18500, cap: 1850000 },
    { nivel: 33, pop: 550, prodHora: 19500, cap: 1950000 }, { nivel: 34, pop: 550, prodHora: 20500, cap: 2050000 },
    { nivel: 35, pop: 550, prodHora: 21500, cap: 2150000 },
  ],
  Fabrica: [
    { nivel: '1 ao 5',  desc: 'Aprimore para o Nível 6 para treinar Transportes Blindados.' },
    { nivel: 6,         desc: 'Treine Transportes Blindados.' },
    { nivel: '7 ao 12', desc: 'Aprimore para o Nível 14 para treinar Gigantes.' },
    { nivel: 13,        desc: 'Aprimore para o Nível 14 para treinar Gigantes.' },
    { nivel: 14,        desc: 'Treine Gigantes.' },
    { nivel: '15 ao 17',desc: 'Aprimore para o Nível 18 para treinar Espelhos de Fogo.' },
    { nivel: 18,        desc: 'Treine Espelhos de Fogo.' },
    { nivel: 19,        desc: 'Aprimore para o Nível 20 para treinar Transportes Blindados, Gigantes e Espelhos de Fogo.' },
    { nivel: 20,        desc: 'Treine Transportes Blindados, Gigantes e Espelhos de Fogo.' },
    { nivel: 21,        desc: 'Treina Dragonetes da Tempestade.' },
    { nivel: 22,        desc: 'Aprimore para o Nível 24 para treinar Canhões Elétricos.' },
    { nivel: 23,        desc: 'Aprimore para o Nível 24 para treinar Canhões Elétricos.' },
    { nivel: 24,        desc: 'Treina Canhões Elétricos.' },
    { nivel: 25,        desc: 'Aprimore para o Nível 27 para treinar Serpentes Vingativas.' },
    { nivel: 26,        desc: 'Aprimore para o Nível 27 para treinar Serpentes Vingativas.' },
    { nivel: 27,        desc: 'Treina Serpentes Vingativas.' },
    { nivel: 28,        desc: 'Aprimore para o Nível 30 para treinar Magmassauros.' },
    { nivel: 29,        desc: 'Aprimore para o Nível 30 para treinar Magmassauros.' },
    { nivel: 30,        desc: 'Treina Magmassauros.' },
  ],
  Viveiro: [
    { nivel: 1,  desc: 'Pesquise Dragoaria Nível 1.' },
    { nivel: 2,  desc: 'Aprimore para o Nível 4 para pesquisar Dragoaria Nível 2.' },
    { nivel: 3,  desc: 'Aprimore para o Nível 4 para pesquisar Dragoaria Nível 2.' },
    { nivel: 4,  desc: 'Pesquise Dragoaria Nível 1, acelere o treinamento de Dragões de Ataque Rápido.' },
    { nivel: 5,  desc: 'Acelere o treinamento de Dragões de Ataque Rápido.' },
    { nivel: 6,  desc: 'Pesquise Dragoaria Nível 3, acelere o treinamento de Dragões de Ataque Rápido.' },
    { nivel: 7,  desc: 'Acelere o treinamento de Dragões de Ataque Rápido.' },
    { nivel: 8,  desc: 'Pesquise Dragoaria Nível 4, acelere o treinamento de Dragões de Ataque Rápido.' },
    { nivel: 9,  desc: 'Acelere o treinamento de Dragões de Ataque Rápido.' },
    { nivel: 10, desc: 'Pesquise Dragoaria Nível 5, acelere o treinamento de Dragões de Ataque Rápido e treine Dragões de Combate.' },
    { nivel: 11, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate.' },
    { nivel: 12, desc: 'Pesquise Dragoaria Nível 6, acelere o treinamento de Dragões de Ataque Rápido e de Dragões de Combate.' },
    { nivel: 13, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate.' },
    { nivel: 14, desc: 'Pesquise Dragoaria Nível 7, acelere o treinamento de Dragões de Ataque Rápido e de Dragões de Combate.' },
    { nivel: 15, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate.' },
    { nivel: 16, desc: 'Pesquise Dragoaria Nível 8, acelere o treinamento de Dragões de Ataque Rápido e de Dragões de Combate.' },
    { nivel: 17, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate.' },
    { nivel: 18, desc: 'Pesquise Dragoaria Nível 9, acelere o treinamento de Dragões de Ataque Rápido e de Dragões de Combate.' },
    { nivel: 19, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate.' },
    { nivel: 20, desc: 'Pesquise Dragoaria Nível 10, acelere o treinamento de Dragões de Ataque Rápido e de Dragões de Combate.' },
    { nivel: 21, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate.' },
    { nivel: 22, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate.' },
    { nivel: 23, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate.' },
    { nivel: 24, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate.' },
    { nivel: 25, desc: 'Acelere o treinamento de Dragões de Ataque Rápido e Dragões de Combate, e desbloqueia o treinamento do Dragão do Veneno.' },
    { nivel: 26, desc: 'Acelere o treinamento de Dragão do Veneno.' },
    { nivel: 27, desc: 'Acelere o treinamento de Dragão do Veneno.' },
    { nivel: 28, desc: 'Acelere o treinamento de Dragão do Veneno.' },
    { nivel: 29, desc: 'Acelere o treinamento de Dragão do Veneno.' },
    { nivel: 30, desc: 'Acelere o treinamento de Dragão do Veneno, e desbloqueia o treinamento do Cavaleiro Dragão.' },
  ],
};

// ── GET /api/edificios (público) ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const lista = await Edificio.find().sort({ ordem: 1, nome: 1 });
    res.json({ edificios: lista, total: lista.length });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /api/edificios/:slug ─────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const ed = await Edificio.findOne({ slug: req.params.slug });
    if (!ed) return res.status(404).json({ erro: 'Edifício não encontrado.' });
    res.json(ed);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/edificios (admin) ──────────────────────────────────────────────
router.post('/', autenticar, async (req, res) => {
  const { slug, nome, icone, tag, descricao, colunas, ordem } = req.body;
  if (!slug?.trim() || !nome?.trim())
    return res.status(400).json({ erro: 'Slug e nome são obrigatórios.' });
  try {
    const ed = await Edificio.create({ slug: slug.trim(), nome: nome.trim(), icone, tag, descricao, colunas: colunas || [], ordem: ordem || 0, niveis: [] });
    res.status(201).json(ed);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ erro: `Já existe um edifício com o slug "${slug}".` });
    res.status(500).json({ erro: err.message });
  }
});

// ── PUT /api/edificios/:slug/meta (admin) ─────────────────────────────────────
router.put('/:slug/meta', autenticar, async (req, res) => {
  const { nome, icone, tag, descricao, colunas, ordem } = req.body;
  try {
    const ed = await Edificio.findOneAndUpdate(
      { slug: req.params.slug },
      { nome, icone, tag, descricao, colunas: colunas || [], ordem: ordem ?? 0, atualizadoEm: new Date() },
      { new: true, runValidators: true }
    );
    if (!ed) return res.status(404).json({ erro: 'Edifício não encontrado.' });
    res.json(ed);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── PUT /api/edificios/:slug/niveis (admin) — substitui array inteiro ─────────
router.put('/:slug/niveis', autenticar, async (req, res) => {
  const { niveis } = req.body;
  if (!Array.isArray(niveis)) return res.status(400).json({ erro: 'niveis deve ser um array.' });
  try {
    const ed = await Edificio.findOneAndUpdate(
      { slug: req.params.slug },
      { niveis, atualizadoEm: new Date() },
      { new: true }
    );
    if (!ed) return res.status(404).json({ erro: 'Edifício não encontrado.' });
    res.json(ed);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── DELETE /api/edificios/:slug (admin) ───────────────────────────────────────
router.delete('/:slug', autenticar, async (req, res) => {
  try {
    const ed = await Edificio.findOneAndDelete({ slug: req.params.slug });
    if (!ed) return res.status(404).json({ erro: 'Edifício não encontrado.' });
    res.json({ mensagem: `"${ed.nome}" removido com sucesso.` });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── POST /api/edificios/importar (admin) ──────────────────────────────────────
router.post('/importar', autenticar, async (req, res) => {
  let inseridos = 0, atualizados = 0;
  try {
    for (const slug of Object.keys(EDIFICIOS_META)) {
      const meta = EDIFICIOS_META[slug];
      const niveis = EDIFICIOS_NIVEIS[slug] || [];
      const colunas = EDIFICIOS_COLUNAS[slug] || [];
      const existe = await Edificio.findOne({ slug });
      if (existe) {
        await Edificio.updateOne({ slug }, { ...meta, nome: slug, colunas, niveis, atualizadoEm: new Date() });
        atualizados++;
      } else {
        await Edificio.create({ slug, nome: slug, ...meta, colunas, niveis });
        inseridos++;
      }
    }
    res.json({ ok: true, inseridos, atualizados, total: inseridos + atualizados });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

export default router;
