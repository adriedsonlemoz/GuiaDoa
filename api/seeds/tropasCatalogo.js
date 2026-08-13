function slugify(texto) {
  return String(texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const R = (id, quantidade, nome = '') => ({ id, nome: nome || id, quantidade });
const Q = (tipo, nome, nivel) => ({ tipo, nome, nivel });
const pesquisa = (nome, nivel) => Q('pesquisa', nome, nivel);
const edificio = (nome, nivel) => Q('edificio', nome, nivel);

/**
 * Custos e requisitos extraídos das telas de Guarnição fornecidas pelo usuário.
 * Os valores de "Possui" foram deliberadamente ignorados: são dados pessoais da conta.
 * Campos ausentes na captura ficam ausentes no catálogo; não são inferidos como zero.
 */
export const TROOP_TRAINING = {
  'Milicianos': {
    custos:[R('food',80,'Comida'),R('wood',100,'Madeira'),R('metals',50,'Metais')],
    requisitos:[edificio('Guarnição',1)], populacao:1,
  },
  'Carregadores': {
    custos:[R('food',50,'Comida'),R('wood',150,'Madeira'),R('metals',10,'Metais')],
    requisitos:[edificio('Guarnição',2)], populacao:1,
  },
  'Espiões': {
    custos:[R('food',120,'Comida'),R('wood',200,'Madeira'),R('metals',150,'Metais')],
    requisitos:[pesquisa('Clarividência',1),edificio('Guarnição',4)], populacao:1,
  },
  'Alabardeiros': {
    custos:[R('food',150,'Comida'),R('wood',500,'Madeira'),R('metals',100,'Metais')],
    requisitos:[pesquisa('Metalurgia',1),edificio('Guarnição',4)], populacao:1,
  },
  'Minotauros': {
    custos:[R('food',200,'Comida'),R('wood',150,'Madeira'),R('metals',400,'Metais')],
    requisitos:[pesquisa('Metalurgia',1),edificio('Guarnição',6),edificio('Forja',2)], populacao:1,
  },
  'Arqueiros': {
    aliases:['Arqueiro'],
    custos:[R('food',300,'Comida'),R('wood',350,'Madeira'),R('metals',300,'Metais')],
    requisitos:[pesquisa('Calibração de Armas',1),edificio('Guarnição',8)], populacao:2,
  },
  'Dragões de Ataque Rápido': {
    aliases:['Dragão de Ataque Rápido','Dragão de Ataque Ráp.'],
    custos:[R('food',1000,'Comida'),R('wood',600,'Madeira'),R('metals',500,'Metais')],
    requisitos:[pesquisa('Formação Rápida',1),pesquisa('Dragoria',2),edificio('Guarnição',10),edificio('Viveiro',2)], populacao:3,
  },
  'Dragões de Combate': {
    custos:[R('food',2000,'Comida'),R('wood',500,'Madeira'),R('metals',2500,'Metais')],
    requisitos:[pesquisa('Formação Rápida',5),pesquisa('Dragoria',3),edificio('Guarnição',14),edificio('Forja',10),edificio('Viveiro',10)], populacao:6,
  },
  'Transportes Blindados': {
    custos:[R('food',600,'Comida'),R('wood',1500,'Madeira'),R('metals',350,'Metais')],
    requisitos:[pesquisa('Levitação',3),edificio('Guarnição',12),edificio('Fábrica',6)], populacao:4,
  },
  'Gigantes': {
    custos:[R('food',4000,'Comida'),R('wood',6000,'Madeira'),R('metals',1500,'Metais')],
    requisitos:[pesquisa('Metalurgia',8),pesquisa('Clarividência',3),edificio('Guarnição',18),edificio('Forja',10),edificio('Fábrica',14)], populacao:8,
  },
  'Espelhos de Fogo': {
    custos:[R('food',5000,'Comida'),R('wood',5000,'Madeira'),R('stone',8000,'Pedra'),R('metals',1200,'Metais')],
    requisitos:[pesquisa('Metalurgia',10),pesquisa('Calibração de Armas',10),edificio('Guarnição',20),edificio('Forja',14),edificio('Fábrica',18)], populacao:10,
  },
  'Abissal': {
    custos:[R('food',4000,'Comida'),R('wood',5500,'Madeira'),R('stone',7000,'Pedra'),R('metals',2500,'Metais'),R('pearls',100,'Pérolas')],
    requisitos:[pesquisa('Alvenaria',9),pesquisa('Formação Rápida',8),edificio('Forja',14),edificio('Guarnição',18),edificio('Fábrica',14)], populacao:9,
  },
  'Terror do Pântano': {
    custos:[R('food',1000,'Comida'),R('wood',4000,'Madeira'),R('stone',8000,'Pedra'),R('metals',2000,'Metais'),R('gold',5000,'Ouro'),R('seeds',100,'Sementes')],
    requisitos:[pesquisa('Medicina',8),pesquisa('Clarividência',8),pesquisa('Formação Rápida',9),edificio('Sementeira',9),edificio('Forja',18),edificio('Guarnição',18)], populacao:9,
  },
  'Ogros de Granito': {
    custos:[R('food',3000,'Comida'),R('wood',4000,'Madeira'),R('stone',8000,'Pedra'),R('metals',2000,'Metais'),R('geodes',100,'Geodos')],
    requisitos:[pesquisa('Alvenaria',9),pesquisa('Clarividência',5),pesquisa('Metalurgia',9),edificio('Mina de Geodo',9),edificio('Forja',18),edificio('Guarnição',18)], populacao:8,
  },
  'Bigas de Fogo': {
    custos:[R('food',4000,'Comida'),R('wood',8000,'Madeira'),R('stone',2000,'Pedra'),R('metals',3000,'Metais'),R('sulfur',100,'Enxofre')],
    requisitos:[pesquisa('Calibração de Armas',9),pesquisa('Formação Rápida',9),pesquisa('Metalurgia',9),edificio('Fosso de Fogo',9),edificio('Forja',18),edificio('Guarnição',18)], populacao:9,
  },
  'Serpente Vingativa': {
    custos:[R('food',6000,'Comida'),R('wood',8000,'Madeira'),R('stone',9000,'Pedra'),R('metals',8000,'Metais')],
    requisitos:[pesquisa('Maestria do Golpe',7),pesquisa('Maestria da Defesa',7),edificio('Guarnição',27),edificio('Forja',27),edificio('Fábrica',27)], populacao:9,
  },
  'Canhões Elétricos': {
    aliases:['Canhão Elétrico','Canhão elétrico'],
    custos:[R('food',4000,'Comida'),R('wood',6000,'Madeira'),R('stone',4000,'Pedra'),R('metals',9000,'Metais')],
    requisitos:[pesquisa('Maestria do Alcance',4),edificio('Guarnição',24),edificio('Forja',24),edificio('Fábrica',24)], populacao:11,
  },
  'Dragonetes da Tempestade': {
    aliases:['Dragonete da Tempestade'],
    custos:[R('food',9000,'Comida'),R('wood',4000,'Madeira'),R('stone',6000,'Pedra'),R('metals',9000,'Metais')],
    requisitos:[edificio('Guarnição',21),edificio('Forja',21),edificio('Fábrica',21)], populacao:9,
  },
  'Magmassauros': {
    custos:[R('food',8000,'Comida'),R('wood',8000,'Madeira'),R('stone',9000,'Pedra'),R('metals',9000,'Metais')],
    requisitos:[pesquisa('Maestria do Alcance',10),pesquisa('Maestria da Vida',10),edificio('Guarnição',30),edificio('Forja',30),edificio('Fábrica',30)], populacao:12,
  },
  'Titã Petrificado': {
    custos:[R('food',20000,'Comida'),R('wood',6000,'Madeira'),R('stone',8000,'Pedra'),R('metals',17000,'Metais'),R('ice_crystal',100,'Cristal de Gelo')],
    requisitos:[edificio('Guarnição',30),edificio('Torre do Infinito',15)], populacao:15,
  },
  'Cavaleiro Dragão': {
    custos:[R('food',10000,'Comida'),R('wood',8000,'Madeira'),R('stone',8000,'Pedra'),R('metals',15000,'Metais'),R('gold',20000,'Ouro'),R('ice_crystal',50,'Cristal de Gelo'),R('dark_crystal',50,'Cristal Escuro')],
    requisitos:[pesquisa('Calibração de Armas',10),pesquisa('Formação Rápida',9),pesquisa('Clarividência',7),edificio('Guarnição',35),edificio('Viveiro',30),edificio('Torre do Infinito',30)], populacao:12,
  },
  'Leviatã Ártico': {
    custos:[R('food',8000,'Comida'),R('wood',8500,'Madeira'),R('stone',11000,'Pedra'),R('metals',13500,'Metais'),R('gold',12000,'Ouro'),R('ice_crystal',100,'Cristal de Gelo')],
    requisitos:[edificio('Guarnição',30),edificio('Torre do Infinito',20)], populacao:18,
  },
  'Dragão do Veneno': {
    custos:[R('food',15000,'Comida'),R('wood',20000,'Madeira'),R('stone',12000,'Pedra'),R('metals',5000,'Metais'),R('gold',8000,'Ouro'),R('venom_crystal',50,'Cristal de Veneno'),R('dark_crystal',50,'Cristal Escuro')],
    requisitos:[pesquisa('Metalurgia',9),pesquisa('Formação Rápida',9),pesquisa('Combate Aéreo',9),edificio('Guarnição',32),edificio('Viveiro',25),edificio('Torre do Infinito',25)], populacao:15,
  },
  'Andarilhos da Areia': {
    custos:[R('food',3600,'Comida'),R('wood',4000,'Madeira'),R('stone',5000,'Pedra'),R('metals',7000,'Metais'),R('venom_crystal',100,'Cristal de Veneno')],
    requisitos:[edificio('Guarnição',30),edificio('Torre do Infinito',5)], populacao:7,
  },
  'Hoplita': {
    custos:[R('food',300,'Comida'),R('wood',200,'Madeira'),R('stone',300,'Pedra'),R('metals',450,'Metais'),R('gold',300,'Ouro')],
    requisitos:[pesquisa('Metalurgia',10),pesquisa('Formação Rápida',10),edificio('Mina',20),edificio('Pedreira',20)], populacao:3,
  },
  'Serpentes Arsênicas': {
    aliases:['Serpente Arsênica'],
    custos:[R('food',8000,'Comida'),R('wood',8000,'Madeira'),R('stone',8000,'Pedra'),R('metals',10000,'Metais'),R('gold',5000,'Ouro')],
    requisitos:[pesquisa('Calibração de Armas',10),pesquisa('Formação Rápida',10),edificio('Guarnição',20),edificio('Forja',20),edificio('Fábrica',20)], populacao:20,
  },
  'Amarande': {
    custos:[R('food',6500,'Comida'),R('wood',4000,'Madeira'),R('stone',6000,'Pedra'),R('metals',8000,'Metais'),R('venom_crystal',100,'Cristal de Veneno')],
    requisitos:[edificio('Guarnição',30),edificio('Torre do Infinito',10)], populacao:9,
  },
  'Escevóforo': {
    aliases:['Skeuophoroi'],
    custos:[R('food',50,'Comida'),R('wood',150,'Madeira'),R('metals',10,'Metais')],
    requisitos:[edificio('Guarnição',10)], populacao:1,
  },
};

const PORTRAIT_NAMES = new Set([
  'Milicianos','Carregadores','Espiões','Alabardeiros','Minotauros','Arqueiros','Dragões de Ataque Rápido','Dragões de Combate',
  'Transportes Blindados','Gigantes','Espelhos de Fogo','Abissal','Terror do Pântano','Ogros de Granito','Bigas de Fogo','Serpente Vingativa',
  'Canhões Elétricos','Dragonetes da Tempestade','Magmassauros','Titã Petrificado','Arruinador Dimensional','Cavaleiro Dragão','Leviatã Ártico',
  'Perseguidor das Sombras','Andarilhos da Areia','Hoplita','Escaravelho de Guerra','Golem do Trovão','Serpentes Arsênicas','Gigantes do Gelo',
  'Amarande','Escevóforo','Esmagadores Colossais','Fantasma do Trovão','Lordes da Lava','Entidade Espectral','Caçador de Almas','Guerreiro Sagrado',
  'Caçadores de Dragão Bárbaro','Mago Lagarto','Quimera','Fada da Selva','Centauros Infernais','Condenadores','Cavaleiros Espectrais','Guerreiro do Magma',
  'Megalibgwilia','Medusa','Gatuno Alado','Sapo Tóxico','Dragão do Veneno','Assassino Real','Lorde do Inverno',
]);

const ALIASES = {
  'Gigantes do Gelo':['Gigante do Gelo'],
};

export const TROPA_EXTRA_SEEDS = [{
  nome:'Escevóforo', vida:45, def:10, atqPerto:1, atqDist:0, alcance:0, vel:20, car:200, poder:2, gestao:0,
  tipo:'treinavel', desc:'Uma unidade de transporte lenta, o Escevóforo leva recursos entre cidades e carrega de volta espólios de batalhas lentamente.',
}];

export function enriquecerTropa(tropa) {
  const training = TROOP_TRAINING[tropa.nome];
  const aliases = [...new Set([...(ALIASES[tropa.nome] || []), ...(training?.aliases || [])])];
  const slug = slugify(tropa.nome);
  const imagem = PORTRAIT_NAMES.has(tropa.nome) ? `/assets/troops/${slug}.webp` : (tropa.imagem || '');

  if (tropa.tipo === 'especial') {
    return {
      ...tropa,
      slug,
      ...(aliases.length ? { aliases } : {}),
      ...(imagem ? { imagem } : {}),
      treinamento:{ disponivel:false, obtencao:'evento', dadosCompletos:true, custos:[], requisitos:[], populacao:0 },
    };
  }

  if (!training) {
    return { ...tropa, slug, ...(aliases.length ? { aliases } : {}), ...(imagem ? { imagem } : {}) };
  }

  const { aliases:_ignored, dadosCompletos = true, ...trainingData } = training;
  return {
    ...tropa,
    slug,
    ...(aliases.length ? { aliases } : {}),
    ...(imagem ? { imagem } : {}),
    treinamento:{ disponivel:true, obtencao:'treino', dadosCompletos, custos:[], requisitos:[], populacao:0, ...trainingData },
  };
}

export { slugify as slugTropa };
