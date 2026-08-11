/**
 * Locale base PT-BR — fonte da verdade
 * Todas as chaves da Home estão aqui.
 * Para adicionar uma nova chave: adicione aqui e rode /api/traducoes/seed no admin.
 */
const ptBR = {
  // ── Saudação / header ──────────────────────────────────────────────────────
  'home.saudacao.bom_dia':    'Bom dia',
  'home.saudacao.boa_tarde':  'Boa tarde',
  'home.saudacao.boa_noite':  'Boa noite',
  'home.saudacao.comandante': 'Comandante',
  'home.saudacao.aviso':      'Sua aliança conta com você.',

  // ── Arsenal (grade de ferramentas) ────────────────────────────────────────
  'home.arsenal.titulo':      'Arsenal',
  'home.botao.torneios':      'Torneios',
  'home.botao.torneios.sub':  'Metas & rankings',
  'home.botao.tropas':        'Tropas',
  'home.botao.tropas.sub':    'Enciclopédia',
  'home.botao.dragoes':       'Dragões',
  'home.botao.dragoes.sub':   'Evolução & poder',
  'home.botao.edificios':     'Construções',
  'home.botao.edificios.sub': 'Níveis & efeitos',
  'home.botao.itens':         'Itens',
  'home.botao.itens.sub':     'Armazém',
  'home.botao.niveis':        'Níveis',
  'home.botao.niveis.sub':    'Tabela de XP',
  'home.botao.ilhas':         'Cidade',
  'home.botao.ilhas.sub':     'Sua ilha',
  'home.botao.pesquisas':     'Pesquisas',
  'home.botao.pesquisas.sub': 'Centro de Ciência',
  'home.botao.sobre':         'Info',
  'home.botao.sobre.sub':     'Sobre o app',
  'home.botao.dicas':         'Dicas',
  'home.botao.dicas.sub':     'Guias e tutoriais',
  'home.botao.texto_colorido':     'Texto Colorido',
  'home.botao.texto_colorido.sub': 'Builder de cores',

  // ── Conselheiro Tático ────────────────────────────────────────────────────
  'home.conselheiro.titulo':  'Conselheiro Tático',

  // ── Hora do servidor ──────────────────────────────────────────────────────
  'home.hora.servidor':       'Hora do servidor',
  'home.hora.local':          'Hora local',

  // ── Perfil ────────────────────────────────────────────────────────────────
  'home.perfil.editar':       'Editar perfil',
  'home.perfil.sair':         'Sair',
  'home.perfil.reino':        'Reino',
  'home.perfil.alianca':      'Aliança',
  'home.perfil.poder':        'Poder',

  // ── Torneios — hub (Torneios.jsx) ──────────────────────────────────────────
  'torneio.hub.titulo':       'Codex de Batalha',
  'torneio.hub.subtitulo':    'Selecione o módulo do torneio',
  'torneio.ativo.label':      'Torneio Ativo',
  'torneio.acao.voltar':      'Voltar',
  'torneio.acao.abrindo':     'ABRINDO…',
  'torneio.acao.ver':         'VER ▸',
  'torneio.acao.calcular':    'CALCULAR ▸',

  // ── Torneios — categorias ────────────────────────────────────────────────────
  'torneio.cat.poder':        'Poder',
  'torneio.cat.tropas':       'Tropas',
  'torneio.cat.dragao':       'Dragão',
  'torneio.cat.combate':      'Combate',
  'torneio.cat.alianca':      'Aliança',
  'torneio.cat.magia':        'Magia',

  // ── Torneios — títulos e descrições de cada módulo ───────────────────────────
  'torneio.titulo.general':             'Aprimoramento de General',
  'torneio.desc.general':               'XP pelo Quartel do General',
  'torneio.titulo.aprimoramento_tropa': 'Aprimoramento de Tropa',
  'torneio.desc.aprimoramento_tropa':   'Upgrade de Unidades',
  'torneio.titulo.evolucao_tropas':     'Evolução de Tropas',
  'torneio.desc.evolucao_tropas':       'Raridade e Poder',
  'torneio.titulo.habilidade_dragao':   'Habilidade dos Grandes Dragões',
  'torneio.desc.habilidade_dragao':     'Essência de Fúria',
  'torneio.titulo.matar_tropas':        'Matar Tropas',
  'torneio.desc.matar_tropas':          'Combate e trocas',
  'torneio.titulo.alianca':             'Torneios de Aliança',
  'torneio.desc.alianca':               'Como funcionam',
  'torneio.titulo.pocoes_antigas':      'Torneio de Conhecimento',
  'torneio.desc.pocoes_antigas':        'Poções Antigas',
  'torneio.titulo.talisma':             'Pontos de Talismã',
  'torneio.desc.talisma':               'Torre de Oração',
  'torneio.titulo.poder':               'Torneio de Poder',
  'torneio.desc.poder':                 'Ganhe poder de todas as formas',
  'torneio.titulo.treino_tropa':        'Treino de Tropa',
  'torneio.desc.treino_tropa':          'Recrutamento com bônus',
  'torneio.titulo.treinamento_dragao':  'Treinamento do Dragão',
  'torneio.desc.treinamento_dragao':    'Carnes e XP do Dragão',
  'torneio.titulo.aceleracoes':         'Torneio de Acelerações',
  'torneio.desc.aceleracoes':           'Minutos de aceleração',

  // ── Torneios — labels genéricos (reutilizados pelos submódulos) ─────────────
  'torneio.label.pontos':     'Pontos',
  'torneio.label.total':      'Total de Pontos',
  'torneio.label.possuidos':  'Pontos já possuídos',
  'torneio.label.salvar':     'Salvar',
  'torneio.label.como_funciona': 'Como Funciona',

  // ── Torneios — card de status (TorneioStatusCard.jsx) ───────────────────────
  'torneio.status.titulo':    'Status do Torneio',
  'torneio.status.utc':       'UTC',

  // ── Torneios — layout compartilhado (TorneioLayout.jsx) ─────────────────────
  'torneio.layout.calculadora':     'Calculadora de Torneio',
  'torneio.layout.inventario':      'INVENTÁRIO',
  'torneio.layout.total_de':        'TOTAL DE',
  'torneio.layout.premiacao':       'PREMIAÇÃO',
  'torneio.layout.tropa_premio':    'Tropa como Prêmio',
  'torneio.layout.selecionar_tropa':'— Selecionar Tropa —',
  'torneio.layout.distribuicao':    'Distribuição de Recompensas',
  'torneio.layout.resultados':      'RESULTADOS',
  'torneio.layout.total_tropas':    'Total de Tropas',
  'torneio.layout.poder_total':     'Poder Total',

  // ── Torneios — Aprimoramento de Tropa (TorneioAprimoramentoTropa.jsx) ───────
  'torneio.aprimoramento_tropa.raridade.incomum':    'Incomum',
  'torneio.aprimoramento_tropa.raridade.raro':       'Raro',
  'torneio.aprimoramento_tropa.raridade.epico':      'Épico',
  'torneio.aprimoramento_tropa.raridade.lendario':   'Lendário',
  'torneio.aprimoramento_tropa.raridade.mitologico': 'Mitológico',
  'torneio.aprimoramento_tropa.instrucao':  'Insira a quantidade de aprimoramentos efectuados por raridade de tropa. Cada aprimoramento conta com um valor de pontos diferente.',
  'torneio.aprimoramento_tropa.placeholder_qtd': 'Qtd.',
  'torneio.aprimoramento_tropa.meta.principal': 'Prêmio Principal',
  'torneio.aprimoramento_tropa.meta.m1':    '🏅 Meta 100',
  'torneio.aprimoramento_tropa.meta.m2':    '🥈 Meta 500',
  'torneio.aprimoramento_tropa.meta.m3':    '🥇 Meta 2.000',

  // ── Torneios — Aprimoramento de General (TorneioGeneral.jsx) ────────────────
  'torneio.general.badge':        'TORNEIO INDIVIDUAL',
  'torneio.general.intro_pre':    'O objetivo é ',
  'torneio.general.intro_bold':   'aumentar o XP dos seus generais',
  'torneio.general.intro_pos':    ' ao máximo durante o torneio. Use cartas no Quartel do General para treinar e ganhar experiência — quanto mais XP acumulado, melhor a sua posição no ranking.',
  'torneio.general.dica1.titulo': 'Como Funciona',
  'torneio.general.dica1.texto':  'O torneio consiste em aumentar o XP dos seus generais durante o período. Cada ponto de experiência ganha conta para o seu placar.',
  'torneio.general.dica2.titulo': 'Quartel do General',
  'torneio.general.dica2.texto':  'Acesse o Quartel do General no seu castelo. Lá você encontrará a opção de Treinamento, onde é possível usar cartas para aumentar o XP do general selecionado.',
  'torneio.general.dica3.titulo': 'Cartas de General',
  'torneio.general.dica3.texto':  'O treinamento é feito utilizando outras cartas de general como material. Cartas duplicadas ou de raridade inferior podem ser sacrificadas para gerar XP.',
  'torneio.general.dica4.titulo': 'Raridade das Cartas',
  'torneio.general.dica4.texto':  'Cartas de maior raridade concedem mais XP ao ser usadas no treinamento. Priorize acumular cartas antes do torneio para maximizar o ganho de XP durante o evento.',
  'torneio.general.dica5.titulo': 'Dica Estratégica',
  'torneio.general.dica5.texto':  'Guarde cartas de general ao longo da semana e use-as em massa durante o torneio. Assim você concentra todo o ganho de XP no período de pontuação.',

  // ── Torneios — labels compartilhados extra ───────────────────────────────────
  'torneio.label.como_pontuar':     'Como Pontuar',
  'torneio.label.estrategias_dicas':'Estratégias e Dicas',

  // ── Torneios — Torneio de Poder (TorneioPoder.jsx) ───────────────────────────
  'torneio.poder.intro_pre':    'O objetivo é simples: ',
  'torneio.poder.intro_bold':   'ganhe o máximo de poder possível',
  'torneio.poder.intro_pos':    ' durante o período do torneio. Toda fonte de poder conta — tropas, dragões, pesquisas e generais. Quanto mais você crescer, mais pontos acumula no ranking.',
  'torneio.poder.dica1.titulo': 'Treinar Tropas',
  'torneio.poder.dica1.texto':  'Recrute unidades de qualquer tipo — cada tropa treinada soma diretamente ao seu poder total. Priorize tropas de nível mais alto, pois elas possuem maior valor de poder por unidade.',
  'torneio.poder.dica2.titulo': 'Poder dos Dragões',
  'torneio.poder.dica2.texto':  'Aumente o poder dos seus dragões evoluindo habilidades, alimentando e realizando sessões de treinamento. Cada ponto de poder ganho pelo dragão conta para o torneio.',
  'torneio.poder.dica3.titulo': 'Pesquisas',
  'torneio.poder.dica3.texto':  'Conclua pesquisas na Árvore do Conhecimento durante o período do torneio. Pesquisas militares e econômicas geram poder ao serem finalizadas.',
  'torneio.poder.dica4.titulo': 'Treinar Generais',
  'torneio.poder.dica4.texto':  'Evolua e treine seus generais para acumular poder de comando. Quanto maior o nível e as habilidades do general, maior o poder gerado.',
  'torneio.poder.dica5.titulo': 'Dica de Estratégia',
  'torneio.poder.dica5.texto':  'Combine todas as fontes ao mesmo tempo: enquanto treina tropas, deixe pesquisas rodando e alimentações de dragão programadas. Maximize cada minuto do torneio.',

  // ── Torneios — Matar Tropas (TorneioMatarTropas.jsx) ─────────────────────────
  'torneio.matar_tropas.badge':       'TORNEIO DE COMBATE',
  'torneio.matar_tropas.intro_pre':   'O objetivo é ',
  'torneio.matar_tropas.intro_bold':  'eliminar o maior número possível de tropas inimigas',
  'torneio.matar_tropas.intro_pos':   ' durante o torneio. A estratégia mais eficaz é se organizar com a aliança para realizar trocas controladas de tropas — assim todos pontuam sem desperdício.',
  'torneio.matar_tropas.dica1.texto': 'Os pontos são gerados ao matar tropas de outros jogadores em batalha. Cada unidade inimiga eliminada conta para o seu placar no torneio.',
  'torneio.matar_tropas.dica2.titulo':'Troca de Tropas com a Aliança',
  'torneio.matar_tropas.dica2.texto': 'Combine com membros da sua aliança para trocar tropas e se atacarem mutuamente. Um aliado envia tropas fracas para o seu castelo e você as elimina em batalha — depois reveze. É a forma mais eficiente de acumular abates rapidamente.',
  'torneio.matar_tropas.dica3.titulo':'Ataque a Castelos Desprotegidos',
  'torneio.matar_tropas.dica3.texto': 'Procure castelos sem escudo e com tropas visíveis para atacar. Priorize alvos com maior quantidade de unidades para maximizar o número de abates por ataque.',
  'torneio.matar_tropas.dica4.titulo':'Tropas de Sacrifício',
  'torneio.matar_tropas.dica4.texto': 'Durante a troca com aliados, use tropas de nível mais baixo como "tropas de sacrifício" — elas são mais fáceis de treinar em grande quantidade e geram abates suficientes para pontuar bem.',
  'torneio.matar_tropas.dica5.titulo':'Coordenação é a Chave',
  'torneio.matar_tropas.dica5.texto': 'Use o chat da aliança para organizar as trocas. Combine horários, defina quem envia e quem ataca primeiro, e garanta que todos os participantes se beneficiem igualmente.',
  'torneio.matar_tropas.dica6.titulo':'Dica Extra',
  'torneio.matar_tropas.dica6.texto': 'Evite atacar membros de outras alianças poderosas durante o torneio — o objetivo é acumular abates, não gerar conflitos desnecessários. Mantenha o foco nas trocas internas.',

  // ── Torneios — Torneios de Aliança (TorneioAlianca.jsx) ──────────────────────
  'torneio.alianca.badge':           'TORNEIOS DE ALIANÇA',
  'torneio.alianca.como_funcionam':  'Como Funcionam',
  'torneio.alianca.intro_pre':       'Atualmente existem ',
  'torneio.alianca.intro_bold':      'dois tipos',
  'torneio.alianca.intro_pos':       ' de torneios de aliança. Cada um possui objetivos distintos — conheça abaixo como cada um funciona e como pontuar.',
  'torneio.alianca.poder.desc':      'O objetivo principal é aumentar o seu poder total durante o período do torneio.',
  'torneio.alianca.poder.item1':     'Treine tropas de qualquer tipo — cada unidade recrutada soma poder ao seu castelo.',
  'torneio.alianca.poder.item2':     'Aumente o poder dos seus dragões evoluindo habilidades, alimentando e treinando-os.',
  'torneio.alianca.poder.item3':     'Faça pesquisas na Árvore do Conhecimento para ganhar poder acadêmico.',
  'torneio.alianca.poder.item4':     'Treine e evolua seus generais para acumular mais poder de comando.',
  'torneio.alianca.poder.item5':     'Dica: combine todas as fontes de poder ao mesmo tempo para maximizar o ganho durante o torneio.',
  'torneio.alianca.atual.titulo':    'Torneio de Aliança (Atual)',
  'torneio.alianca.atual.desc':      'O foco é no crescimento coletivo — treinar dragões e contribuir com a aliança.',
  'torneio.alianca.atual.item1':     'Alimente e treine seus dragões regularmente para acumular pontos de aliança.',
  'torneio.alianca.atual.item2':     'Ajude os membros da sua aliança: acelere construções, pesquisas e treinamentos de aliados.',
  'torneio.alianca.atual.item3':     'Participe de ataques em grupo e defesas conjuntas para contribuir com a aliança.',
  'torneio.alianca.atual.item4':     'Dica: coordene com sua aliança para distribuir ajudas e maximizar o total de pontos coletivos.',

  // ── Torneios — toasts genéricos (reutilizados pelas calculadoras) ───────────
  'torneio.toast.salvo_sucesso': 'Dados salvos com sucesso!',
  'torneio.toast.erro_salvar':   'Erro ao salvar os dados.',
  'torneio.label.eq_pts':        '= pts',

  // ── Torneios — Acelerações (TorneioAceleracoes.jsx) ──────────────────────────
  'torneio.aceleracoes.item.1min':  '1 Minuto',
  'torneio.aceleracoes.item.3min':  '3 Minutos',
  'torneio.aceleracoes.item.5min':  '5 Minutos',
  'torneio.aceleracoes.item.15min': '15 Minutos',
  'torneio.aceleracoes.item.1h':    '1 Hora',
  'torneio.aceleracoes.item.2_5h':  '2,5 Horas',
  'torneio.aceleracoes.item.8h':    '8 Horas',
  'torneio.aceleracoes.item.15h':   '15 Horas',
  'torneio.aceleracoes.item.24h':   '24 Horas',
  'torneio.aceleracoes.item.2dias': '2 Dias',
  'torneio.aceleracoes.item.4dias': '4 Dias',
  'torneio.aceleracoes.pt_singular':   'pt/item',
  'torneio.aceleracoes.pt_plural':     'pts/item',
  'torneio.aceleracoes.total_pontos':  'TOTAL DE PONTOS',
  'torneio.aceleracoes.detalhe_itens':     '(itens)',
  'torneio.aceleracoes.detalhe_possuidos': '(possuídos)',
  'torneio.aceleracoes.dica1': 'Use itens de aceleração em qualquer atividade — construção, pesquisa, treino de tropas ou treinamento de dragão — durante o período do torneio.',
  'torneio.aceleracoes.dica2': 'Cada minuto acelerado conta como 1 ponto. Um item de 1 hora vale 60 pontos, 24 horas valem 1.440 e 4 dias valem 5.760 pontos.',
  'torneio.aceleracoes.dica3': 'Conte quantos itens de cada tipo utilizou e preencha as quantidades acima. O total é calculado automaticamente.',
  'torneio.aceleracoes.dica4': 'Dica: acelere construções curtas em sequência para acumular mais pontos com menos itens de longa duração.',

  // ── Torneios — labels genéricos extra ────────────────────────────────────────
  'torneio.label.quantidade':  'Quantidade',
  'torneio.label.pontos_min':  'pontos',

  // ── Torneios — Habilidade dos Grandes Dragões (TorneioHabilidadeDragao.jsx) ─
  'torneio.habilidade_dragao.detalhe_essencias': '(essências)',
  'torneio.habilidade_dragao.nome_item':         'Essência da Fúria',
  'torneio.habilidade_dragao.pts_por_unidade':   '100 pontos por unidade',
  'torneio.habilidade_dragao.dica1': 'Cada Essência da Fúria vale 100 pontos.',
  'torneio.habilidade_dragao.dica2': 'Podem ser obtidas em Antropos nível 10, em Florestas nível 10, em eventos e torneios.',
  'torneio.habilidade_dragao.dica3': 'Também podem ser obtidas no Bastião dos Dragões, na Expedição do Dragão, na aba Loja.',

  // ── Torneios — Evolução de Tropas (EvolucaoTropas.jsx) ───────────────────────
  'torneio.evolucao_tropas.detalhe_fosseis':     '(fósseis)',
  'torneio.evolucao_tropas.fossil.crepusculo1':  'Fóssil Crepúsculo 1',
  'torneio.evolucao_tropas.fossil.crepusculo2':  'Fóssil Crepúsculo 2',
  'torneio.evolucao_tropas.fossil.anciao1':      'Fóssil Ancião 1',
  'torneio.evolucao_tropas.fossil.anciao2':      'Fóssil Ancião 2',
  'torneio.evolucao_tropas.conversao':           '10 itens = 1 pt',
  'torneio.evolucao_tropas.dica1': 'O torneio consiste em usar Fósseis para evoluir as tropas. A cada 10 fósseis utilizados você ganha 1 ponto.',
  'torneio.evolucao_tropas.dica2': 'Para conseguir os fósseis, ataque Antropos do nível 1 ao 10 e colete Lembranças Antigas como recompensa.',
  'torneio.evolucao_tropas.dica3': 'Acesse a Loja de Surpresas e realize a troca das Lembranças Antigas pelos fósseis desejados.',
  'torneio.evolucao_tropas.dica4': 'Também é possível obter fósseis em eventos especiais e torneios ao longo da semana.',
  'torneio.evolucao_tropas.dica5': 'Outra opção é comprar os fósseis diretamente com rubis na loja do jogo.',

  // ── Torneios — Pontos de Talismã (PontosTalisma.jsx) ─────────────────────────
  'torneio.talisma.cor.verde':       'Verde',
  'torneio.talisma.cor.azul':        'Azul',
  'torneio.talisma.cor.roxo':        'Roxo',
  'torneio.talisma.cor.laranja':     'Laranja',
  'torneio.talisma.nome_prefixo':    'Talismã',
  'torneio.talisma.pts_por_unidade': 'pts/unidade',
  'torneio.talisma.detalhe_talismas':'(talismãs)',
  'torneio.talisma.dica1': 'O torneio consiste em acumular talismãs usando a Torre para rezar. Quanto mais talismãs obtidos, maior a pontuação.',
  'torneio.talisma.dica2': 'É possível conseguir 3 talismãs por dia gratuitamente através da Torre de Oração.',
  'torneio.talisma.dica3': 'Os talismãs são aleatórios — pode sair Verde (20 pts), Azul (30 pts), Roxo (800 pts) ou o raro Laranja (12.000 pts).',
  'torneio.talisma.dica4': 'Também é possível obter talismãs extras em eventos especiais e em outros torneios.',
  'torneio.talisma.dica5': 'Outra forma de conseguir é comprando diretamente com rubis na loja do jogo.',

  // ── Torneios — Treinamento do Dragão (TreinamentoDoDragao.jsx) ──────────────
  'torneio.treinamento_dragao.carne.carneiro': 'Carneiro',
  'torneio.treinamento_dragao.carne.boi':      'Boi',
  'torneio.treinamento_dragao.carne.frango':   'Frango',
  'torneio.treinamento_dragao.carne.veado':    'Veado',
  'torneio.treinamento_dragao.carne.salmao':   'Salmão',
  'torneio.treinamento_dragao.carne.lagosta':  'Lagosta',
  'torneio.treinamento_dragao.detalhe_carnes': '(carnes)',
  'torneio.treinamento_dragao.pts_por_item':   'pts/item',
  'torneio.treinamento_dragao.dica1': 'O torneio consiste em alimentar o seu dragão com carnes para aumentar o XP, elevar o nível e o poder. Quanto mais carne utilizada, maior a pontuação.',
  'torneio.treinamento_dragao.dica2': 'Nas savanas de nível 1 ao 10 é possível coletar diariamente: 3 Carneiros, 2 Bois e 3 Frangos.',
  'torneio.treinamento_dragao.dica3': 'Também é possível obter carnes realizando as missões diárias do jogo.',
  'torneio.treinamento_dragao.dica4': 'Carnes podem ser encontradas em torneios, eventos especiais e na Loja de Surpresas.',
  'torneio.treinamento_dragao.dica5': 'Outra opção é comprar carnes diretamente com rubis na loja do jogo.',

  // ── Torneios — Poções Antigas (TorneioPocoes.jsx) ────────────────────────────
  'torneio.pocoes.nome.superior':       'Poção Antiga Superior',
  'torneio.pocoes.nome.intermediaria':  'Poção Antiga Intermediária',
  'torneio.pocoes.nome.primaria':       'Poção Antiga Primária',
  'torneio.pocoes.detalhe_pocoes':      '(poções)',
  'torneio.pocoes.resumo_titulo':       'Resumo',
  'torneio.pocoes.dica1': 'Poção Antiga Superior vale 50 pontos por unidade — a mais rara e valiosa das três.',
  'torneio.pocoes.dica2': 'Poção Antiga Intermediária vale 30 pontos por unidade.',
  'torneio.pocoes.dica3': 'Poção Antiga Primária vale 10 pontos por unidade — mais comum e fácil de acumular.',
  'torneio.pocoes.dica4': 'Poções Antigas podem ser obtidas em eventos, na Arena, na Loja de Surpresas ou comprando pacotes de itens.',
  'torneio.pocoes.dica5': 'Conte quantas poções de cada tipo você usou durante o torneio e preencha as quantidades acima.',

  // ── Torneios — Treino de Tropa (TorneioTreinoTropa.jsx) ──────────────────────
  'torneio.treino_tropa.bonus.x1': 'x1 — Normal',
  'torneio.treino_tropa.bonus.x2': 'x2 — Duplo',
  'torneio.treino_tropa.bonus.x3': 'x3 — Triplo',
  'torneio.treino_tropa.bonus.x4': 'x4 — Quádrup',
  'torneio.treino_tropa.bonus.x5': 'x5 — Quíntup',
  'torneio.treino_tropa.detalhe_treino':     '(treino)',
  'torneio.treino_tropa.tropas_treinadas':   'Tropas Treinadas',
  'torneio.treino_tropa.bonus_label':        'Bônus',
  'torneio.treino_tropa.adicionar_tropa':    '＋ Adicionar Tropa',
  'torneio.treino_tropa.poder_por_un':       'poder/un.',
  'torneio.treino_tropa.bonus_x':            'bônus',
  'torneio.treino_tropa.dica1': 'O torneio consiste em treinar tropas no Quartel durante o período do evento. Os pontos são calculados com base no poder de cada unidade treinada.',
  'torneio.treino_tropa.dica2': 'Algumas tropas concedem bônus de pontuação — como x2 ou x3 — que multiplicam o poder gerado. Escolha o bônus correto no campo acima.',
  'torneio.treino_tropa.dica3': 'Para calcular: selecione a tropa, informe a quantidade treinada e escolha o bônus. O total é atualizado automaticamente.',
  'torneio.treino_tropa.dica4': 'Dica: tropas com bônus x2 ou x3 são muito mais eficientes. Priorize-as quando o bônus estiver ativo durante o torneio.',
};

export default ptBR;

// Array pronto para enviar ao endpoint /api/traducoes/seed
export const CHAVES_SEED = Object.entries(ptBR).map(([chave, textoPT]) => ({ chave, textoPT }));
