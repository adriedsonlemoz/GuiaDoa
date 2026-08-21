const reward = (nome, quantidade, extras = {}) => ({ nome, quantidade, ...extras });
const individual = (requisito, itens) => ({ tipo:'individual', requisito, itens });
const ranking = (classificacao, itens) => ({ tipo:'ranking', classificacao, itens });

export const EVENTOS_SEED = [{
  slug:'corrida-armamentista',
  nome:'Corrida Armamentista',
  categoria:'desenvolvimento',
  resumo:'Evento de 7 dias dividido em pré-abertura, quatro fases competitivas e um dia final de classificação.',
  descricao:'Quanto melhor a ferramenta, melhor o ferreiro. Todos os lordes devem trabalhar pesado para aprimorar armas e tornar o reino mais forte!',
  servidorFuso:'UTC',
  horarioReset:'00:00',
  ativo:true,
  regras:[
    'O evento dura 7 dias e é atualizado diariamente às 00:00 UTC.',
    'Dia 1 é a pré-abertura; Dia 2 Fase 1; Dia 3 Fase 2; Dia 4 Fase 3; Dias 5 e 6 Fase 4; Dia 7 classificação.',
    'Os pontos de cada fase são somados à pontuação total do evento.',
    'Recompensas progressivas são enviadas por correio quando os requisitos são cumpridos.',
    'Recompensas de classificação da fase são enviadas ao fim da fase correspondente.',
    'Recompensas de classificação do evento são enviadas no fim da Fase 4.',
    'Ao treinar tropas, os pontos são atribuídos ao fim da fase de eliminação de soldado inimigo e a parte decimal do Poder é descartada.',
    'Batalhas em eventos especiais não contam na Fase de eliminação de soldado inimigo.',
  ],
  fases:[
    { codigo:'pre-abertura', nome:'Pré-abertura', diaInicio:1, diaFim:1, objetivo:'Consulta das informações do evento.', observacao:'Sem pontuação ativa.', i18n:{'en-US':{nome:'Pre-opening',objetivo:'Review event information.'}} },
    { codigo:'fase-1', nome:'Fase 1 — Aceleração de Desenvolvimento', diaInicio:2, diaFim:2, objetivo:'Aceleração de Desenvolvimento', recompensas:[
      individual(10,[reward('Pedra da Névoa Malva',2),reward('Aceleração de 15 Minutos',1),reward('100 Gigantes',2)]),
      individual(100,[reward('Pedra da Névoa Malva',3),reward('Aceleração de 15 Minutos',1),reward('100 Gigantes',3)]),
      individual(500,[reward('Pedra da Névoa Malva',5),reward('Aceleração de 15 Minutos',1),reward('Tubo Multiplicador de Elixir Antropo',1),reward('100 Gigantes',5)]),
      ranking('1',[reward('Estilhaço de Alma Luna',30),reward('Pedra da Névoa Malva',100),reward('1000 Gigantes',10),reward('Aceleração de 15 Minutos',20)]),
      ranking('2-3',[reward('Estilhaço de Alma Luna',20),reward('Pedra da Névoa Malva',80),reward('Aceleração de 15 Minutos',15),reward('1000 Gigantes',8)]),
      ranking('4-10',[reward('Estilhaço de Alma Luna',15),reward('Pedra da Névoa Malva',50),reward('Aceleração de 15 Minutos',10),reward('1000 Gigantes',5)]),
    ], i18n:{'en-US':{nome:'Phase 1 — Development Acceleration',objetivo:'Development Acceleration'}} },
    { codigo:'fase-2', nome:'Fase 2 — Recrutamento de soldado', diaInicio:3, diaFim:3, objetivo:'Recrutamento de soldado', recompensas:[
      individual(100,[reward('Pedra do Brilho do Sol',2),reward('Aceleração de 15 Minutos',1),reward('100 Espelhos de Fogo',4)]),
      individual(500,[reward('Pedra do Brilho do Sol',3),reward('Aceleração de 15 Minutos',1),reward('100 Espelhos de Fogo',6)]),
      individual(1000,[reward('Pedra do Brilho do Sol',5),reward('Aceleração de 15 Minutos',1),reward('Tubo Multiplicador de Elixir Antropo',1),reward('100 Espelhos de Fogo',10)]),
    ], i18n:{'en-US':{nome:'Phase 2 — Soldier Recruitment',objetivo:'Soldier Recruitment'}} },
    { codigo:'fase-3', nome:'Fase 3 — Aprimoramento de general', diaInicio:4, diaFim:4, objetivo:'Aprimoramento de general', recompensas:[
      individual(500,[reward('Pedra da Luz do Oceano',2),reward('Aceleração de 15 Minutos',1),reward('100 Abissais',4)]),
      individual(1000,[reward('Pedra da Luz do Oceano',3),reward('Aceleração de 15 Minutos',1),reward('100 Abissais',6)]),
      individual(5000,[reward('Pedra da Luz do Oceano',5),reward('Aceleração de 15 Minutos',1),reward('Tubo Multiplicador de Elixir Antropo',1),reward('100 Abissais',10)]),
    ], i18n:{'en-US':{nome:'Phase 3 — General Upgrade',objetivo:'General Upgrade'}} },
    { codigo:'fase-4', nome:'Fase 4 — Eliminação de soldado inimigo', diaInicio:5, diaFim:6, objetivo:'Eliminação de soldado inimigo', recompensas:[
      individual(100,[reward('Pedra do Florescer do Bosque',2),reward('Aceleração de 15 Minutos',1),reward('100 Terror do Pântano',2)]),
      individual(500,[reward('Pedra do Florescer do Bosque',3),reward('Aceleração de 15 Minutos',1),reward('100 Terror do Pântano',3)]),
      individual(1000,[reward('Pedra do Florescer do Bosque',5),reward('Aceleração de 15 Minutos',1),reward('100 Terror do Pântano',5)]),
      ranking('1',[reward('Estilhaço de Alma Luna',30),reward('Pedra do Florescer do Bosque',100),reward('Aceleração de 15 Minutos',10),reward('1000 Terror do Pântano',10)]),
    ], i18n:{'en-US':{nome:'Phase 4 — Enemy Soldier Elimination',objetivo:'Enemy Soldier Elimination'}} },
    { codigo:'classificacao', nome:'Classificação do evento', diaInicio:7, diaFim:7, objetivo:'Consulta do ranking e das recompensas finais.', observacao:'A pontuação total considera as fases anteriores.', i18n:{'en-US':{nome:'Event Ranking',objetivo:'Review ranking and final rewards.'}} },
  ],
  recompensas:[
    ranking('1',[reward('Arca de Recursos',10),reward('1000 Ogros de Granito',10),reward('Estilhaço de Alma Luna',100),reward('Arca Customizável de Poção de Tomos',20),reward('Chave dos Tomos de Matador de Dragão',1)]),
    ranking('2-3',[reward('Arca de Recursos',8),reward('1000 Ogros de Granito',8),reward('Estilhaço de Alma Luna',80),reward('Arca Customizável de Poção de Tomos',15),reward('Chave dos Tomos de Matador de Dragão',1)]),
    ranking('4-10',[reward('Arca de Recursos',5),reward('1000 Ogros de Granito',5),reward('Estilhaço de Alma Luna',60),reward('Arca Customizável de Poção de Tomos',10),reward('Chave dos Tomos de Matador de Dragão',1)]),
    ranking('11-20',[reward('Estilhaço de Alma Luna',50),reward('Arca de Recursos',4),reward('1000 Ogros de Granito',4),reward('Arca Customizável de Poção de Tomos',8),reward('Chave dos Tomos de Matador de Dragão',1)]),
  ],
  ocorrencias:[{
    codigo:'zulanka-2026-08', reinoId:348, reinoNome:'Zulanka', fusoReino:'UTC-4',
    inicioServidor:'2026-08-20T00:00:00.000Z', fimServidor:'2026-08-27T00:00:00.000Z', confirmado:true,
    observacao:'Ocorrência cadastrada a partir das capturas de 20/08/2026. O encerramento segue o reset global do jogo, não 00:00 local do reino.',
  }],
  fonte:{ tipo:'capturas', data:'2026-08-20', descricao:'23 capturas fornecidas pelo usuário no pacote evento.zip.', verificado:true },
  i18n:{ 'en-US':{
    nome:'Arms Race',
    resumo:'A 7-day event split into a pre-opening day, four competitive phases, and a final ranking day.',
    descricao:'The better the tool, the better the blacksmith. Lords work to improve their forces and strengthen the realm.',
  } },
}];
