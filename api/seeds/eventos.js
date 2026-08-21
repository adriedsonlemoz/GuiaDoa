const reward = (nome, quantidade, extras = {}) => ({ nome, quantidade, ...extras });
const individual = (requisito, itens) => ({ tipo:'individual', requisito, itens });
const ranking = (classificacao, itens) => { const [a,b=a]=String(classificacao).split('-').map(Number); return { tipo:'ranking', classificacao, posicaoInicio:a||null, posicaoFim:b||a||null, itens }; };
const rule = (texto, ordem, en='') => ({ id:`regra-${ordem+1}`, ordem, texto, ...(en?{i18n:{'en-US':{texto:en}}}:{}) });
const troop = (nome, quantidade, referencia) => reward(nome, quantidade, { tipoReferencia:'tropa', referenciaSlug:referencia });
const phase = (codigo,nome,diaInicio,diaFim,objetivo,descricao,torneioId,recompensas=[],en={}) => ({ codigo,nome,diaInicio,diaFim,objetivo,descricao,torneioId,mecanica:torneioId,recompensas,i18n:{'en-US':en} });

const inicio='2026-08-21T00:00:00.000Z';
const fim='2026-08-28T00:00:00.000Z';

export const EVENTOS_SEED = [{
  slug:'corrida-armamentista', nome:'Corrida Armamentista', categoria:'desenvolvimento',
  resumo:'Evento de 7 dias com observação, quatro fases competitivas e classificação final.',
  descricao:'Durante a Corrida Armamentista, cada fase usa uma mecânica diferente. Consulte a fase ativa, calcule os pontos e acompanhe as recompensas.',
  servidorFuso:'UTC', horarioReset:'00:00', ativo:true, inicioServidor:inicio, fimServidor:fim,
  regras:[
    rule('O relógio oficial do evento segue o reset global do jogo às 00:00 UTC.',0,'The event follows the game global reset at 00:00 UTC.'),
    rule('O primeiro dia é de observação e não deve ser confundido com a Fase 1.',1,'The first day is an observation period and is not Phase 1.'),
    rule('Fase 1: use acelerações. Cada minuto utilizado vale 1 ponto.',2,'Phase 1: use speedups. Each minute used is worth 1 point.'),
    rule('Fase 2: aumente o XP de um General usando cartas ou outros Generais como material. A pontuação acompanha o XP efetivamente adicionado.',3,'Phase 2: increase a General XP using cards or other Generals as material. Points follow the XP actually added.'),
    rule('Fase 3: treine tropas. A pontuação é calculada pelo poder da tropa treinada.',4,'Phase 3: train troops. Score is based on the power of the trained troop.'),
    rule('Fase 4: elimine tropas inimigas. Os pontos dependem da quantidade eliminada e do poder de cada tropa.',5,'Phase 4: eliminate enemy troops. Points depend on quantity eliminated and troop power.'),
    rule('Batalhas em eventos especiais que não registram eliminações normais não contam para a fase de eliminação.',6,'Special-event battles that do not register normal eliminations do not count for the elimination phase.'),
  ],
  fases:[
    phase('observacao','Observação',1,1,'Leia as regras e prepare recursos.','Período de observação. A primeira fase competitiva ainda não começou.','',[],{nome:'Observation',objetivo:'Read the rules and prepare resources.',descricao:'Observation period. The first competitive phase has not started yet.'}),
    phase('fase-1','Fase 1 — Acelerações',2,2,'Usar acelerações para ganhar pontos.','Cada 1 minuto de aceleração utilizado vale 1 ponto. Use o calculador de Acelerações para planejar sua pontuação.','aceleracoes',[
      individual(10,[reward('Pedra da Névoa Malva',2),reward('Aceleração de 15 Minutos',1),troop('100 Gigantes',2,'Gigantes')]),
      individual(100,[reward('Pedra da Névoa Malva',3),reward('Aceleração de 15 Minutos',1),troop('100 Gigantes',3,'Gigantes')]),
      individual(500,[reward('Pedra da Névoa Malva',5),reward('Aceleração de 15 Minutos',1),reward('Tubo Multiplicador de Elixir Antropo',1),troop('100 Gigantes',5,'Gigantes')]),
      ranking('1',[reward('Estilhaço de Alma Luna',30),reward('Pedra da Névoa Malva',100),troop('1000 Gigantes',10,'Gigantes'),reward('Aceleração de 15 Minutos',20)]),
      ranking('2-3',[reward('Estilhaço de Alma Luna',20),reward('Pedra da Névoa Malva',80),reward('Aceleração de 15 Minutos',15),troop('1000 Gigantes',8,'Gigantes')]),
      ranking('4-10',[reward('Estilhaço de Alma Luna',15),reward('Pedra da Névoa Malva',50),reward('Aceleração de 15 Minutos',10),troop('1000 Gigantes',5,'Gigantes')]),
    ],{nome:'Phase 1 — Speedups',objetivo:'Use speedups to earn points.',descricao:'Each minute of speedup used is worth 1 point. Use the Speedups calculator to plan your score.'}),
    phase('fase-2','Fase 2 — Aprimoramento de General',3,3,'Aumentar o XP de um General.','Escolha um General e use cartas ou outros Generais como material. Cartas podem ter valores diferentes; se o material já possuir XP, considere o XP efetivamente transferido.','general',[
      individual(500,[reward('Pedra da Luz do Oceano',2),reward('Aceleração de 15 Minutos',1),troop('100 Abissais',4,'Abissal')]),
      individual(1000,[reward('Pedra da Luz do Oceano',3),reward('Aceleração de 15 Minutos',1),troop('100 Abissais',6,'Abissal')]),
      individual(5000,[reward('Pedra da Luz do Oceano',5),reward('Aceleração de 15 Minutos',1),reward('Tubo Multiplicador de Elixir Antropo',1),troop('100 Abissais',10,'Abissal')]),
    ],{nome:'Phase 2 — General Upgrade',objetivo:'Increase a General XP.',descricao:'Choose a General and use cards or other Generals as material. Card values vary; use the XP actually transferred.'}),
    phase('fase-3','Fase 3 — Recrutamento de Tropas',4,4,'Treinar tropas para ganhar pontos.','Use o calculador de Treinamento de Tropas. A pontuação usa a quantidade treinada e o poder cadastrado da tropa.','treino_tropa',[
      individual(100,[reward('Pedra do Brilho do Sol',2),reward('Aceleração de 15 Minutos',1),troop('100 Espelhos de Fogo',4,'Espelhos de Fogo')]),
      individual(500,[reward('Pedra do Brilho do Sol',3),reward('Aceleração de 15 Minutos',1),troop('100 Espelhos de Fogo',6,'Espelhos de Fogo')]),
      individual(1000,[reward('Pedra do Brilho do Sol',5),reward('Aceleração de 15 Minutos',1),reward('Tubo Multiplicador de Elixir Antropo',1),troop('100 Espelhos de Fogo',10,'Espelhos de Fogo')]),
    ],{nome:'Phase 3 — Troop Recruitment',objetivo:'Train troops to earn points.',descricao:'Use the Troop Training calculator. Score uses trained quantity and the troop power registered in the guide.'}),
    phase('fase-4','Fase 4 — Eliminação de Tropas Inimigas',5,6,'Eliminar tropas inimigas para ganhar pontos.','A pontuação é quantidade eliminada × poder da tropa. Ex.: 10.000 Espiões (poder 2) = 20.000 pontos; 10.000 Espelhos de Fogo (poder 10) = 100.000 pontos.','matar_tropas',[
      individual(100,[reward('Pedra do Florescer do Bosque',2),reward('Aceleração de 15 Minutos',1),troop('100 Terror do Pântano',2,'Terror do Pântano')]),
      individual(500,[reward('Pedra do Florescer do Bosque',3),reward('Aceleração de 15 Minutos',1),troop('100 Terror do Pântano',3,'Terror do Pântano')]),
      individual(1000,[reward('Pedra do Florescer do Bosque',5),reward('Aceleração de 15 Minutos',1),troop('100 Terror do Pântano',5,'Terror do Pântano')]),
      ranking('1',[reward('Estilhaço de Alma Luna',30),reward('Pedra do Florescer do Bosque',100),reward('Aceleração de 15 Minutos',10),troop('1000 Terror do Pântano',10,'Terror do Pântano')]),
    ],{nome:'Phase 4 — Enemy Troop Elimination',objetivo:'Eliminate enemy troops to earn points.',descricao:'Score is eliminated quantity × troop power. Example: 10,000 Spies (power 2) = 20,000 points.'}),
    phase('classificacao','Classificação do evento',7,7,'Conferir o ranking final e as recompensas.','A pontuação total considera as fases anteriores.','',[],{nome:'Event Ranking',objetivo:'Review the final ranking and rewards.',descricao:'The total score considers the previous phases.'}),
  ],
  recompensas:[
    ranking('1',[reward('Arca de Recursos',10),troop('1000 Ogros de Granito',10,'Ogros de Granito'),reward('Estilhaço de Alma Luna',100),reward('Arca Customizável de Poção de Tomos',20),reward('Chave dos Tomos de Matador de Dragão',1)]),
    ranking('2-3',[reward('Arca de Recursos',8),troop('1000 Ogros de Granito',8,'Ogros de Granito'),reward('Estilhaço de Alma Luna',80),reward('Arca Customizável de Poção de Tomos',15),reward('Chave dos Tomos de Matador de Dragão',1)]),
    ranking('4-10',[reward('Arca de Recursos',5),troop('1000 Ogros de Granito',5,'Ogros de Granito'),reward('Estilhaço de Alma Luna',60),reward('Arca Customizável de Poção de Tomos',10),reward('Chave dos Tomos de Matador de Dragão',1)]),
    ranking('11-20',[reward('Estilhaço de Alma Luna',50),reward('Arca de Recursos',4),troop('1000 Ogros de Granito',4,'Ogros de Granito'),reward('Arca Customizável de Poção de Tomos',8),reward('Chave dos Tomos de Matador de Dragão',1)]),
  ],
  ocorrencias:[345,346,347,348].map(id=>({ codigo:`corrida-armamentista-${id}-2026-08`, reinoId:id, reinoNome:({345:'Corvith',346:'Kenorax',347:'Eisenhold',348:'Zulanka'})[id], fusoReino:({345:'UTC+0',346:'UTC-7',347:'UTC+1',348:'UTC-4'})[id], inicioServidor:inicio, fimServidor:fim, confirmado:true, observacao:'Ocorrência confirmada para o grupo dos 4 reinos mais recentes.' })),
  fonte:{ tipo:'capturas', data:'2026-08-20', descricao:'Capturas fornecidas pelo usuário e ajustes de calendário confirmados em 21/08/2026.', verificado:true },
  i18n:{'en-US':{nome:'Arms Race',resumo:'A 7-day event with observation, four competitive phases, and a final ranking.',descricao:'Each Arms Race phase uses a different mechanic. Check the active phase, calculate points, and review rewards.'}},
}];
