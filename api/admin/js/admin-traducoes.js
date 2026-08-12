// ══════════════════════════════════════════════════════════════════════════════
// TRADUÇÕES — por categorias
// ══════════════════════════════════════════════════════════════════════════════

function dataArg(v){return encodeURIComponent(JSON.stringify(v)).replace(/'/g,'%27');}
function fromDataArg(v){return JSON.parse(decodeURIComponent(v));}
function strArg(v){return encodeURIComponent(String(v ?? '')).replace(/'/g,'%27');}
function fromStrArg(v){return decodeURIComponent(v);}
function safeColor(v, fallback='#C8A84A'){return /^#[0-9a-fA-F]{6}$/.test(String(v||'')) ? String(v) : fallback;}
function setLoading(msg='Carregando…'){document.getElementById('content').innerHTML=`<div class="loading"><span class="spinner"></span> ${esc(msg)}</div>`;}

const TR_CATEGORIAS = [
  {
    id:'home', icon:'🏠', label:'Home', cor:'#C8A84A',
    desc:'Saudações, botões da grade, perfil e labels gerais',
    chaves:[
      {chave:'home.saudacao.bom_dia',        textoPT:'Bom dia'},
      {chave:'home.saudacao.boa_tarde',       textoPT:'Boa tarde'},
      {chave:'home.saudacao.boa_noite',       textoPT:'Boa noite'},
      {chave:'home.saudacao.comandante',      textoPT:'Comandante'},
      {chave:'home.saudacao.aviso',           textoPT:'Sua aliança conta com você.'},
      {chave:'home.arsenal.titulo',           textoPT:'Arsenal'},
      {chave:'home.botao.torneios',           textoPT:'Torneios'},
      {chave:'home.botao.torneios.sub',       textoPT:'Metas & rankings'},
      {chave:'home.botao.tropas',             textoPT:'Tropas'},
      {chave:'home.botao.tropas.sub',         textoPT:'Enciclopédia'},
      {chave:'home.botao.dragoes',            textoPT:'Dragões'},
      {chave:'home.botao.dragoes.sub',        textoPT:'Evolução & poder'},
      {chave:'home.botao.edificios',          textoPT:'Construções'},
      {chave:'home.botao.edificios.sub',      textoPT:'Níveis & efeitos'},
      {chave:'home.botao.itens',              textoPT:'Itens'},
      {chave:'home.botao.itens.sub',          textoPT:'Armazém'},
      {chave:'home.botao.niveis',             textoPT:'Níveis'},
      {chave:'home.botao.niveis.sub',         textoPT:'Tabela de XP'},
      {chave:'home.botao.ilhas',              textoPT:'Cidade'},
      {chave:'home.botao.ilhas.sub',          textoPT:'Sua ilha'},
      {chave:'home.botao.pesquisas',          textoPT:'Pesquisas'},
      {chave:'home.botao.pesquisas.sub',      textoPT:'Centro de Ciência'},
      {chave:'home.botao.sobre',              textoPT:'Info'},
      {chave:'home.botao.sobre.sub',          textoPT:'Sobre o app'},
      {chave:'home.botao.texto_colorido',     textoPT:'Texto Colorido'},
      {chave:'home.botao.texto_colorido.sub', textoPT:'Builder de cores'},
      {chave:'home.conselheiro.titulo',       textoPT:'Conselheiro Tático'},
      {chave:'home.hora.servidor',            textoPT:'Hora do servidor'},
      {chave:'home.hora.local',               textoPT:'Hora local'},
      {chave:'home.perfil.editar',            textoPT:'Editar perfil'},
      {chave:'home.perfil.sair',              textoPT:'Sair'},
      {chave:'home.perfil.reino',             textoPT:'Reino'},
      {chave:'home.perfil.alianca',           textoPT:'Aliança'},
      {chave:'home.perfil.poder',             textoPT:'Poder'},
    ],
  },
  {
    id:'tropas', icon:'⚔️', label:'Tropas', cor:'#5C7FA3',
    desc:'Nomes e tipos das tropas',
    dinamico:true, endpoint:'/tropas/todas',
    mapear: item => {
      const slug = (item.slug || item.nome || '').toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
      return [
        {chave:`tropa.${slug}.nome`,    textoPT:item.nome    || ''},
        {chave:`tropa.${slug}.combate`, textoPT:item.combate || ''},
      ].filter(c=>c.textoPT && c.chave.indexOf('undefined')===-1);
    },
  },
  {
    id:'dragoes', icon:'🐉', label:'Dragões', cor:'#5A8A5C',
    desc:'Nomes e elementos dos dragões',
    dinamico:true, endpoint:'/dragoes',
    mapear: item => [
      {chave:`dragao.${item.slug}.nome`,     textoPT:item.nome     || ''},
      {chave:`dragao.${item.slug}.elemento`, textoPT:item.elemento || ''},
    ].filter(c=>c.textoPT),
  },
  {
    id:'edificios', icon:'🏗️', label:'Construções', cor:'#8B6BAE',
    desc:'Nomes dos edifícios',
    dinamico:true, endpoint:'/edificios',
    mapear: item => [
      {chave:`edificio.${item.slug}.nome`, textoPT:item.nome || ''},
    ].filter(c=>c.textoPT),
  },
  {
    id:'pesquisas', icon:'🔬', label:'Pesquisas', cor:'#5A8A7A',
    desc:'Nomes das pesquisas',
    dinamico:true, endpoint:'/pesquisas',
    mapear: item => [
      {chave:`pesquisa.${item.slug}.nome`, textoPT:item.nome || ''},
    ].filter(c=>c.textoPT),
  },
  {
    id:'itens', icon:'🎒', label:'Itens', cor:'#A07040',
    desc:'Nomes e categorias dos itens',
    dinamico:true, endpoint:'/itens',
    mapear: item => [
      {chave:`item.${item.slug}.nome`,      textoPT:item.nome      || ''},
      {chave:`item.${item.slug}.categoria`, textoPT:item.categoria || ''},
    ].filter(c=>c.textoPT),
  },
  {
    id:'torneios_hub', icon:'🏆', label:'Menu & Compartilhado', cor:'#C87A2C', grupo:'torneios',
    desc:'Hub, layout da calculadora e labels reutilizados pelos submódulos',
    chaves:[
      {chave:'torneio.hub.titulo',       textoPT:'Codex de Batalha'},
      {chave:'torneio.hub.subtitulo',    textoPT:'Selecione o módulo do torneio'},
      {chave:'torneio.ativo.label',      textoPT:'Torneio Ativo'},
      {chave:'torneio.acao.voltar',      textoPT:'Voltar'},
      {chave:'torneio.acao.abrindo',     textoPT:'ABRINDO…'},
      {chave:'torneio.acao.ver',         textoPT:'VER ▸'},
      {chave:'torneio.acao.calcular',    textoPT:'CALCULAR ▸'},
      {chave:'torneio.cat.poder',        textoPT:'Poder'},
      {chave:'torneio.cat.tropas',       textoPT:'Tropas'},
      {chave:'torneio.cat.dragao',       textoPT:'Dragão'},
      {chave:'torneio.cat.combate',      textoPT:'Combate'},
      {chave:'torneio.cat.alianca',      textoPT:'Aliança'},
      {chave:'torneio.cat.magia',        textoPT:'Magia'},
      {chave:'torneio.titulo.general',             textoPT:'Aprimoramento de General'},
      {chave:'torneio.desc.general',               textoPT:'XP pelo Quartel do General'},
      {chave:'torneio.titulo.aprimoramento_tropa', textoPT:'Aprimoramento de Tropa'},
      {chave:'torneio.desc.aprimoramento_tropa',   textoPT:'Upgrade de Unidades'},
      {chave:'torneio.titulo.evolucao_tropas',     textoPT:'Evolução de Tropas'},
      {chave:'torneio.desc.evolucao_tropas',       textoPT:'Raridade e Poder'},
      {chave:'torneio.titulo.habilidade_dragao',   textoPT:'Habilidade dos Grandes Dragões'},
      {chave:'torneio.desc.habilidade_dragao',     textoPT:'Essência de Fúria'},
      {chave:'torneio.titulo.matar_tropas',        textoPT:'Matar Tropas'},
      {chave:'torneio.desc.matar_tropas',          textoPT:'Combate e trocas'},
      {chave:'torneio.titulo.alianca',             textoPT:'Torneios de Aliança'},
      {chave:'torneio.desc.alianca',               textoPT:'Como funcionam'},
      {chave:'torneio.titulo.pocoes_antigas',      textoPT:'Torneio de Conhecimento'},
      {chave:'torneio.desc.pocoes_antigas',        textoPT:'Poções Antigas'},
      {chave:'torneio.titulo.talisma',             textoPT:'Pontos de Talismã'},
      {chave:'torneio.desc.talisma',               textoPT:'Torre de Oração'},
      {chave:'torneio.titulo.poder',               textoPT:'Torneio de Poder'},
      {chave:'torneio.desc.poder',                 textoPT:'Ganhe poder de todas as formas'},
      {chave:'torneio.titulo.treino_tropa',        textoPT:'Treino de Tropa'},
      {chave:'torneio.desc.treino_tropa',          textoPT:'Recrutamento com bônus'},
      {chave:'torneio.titulo.treinamento_dragao',  textoPT:'Treinamento do Dragão'},
      {chave:'torneio.desc.treinamento_dragao',    textoPT:'Carnes e XP do Dragão'},
      {chave:'torneio.titulo.aceleracoes',         textoPT:'Torneio de Acelerações'},
      {chave:'torneio.desc.aceleracoes',           textoPT:'Minutos de aceleração'},
      {chave:'torneio.status.titulo',    textoPT:'Status do Torneio'},
      {chave:'torneio.status.utc',       textoPT:'UTC'},
      {chave:'torneio.layout.calculadora',      textoPT:'Calculadora de Torneio'},
      {chave:'torneio.layout.inventario',       textoPT:'INVENTÁRIO'},
      {chave:'torneio.layout.total_de',         textoPT:'TOTAL DE'},
      {chave:'torneio.layout.premiacao',        textoPT:'PREMIAÇÃO'},
      {chave:'torneio.layout.tropa_premio',     textoPT:'Tropa como Prêmio'},
      {chave:'torneio.layout.selecionar_tropa', textoPT:'— Selecionar Tropa —'},
      {chave:'torneio.layout.distribuicao',     textoPT:'Distribuição de Recompensas'},
      {chave:'torneio.layout.resultados',       textoPT:'RESULTADOS'},
      {chave:'torneio.layout.total_tropas',     textoPT:'Total de Tropas'},
      {chave:'torneio.layout.poder_total',      textoPT:'Poder Total'},
      {chave:'torneio.label.pontos',       textoPT:'Pontos'},
      {chave:'torneio.label.total',        textoPT:'Total de Pontos'},
      {chave:'torneio.label.possuidos',    textoPT:'Pontos já possuídos'},
      {chave:'torneio.label.salvar',       textoPT:'Salvar'},
      {chave:'torneio.label.como_funciona',     textoPT:'Como Funciona'},
      {chave:'torneio.label.como_pontuar',      textoPT:'Como Pontuar'},
      {chave:'torneio.label.estrategias_dicas', textoPT:'Estratégias e Dicas'},
      {chave:'torneio.label.quantidade',  textoPT:'Quantidade'},
      {chave:'torneio.label.pontos_min',  textoPT:'pontos'},
      {chave:'torneio.label.eq_pts',      textoPT:'= pts'},
      {chave:'torneio.toast.salvo_sucesso', textoPT:'Dados salvos com sucesso!'},
      {chave:'torneio.toast.erro_salvar',   textoPT:'Erro ao salvar os dados.'},
    ],
  },
  {
    id:'torneio_general', icon:'🎖️', label:'General', cor:'#A83C2C', grupo:'torneios',
    desc:'Aprimoramento de General',
    chaves:[
      {chave:'torneio.general.badge',      textoPT:'TORNEIO INDIVIDUAL'},
      {chave:'torneio.general.intro_pre',  textoPT:'O objetivo é '},
      {chave:'torneio.general.intro_bold', textoPT:'aumentar o XP dos seus generais'},
      {chave:'torneio.general.intro_pos',  textoPT:' ao máximo durante o torneio. Use cartas no Quartel do General para treinar e ganhar experiência — quanto mais XP acumulado, melhor a sua posição no ranking.'},
      {chave:'torneio.general.dica1.titulo', textoPT:'Como Funciona'},
      {chave:'torneio.general.dica1.texto',  textoPT:'O torneio consiste em aumentar o XP dos seus generais durante o período. Cada ponto de experiência ganha conta para o seu placar.'},
      {chave:'torneio.general.dica2.titulo', textoPT:'Quartel do General'},
      {chave:'torneio.general.dica2.texto',  textoPT:'Acesse o Quartel do General no seu castelo. Lá você encontrará a opção de Treinamento, onde é possível usar cartas para aumentar o XP do general selecionado.'},
      {chave:'torneio.general.dica3.titulo', textoPT:'Cartas de General'},
      {chave:'torneio.general.dica3.texto',  textoPT:'O treinamento é feito utilizando outras cartas de general como material. Cartas duplicadas ou de raridade inferior podem ser sacrificadas para gerar XP.'},
      {chave:'torneio.general.dica4.titulo', textoPT:'Raridade das Cartas'},
      {chave:'torneio.general.dica4.texto',  textoPT:'Cartas de maior raridade concedem mais XP ao ser usadas no treinamento. Priorize acumular cartas antes do torneio para maximizar o ganho de XP durante o evento.'},
      {chave:'torneio.general.dica5.titulo', textoPT:'Dica Estratégica'},
      {chave:'torneio.general.dica5.texto',  textoPT:'Guarde cartas de general ao longo da semana e use-as em massa durante o torneio. Assim você concentra todo o ganho de XP no período de pontuação.'},
    ],
  },
  {
    id:'torneio_aprimoramento_tropa', icon:'🛡️', label:'Aprimoramento de Tropa', cor:'#5C7FA3', grupo:'torneios',
    desc:'Calculadora de aprimoramento por raridade',
    chaves:[
      {chave:'torneio.aprimoramento_tropa.raridade.incomum',    textoPT:'Incomum'},
      {chave:'torneio.aprimoramento_tropa.raridade.raro',       textoPT:'Raro'},
      {chave:'torneio.aprimoramento_tropa.raridade.epico',      textoPT:'Épico'},
      {chave:'torneio.aprimoramento_tropa.raridade.lendario',   textoPT:'Lendário'},
      {chave:'torneio.aprimoramento_tropa.raridade.mitologico', textoPT:'Mitológico'},
      {chave:'torneio.aprimoramento_tropa.instrucao',       textoPT:'Insira a quantidade de aprimoramentos efectuados por raridade de tropa. Cada aprimoramento conta com um valor de pontos diferente.'},
      {chave:'torneio.aprimoramento_tropa.placeholder_qtd', textoPT:'Qtd.'},
      {chave:'torneio.aprimoramento_tropa.meta.principal',  textoPT:'Prêmio Principal'},
      {chave:'torneio.aprimoramento_tropa.meta.m1', textoPT:'🏅 Meta 100'},
      {chave:'torneio.aprimoramento_tropa.meta.m2', textoPT:'🥈 Meta 500'},
      {chave:'torneio.aprimoramento_tropa.meta.m3', textoPT:'🥇 Meta 2.000'},
    ],
  },
  {
    id:'torneio_poder', icon:'⚡', label:'Poder', cor:'#C87A2C', grupo:'torneios',
    desc:'Torneio de Poder',
    chaves:[
      {chave:'torneio.poder.intro_pre',  textoPT:'O objetivo é simples: '},
      {chave:'torneio.poder.intro_bold', textoPT:'ganhe o máximo de poder possível'},
      {chave:'torneio.poder.intro_pos',  textoPT:' durante o período do torneio. Toda fonte de poder conta — tropas, dragões, pesquisas e generais. Quanto mais você crescer, mais pontos acumula no ranking.'},
      {chave:'torneio.poder.dica1.titulo', textoPT:'Treinar Tropas'},
      {chave:'torneio.poder.dica1.texto',  textoPT:'Recrute unidades de qualquer tipo — cada tropa treinada soma diretamente ao seu poder total. Priorize tropas de nível mais alto, pois elas possuem maior valor de poder por unidade.'},
      {chave:'torneio.poder.dica2.titulo', textoPT:'Poder dos Dragões'},
      {chave:'torneio.poder.dica2.texto',  textoPT:'Aumente o poder dos seus dragões evoluindo habilidades, alimentando e realizando sessões de treinamento. Cada ponto de poder ganho pelo dragão conta para o torneio.'},
      {chave:'torneio.poder.dica3.titulo', textoPT:'Pesquisas'},
      {chave:'torneio.poder.dica3.texto',  textoPT:'Conclua pesquisas na Árvore do Conhecimento durante o período do torneio. Pesquisas militares e econômicas geram poder ao serem finalizadas.'},
      {chave:'torneio.poder.dica4.titulo', textoPT:'Treinar Generais'},
      {chave:'torneio.poder.dica4.texto',  textoPT:'Evolua e treine seus generais para acumular poder de comando. Quanto maior o nível e as habilidades do general, maior o poder gerado.'},
      {chave:'torneio.poder.dica5.titulo', textoPT:'Dica de Estratégia'},
      {chave:'torneio.poder.dica5.texto',  textoPT:'Combine todas as fontes ao mesmo tempo: enquanto treina tropas, deixe pesquisas rodando e alimentações de dragão programadas. Maximize cada minuto do torneio.'},
    ],
  },
  {
    id:'torneio_matar_tropas', icon:'☠️', label:'Matar Tropas', cor:'#A83C2C', grupo:'torneios',
    desc:'Abates e trocas de tropas',
    chaves:[
      {chave:'torneio.matar_tropas.badge',       textoPT:'TORNEIO DE COMBATE'},
      {chave:'torneio.matar_tropas.intro_pre',   textoPT:'O objetivo é '},
      {chave:'torneio.matar_tropas.intro_bold',  textoPT:'eliminar o maior número possível de tropas inimigas'},
      {chave:'torneio.matar_tropas.intro_pos',   textoPT:' durante o torneio. A estratégia mais eficaz é se organizar com a aliança para realizar trocas controladas de tropas — assim todos pontuam sem desperdício.'},
      {chave:'torneio.matar_tropas.dica1.texto', textoPT:'Os pontos são gerados ao matar tropas de outros jogadores em batalha. Cada unidade inimiga eliminada conta para o seu placar no torneio.'},
      {chave:'torneio.matar_tropas.dica2.titulo',textoPT:'Troca de Tropas com a Aliança'},
      {chave:'torneio.matar_tropas.dica2.texto', textoPT:'Combine com membros da sua aliança para trocar tropas e se atacarem mutuamente. Um aliado envia tropas fracas para o seu castelo e você as elimina em batalha — depois reveze. É a forma mais eficiente de acumular abates rapidamente.'},
      {chave:'torneio.matar_tropas.dica3.titulo',textoPT:'Ataque a Castelos Desprotegidos'},
      {chave:'torneio.matar_tropas.dica3.texto', textoPT:'Procure castelos sem escudo e com tropas visíveis para atacar. Priorize alvos com maior quantidade de unidades para maximizar o número de abates por ataque.'},
      {chave:'torneio.matar_tropas.dica4.titulo',textoPT:'Tropas de Sacrifício'},
      {chave:'torneio.matar_tropas.dica4.texto', textoPT:'Durante a troca com aliados, use tropas de nível mais baixo como "tropas de sacrifício" — elas são mais fáceis de treinar em grande quantidade e geram abates suficientes para pontuar bem.'},
      {chave:'torneio.matar_tropas.dica5.titulo',textoPT:'Coordenação é a Chave'},
      {chave:'torneio.matar_tropas.dica5.texto', textoPT:'Use o chat da aliança para organizar as trocas. Combine horários, defina quem envia e quem ataca primeiro, e garanta que todos os participantes se beneficiem igualmente.'},
      {chave:'torneio.matar_tropas.dica6.titulo',textoPT:'Dica Extra'},
      {chave:'torneio.matar_tropas.dica6.texto', textoPT:'Evite atacar membros de outras alianças poderosas durante o torneio — o objetivo é acumular abates, não gerar conflitos desnecessários. Mantenha o foco nas trocas internas.'},
    ],
  },
  {
    id:'torneio_alianca', icon:'🤝', label:'Aliança', cor:'#5A8A5C', grupo:'torneios',
    desc:'Torneios de Aliança (Poder e Aliança Atual)',
    chaves:[
      {chave:'torneio.alianca.badge',          textoPT:'TORNEIOS DE ALIANÇA'},
      {chave:'torneio.alianca.como_funcionam', textoPT:'Como Funcionam'},
      {chave:'torneio.alianca.intro_pre',      textoPT:'Atualmente existem '},
      {chave:'torneio.alianca.intro_bold',     textoPT:'dois tipos'},
      {chave:'torneio.alianca.intro_pos',      textoPT:' de torneios de aliança. Cada um possui objetivos distintos — conheça abaixo como cada um funciona e como pontuar.'},
      {chave:'torneio.alianca.poder.desc',     textoPT:'O objetivo principal é aumentar o seu poder total durante o período do torneio.'},
      {chave:'torneio.alianca.poder.item1',    textoPT:'Treine tropas de qualquer tipo — cada unidade recrutada soma poder ao seu castelo.'},
      {chave:'torneio.alianca.poder.item2',    textoPT:'Aumente o poder dos seus dragões evoluindo habilidades, alimentando e treinando-os.'},
      {chave:'torneio.alianca.poder.item3',    textoPT:'Faça pesquisas na Árvore do Conhecimento para ganhar poder acadêmico.'},
      {chave:'torneio.alianca.poder.item4',    textoPT:'Treine e evolua seus generais para acumular mais poder de comando.'},
      {chave:'torneio.alianca.poder.item5',    textoPT:'Dica: combine todas as fontes de poder ao mesmo tempo para maximizar o ganho durante o torneio.'},
      {chave:'torneio.alianca.atual.titulo',   textoPT:'Torneio de Aliança (Atual)'},
      {chave:'torneio.alianca.atual.desc',     textoPT:'O foco é no crescimento coletivo — treinar dragões e contribuir com a aliança.'},
      {chave:'torneio.alianca.atual.item1',    textoPT:'Alimente e treine seus dragões regularmente para acumular pontos de aliança.'},
      {chave:'torneio.alianca.atual.item2',    textoPT:'Ajude os membros da sua aliança: acelere construções, pesquisas e treinamentos de aliados.'},
      {chave:'torneio.alianca.atual.item3',    textoPT:'Participe de ataques em grupo e defesas conjuntas para contribuir com a aliança.'},
      {chave:'torneio.alianca.atual.item4',    textoPT:'Dica: coordene com sua aliança para distribuir ajudas e maximizar o total de pontos coletivos.'},
    ],
  },
  {
    id:'torneio_aceleracoes', icon:'⏩', label:'Acelerações', cor:'#3B5C8C', grupo:'torneios',
    desc:'Calculadora de itens de aceleração',
    chaves:[
      {chave:'torneio.aceleracoes.item.1min',  textoPT:'1 Minuto'},
      {chave:'torneio.aceleracoes.item.3min',  textoPT:'3 Minutos'},
      {chave:'torneio.aceleracoes.item.5min',  textoPT:'5 Minutos'},
      {chave:'torneio.aceleracoes.item.15min', textoPT:'15 Minutos'},
      {chave:'torneio.aceleracoes.item.1h',    textoPT:'1 Hora'},
      {chave:'torneio.aceleracoes.item.2_5h',  textoPT:'2,5 Horas'},
      {chave:'torneio.aceleracoes.item.8h',    textoPT:'8 Horas'},
      {chave:'torneio.aceleracoes.item.15h',   textoPT:'15 Horas'},
      {chave:'torneio.aceleracoes.item.24h',   textoPT:'24 Horas'},
      {chave:'torneio.aceleracoes.item.2dias', textoPT:'2 Dias'},
      {chave:'torneio.aceleracoes.item.4dias', textoPT:'4 Dias'},
      {chave:'torneio.aceleracoes.pt_singular',  textoPT:'pt/item'},
      {chave:'torneio.aceleracoes.pt_plural',    textoPT:'pts/item'},
      {chave:'torneio.aceleracoes.total_pontos', textoPT:'TOTAL DE PONTOS'},
      {chave:'torneio.aceleracoes.detalhe_itens',     textoPT:'(itens)'},
      {chave:'torneio.aceleracoes.detalhe_possuidos', textoPT:'(possuídos)'},
      {chave:'torneio.aceleracoes.dica1', textoPT:'Use itens de aceleração em qualquer atividade — construção, pesquisa, treino de tropas ou treinamento de dragão — durante o período do torneio.'},
      {chave:'torneio.aceleracoes.dica2', textoPT:'Cada minuto acelerado conta como 1 ponto. Um item de 1 hora vale 60 pontos, 24 horas valem 1.440 e 4 dias valem 5.760 pontos.'},
      {chave:'torneio.aceleracoes.dica3', textoPT:'Conte quantos itens de cada tipo utilizou e preencha as quantidades acima. O total é calculado automaticamente.'},
      {chave:'torneio.aceleracoes.dica4', textoPT:'Dica: acelere construções curtas em sequência para acumular mais pontos com menos itens de longa duração.'},
    ],
  },
  {
    id:'torneio_habilidade_dragao', icon:'🐉', label:'Habilidade do Dragão', cor:'#8B6BAE', grupo:'torneios',
    desc:'Essência da Fúria',
    chaves:[
      {chave:'torneio.habilidade_dragao.detalhe_essencias', textoPT:'(essências)'},
      {chave:'torneio.habilidade_dragao.nome_item',         textoPT:'Essência da Fúria'},
      {chave:'torneio.habilidade_dragao.pts_por_unidade',   textoPT:'100 pontos por unidade'},
      {chave:'torneio.habilidade_dragao.dica1', textoPT:'Cada Essência da Fúria vale 100 pontos.'},
      {chave:'torneio.habilidade_dragao.dica2', textoPT:'Podem ser obtidas em Antropos nível 10, em Florestas nível 10, em eventos e torneios.'},
      {chave:'torneio.habilidade_dragao.dica3', textoPT:'Também podem ser obtidas no Bastião dos Dragões, na Expedição do Dragão, na aba Loja.'},
    ],
  },
  {
    id:'torneio_evolucao_tropas', icon:'⭐', label:'Evolução de Tropas', cor:'#C87A2C', grupo:'torneios',
    desc:'Fósseis e raridade',
    chaves:[
      {chave:'torneio.evolucao_tropas.detalhe_fosseis',    textoPT:'(fósseis)'},
      {chave:'torneio.evolucao_tropas.fossil.crepusculo1', textoPT:'Fóssil Crepúsculo 1'},
      {chave:'torneio.evolucao_tropas.fossil.crepusculo2', textoPT:'Fóssil Crepúsculo 2'},
      {chave:'torneio.evolucao_tropas.fossil.anciao1',     textoPT:'Fóssil Ancião 1'},
      {chave:'torneio.evolucao_tropas.fossil.anciao2',     textoPT:'Fóssil Ancião 2'},
      {chave:'torneio.evolucao_tropas.conversao',          textoPT:'10 itens = 1 pt'},
      {chave:'torneio.evolucao_tropas.dica1', textoPT:'O torneio consiste em usar Fósseis para evoluir as tropas. A cada 10 fósseis utilizados você ganha 1 ponto.'},
      {chave:'torneio.evolucao_tropas.dica2', textoPT:'Para conseguir os fósseis, ataque Antropos do nível 1 ao 10 e colete Lembranças Antigas como recompensa.'},
      {chave:'torneio.evolucao_tropas.dica3', textoPT:'Acesse a Loja de Surpresas e realize a troca das Lembranças Antigas pelos fósseis desejados.'},
      {chave:'torneio.evolucao_tropas.dica4', textoPT:'Também é possível obter fósseis em eventos especiais e torneios ao longo da semana.'},
      {chave:'torneio.evolucao_tropas.dica5', textoPT:'Outra opção é comprar os fósseis diretamente com rubis na loja do jogo.'},
    ],
  },
  {
    id:'torneio_talisma', icon:'🧿', label:'Pontos de Talismã', cor:'#5A8AAE', grupo:'torneios',
    desc:'Torre de Oração e talismãs',
    chaves:[
      {chave:'torneio.talisma.cor.verde',       textoPT:'Verde'},
      {chave:'torneio.talisma.cor.azul',        textoPT:'Azul'},
      {chave:'torneio.talisma.cor.roxo',        textoPT:'Roxo'},
      {chave:'torneio.talisma.cor.laranja',     textoPT:'Laranja'},
      {chave:'torneio.talisma.nome_prefixo',    textoPT:'Talismã'},
      {chave:'torneio.talisma.pts_por_unidade', textoPT:'pts/unidade'},
      {chave:'torneio.talisma.detalhe_talismas',textoPT:'(talismãs)'},
      {chave:'torneio.talisma.dica1', textoPT:'O torneio consiste em acumular talismãs usando a Torre para rezar. Quanto mais talismãs obtidos, maior a pontuação.'},
      {chave:'torneio.talisma.dica2', textoPT:'É possível conseguir 3 talismãs por dia gratuitamente através da Torre de Oração.'},
      {chave:'torneio.talisma.dica3', textoPT:'Os talismãs são aleatórios — pode sair Verde (20 pts), Azul (30 pts), Roxo (800 pts) ou o raro Laranja (12.000 pts).'},
      {chave:'torneio.talisma.dica4', textoPT:'Também é possível obter talismãs extras em eventos especiais e em outros torneios.'},
      {chave:'torneio.talisma.dica5', textoPT:'Outra forma de conseguir é comprando diretamente com rubis na loja do jogo.'},
    ],
  },
  {
    id:'torneio_treinamento_dragao', icon:'🍖', label:'Treinamento do Dragão', cor:'#7A4BAE', grupo:'torneios',
    desc:'Carnes para alimentar o dragão',
    chaves:[
      {chave:'torneio.treinamento_dragao.carne.carneiro', textoPT:'Carneiro'},
      {chave:'torneio.treinamento_dragao.carne.boi',      textoPT:'Boi'},
      {chave:'torneio.treinamento_dragao.carne.frango',   textoPT:'Frango'},
      {chave:'torneio.treinamento_dragao.carne.veado',    textoPT:'Veado'},
      {chave:'torneio.treinamento_dragao.carne.salmao',   textoPT:'Salmão'},
      {chave:'torneio.treinamento_dragao.carne.lagosta',  textoPT:'Lagosta'},
      {chave:'torneio.treinamento_dragao.detalhe_carnes', textoPT:'(carnes)'},
      {chave:'torneio.treinamento_dragao.pts_por_item',   textoPT:'pts/item'},
      {chave:'torneio.treinamento_dragao.dica1', textoPT:'O torneio consiste em alimentar o seu dragão com carnes para aumentar o XP, elevar o nível e o poder. Quanto mais carne utilizada, maior a pontuação.'},
      {chave:'torneio.treinamento_dragao.dica2', textoPT:'Nas savanas de nível 1 ao 10 é possível coletar diariamente: 3 Carneiros, 2 Bois e 3 Frangos.'},
      {chave:'torneio.treinamento_dragao.dica3', textoPT:'Também é possível obter carnes realizando as missões diárias do jogo.'},
      {chave:'torneio.treinamento_dragao.dica4', textoPT:'Carnes podem ser encontradas em torneios, eventos especiais e na Loja de Surpresas.'},
      {chave:'torneio.treinamento_dragao.dica5', textoPT:'Outra opção é comprar carnes diretamente com rubis na loja do jogo.'},
    ],
  },
  {
    id:'torneio_pocoes', icon:'🧪', label:'Poções Antigas', cor:'#8B3A9A', grupo:'torneios',
    desc:'Calculadora de poções antigas',
    chaves:[
      {chave:'torneio.pocoes.nome.superior',      textoPT:'Poção Antiga Superior'},
      {chave:'torneio.pocoes.nome.intermediaria', textoPT:'Poção Antiga Intermediária'},
      {chave:'torneio.pocoes.nome.primaria',      textoPT:'Poção Antiga Primária'},
      {chave:'torneio.pocoes.detalhe_pocoes',     textoPT:'(poções)'},
      {chave:'torneio.pocoes.resumo_titulo',      textoPT:'Resumo'},
      {chave:'torneio.pocoes.dica1', textoPT:'Poção Antiga Superior vale 50 pontos por unidade — a mais rara e valiosa das três.'},
      {chave:'torneio.pocoes.dica2', textoPT:'Poção Antiga Intermediária vale 30 pontos por unidade.'},
      {chave:'torneio.pocoes.dica3', textoPT:'Poção Antiga Primária vale 10 pontos por unidade — mais comum e fácil de acumular.'},
      {chave:'torneio.pocoes.dica4', textoPT:'Poções Antigas podem ser obtidas em eventos, na Arena, na Loja de Surpresas ou comprando pacotes de itens.'},
      {chave:'torneio.pocoes.dica5', textoPT:'Conte quantas poções de cada tipo você usou durante o torneio e preencha as quantidades acima.'},
    ],
  },
  {
    id:'torneio_treino_tropa', icon:'⚔️', label:'Treino de Tropa', cor:'#A83C2C', grupo:'torneios',
    desc:'Calculadora de treino com bônus de pontuação',
    chaves:[
      {chave:'torneio.treino_tropa.bonus.x1', textoPT:'x1 — Normal'},
      {chave:'torneio.treino_tropa.bonus.x2', textoPT:'x2 — Duplo'},
      {chave:'torneio.treino_tropa.bonus.x3', textoPT:'x3 — Triplo'},
      {chave:'torneio.treino_tropa.bonus.x4', textoPT:'x4 — Quádrup'},
      {chave:'torneio.treino_tropa.bonus.x5', textoPT:'x5 — Quíntup'},
      {chave:'torneio.treino_tropa.detalhe_treino',   textoPT:'(treino)'},
      {chave:'torneio.treino_tropa.tropas_treinadas', textoPT:'Tropas Treinadas'},
      {chave:'torneio.treino_tropa.bonus_label',      textoPT:'Bônus'},
      {chave:'torneio.treino_tropa.adicionar_tropa',  textoPT:'＋ Adicionar Tropa'},
      {chave:'torneio.treino_tropa.poder_por_un',     textoPT:'poder/un.'},
      {chave:'torneio.treino_tropa.bonus_x',          textoPT:'bônus'},
      {chave:'torneio.treino_tropa.dica1', textoPT:'O torneio consiste em treinar tropas no Quartel durante o período do evento. Os pontos são calculados com base no poder de cada unidade treinada.'},
      {chave:'torneio.treino_tropa.dica2', textoPT:'Algumas tropas concedem bônus de pontuação — como x2 ou x3 — que multiplicam o poder gerado. Escolha o bônus correto no campo acima.'},
      {chave:'torneio.treino_tropa.dica3', textoPT:'Para calcular: selecione a tropa, informe a quantidade treinada e escolha o bônus. O total é atualizado automaticamente.'},
      {chave:'torneio.treino_tropa.dica4', textoPT:'Dica: tropas com bônus x2 ou x3 são muito mais eficientes. Priorize-as quando o bônus estiver ativo durante o torneio.'},
    ],
  },
];

// Mapa: id da categoria → prefixo das chaves no banco
const TR_PREFIX = {home:'home',tropas:'tropa',dragoes:'dragao',edificios:'edificio',pesquisas:'pesquisa',itens:'item'};

// Grupos que agregam várias categorias em uma única tela intermediária
// (ex: as 13 categorias de torneio aparecem como UM card "Torneios" na grade
// principal; clicar nele abre uma lista vertical com os submódulos).
const TR_GRUPOS = {
  torneios: { id:'torneios', icon:'🏆', label:'Torneios', cor:'#C87A2C',
    desc:'Hub, calculadoras e conteúdo de todos os módulos de torneio' },
};

let TR_LOCALE  = 'en-US';
let TR_CAT     = null;
let TR_DADOS   = [];
let TR_FILTRO  = 'todos';
let TR_EXPAND  = null;
let TR_STATS   = {};
let TR_ULTIMO_ERRO_AUTO = null; // {catId, erros:[{chave,erro}]} — exibido na lista após auto-traduzir com falhas

function badgeTr(doc){
  if(!doc||!doc.traducao) return `<span class="tr-badge tr-badge-sem">Sem tradução</span>`;
  const mp={rascunho:['tr-badge-rascunho','Rascunho'],revisado:['tr-badge-revisado','Revisado'],ativo:['tr-badge-ativo','✓ Ativo']};
  const[cls,lbl]=mp[doc.status]||['tr-badge-rascunho',doc.status];
  return `<span class="tr-badge ${cls}">${lbl}</span>`;
}

const TR_CSS=`<style>
.tr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.tr-cat-card{background:var(--card);border:1.5px solid rgba(200,168,74,0.2);border-radius:11px;
  padding:10px 9px 9px;cursor:pointer;transition:all 0.15s;position:relative;overflow:hidden;
  display:flex;flex-direction:column;gap:4px}
.tr-cat-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.12)}
.tr-cat-bar{position:absolute;top:0;left:0;right:0;height:3px}
.tr-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;
  background:var(--card);border:1.5px solid rgba(200,168,74,0.2);
  border-radius:12px;padding:12px 14px;margin-bottom:12px}
.tr-filtros{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
.tr-filtro{font-size:0.68rem;padding:3px 12px;border-radius:100px;
  border:1.5px solid rgba(200,168,74,0.25);background:transparent;
  color:var(--muted);cursor:pointer;font-family:inherit;
  letter-spacing:0.05em;text-transform:uppercase;transition:all 0.12s}
.tr-filtro.on{background:linear-gradient(135deg,#2A4C72,#1C3A5E);
  color:rgba(200,168,74,0.9);border-color:rgba(200,168,74,0.5)}
.tr-cards{display:flex;flex-direction:column;gap:6px}
.tr-card{background:var(--card);border:1.5px solid rgba(200,168,74,0.2);
  border-radius:12px;overflow:hidden;transition:border-color 0.15s}
.tr-card:hover{border-color:rgba(200,168,74,0.4)}
.tr-card-head{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;user-select:none}
.tr-card-head:hover{background:rgba(200,168,74,0.04)}
.tr-col{flex:1;min-width:0}
.tr-col .lbl{font-size:0.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2px}
.tr-col .val{font-size:0.88rem;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tr-col .val.en{color:var(--text)}
.tr-col .val.vazio{color:#A83C2C;font-style:italic;opacity:0.7}
.tr-chevron{font-size:0.8rem;color:var(--muted);flex-shrink:0;transition:transform 0.2s}
.tr-chevron.open{transform:rotate(90deg)}
.tr-card-body{border-top:1px solid rgba(200,168,74,0.15);padding:14px;background:rgba(200,168,74,0.02)}
.tr-chave-tag{font-family:monospace;font-size:0.68rem;color:var(--muted);
  background:rgba(0,0,0,0.04);padding:3px 8px;border-radius:5px;
  display:inline-block;margin-bottom:10px;word-break:break-all}
.tr-field{margin-bottom:10px}
.tr-field label{display:block;font-size:0.62rem;color:var(--muted);
  text-transform:uppercase;letter-spacing:0.1em;margin-bottom:5px}
.tr-field input{width:100%;background:var(--bg);
  border:1.5px solid rgba(200,168,74,0.3);border-radius:8px;
  color:var(--text);padding:8px 12px;font-size:0.85rem;
  font-family:inherit;outline:none;transition:border-color 0.15s;box-sizing:border-box}
.tr-field input:focus{border-color:var(--gold)}
.tr-field input[readonly]{opacity:0.6;cursor:default;background:rgba(0,0,0,0.03)}
.tr-acoes{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px}
.tr-btn{border-radius:7px;padding:6px 12px;cursor:pointer;font-size:0.72rem;
  font-family:inherit;font-weight:600;letter-spacing:0.04em;transition:all 0.13s;border:1.5px solid}
.tr-btn-auto{background:rgba(184,134,11,0.12);color:#B8860B;border-color:rgba(184,134,11,0.35)}
.tr-btn-save{background:linear-gradient(135deg,#2A4C72,#1C3A5E);color:rgba(200,168,74,0.95);border-color:rgba(200,168,74,0.4)}
.tr-btn-rev{background:rgba(46,125,82,0.12);color:#2E7D52;border-color:rgba(46,125,82,0.35)}
.tr-btn-ativ{background:rgba(28,58,94,0.1);color:#2A4C72;border-color:rgba(28,58,94,0.3)}
.tr-btn-ativ.on{background:linear-gradient(135deg,#2A4C72,#1C3A5E);color:rgba(200,168,74,0.9)}
.tr-badge{display:inline-flex;align-items:center;font-size:0.62rem;padding:2px 8px;
  border-radius:100px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;
  white-space:nowrap;border:1px solid;flex-shrink:0}
.tr-badge-sem{background:rgba(168,60,44,0.12);color:#A83C2C;border-color:rgba(168,60,44,0.3)}
.tr-badge-rascunho{background:rgba(184,134,11,0.12);color:#B8860B;border-color:rgba(184,134,11,0.3)}
.tr-badge-revisado{background:rgba(46,125,82,0.12);color:#2E7D52;border-color:rgba(46,125,82,0.3)}
.tr-badge-ativo{background:rgba(28,58,94,0.12);color:#2A4C72;border-color:rgba(28,58,94,0.3)}
.tr-diag{padding:10px 14px;border-radius:10px;font-size:0.75rem;margin-bottom:10px;line-height:1.6;border:1.5px solid}
.tr-diag.ok{background:rgba(46,125,82,0.08);color:#2E7D52;border-color:rgba(46,125,82,0.3)}
.tr-diag.erro{background:rgba(168,60,44,0.08);color:#A83C2C;border-color:rgba(168,60,44,0.3)}
.tr-diag.aviso{background:rgba(184,134,11,0.08);color:#B8860B;border-color:rgba(184,134,11,0.3)}
.tr-progress-bar{height:5px;background:rgba(200,168,74,0.12);border-radius:5px;overflow:hidden;margin:4px 0}
.tr-progress-fill{height:100%;border-radius:5px;transition:width 0.4s}
.tr-sublist{display:flex;flex-direction:column;gap:7px}
.tr-sub-item{background:var(--card);border:1.5px solid rgba(200,168,74,0.2);border-radius:12px;
  padding:11px 14px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:11px;
  border-left:4px solid transparent}
.tr-sub-item:hover{transform:translateX(2px);box-shadow:0 3px 12px rgba(0,0,0,0.10)}
.tr-sub-icon{width:38px;height:38px;flex-shrink:0;border-radius:10px;display:flex;align-items:center;
  justify-content:center;font-size:1.15rem;background:rgba(200,168,74,0.08)}
.tr-sub-body{flex:1;min-width:0}
.tr-sub-label{font-family:'Cinzel',serif;font-weight:700;font-size:0.82rem;color:var(--text);line-height:1.25}
.tr-sub-desc{font-size:0.66rem;color:var(--muted);margin-top:1px}
.tr-sub-progress{width:64px;flex-shrink:0}
.tr-sub-right{display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0}
</style>`;

// ── TELA 1: Grade de categorias ───────────────────────────────────────────────
// Sincroniza uma categoria dinâmica direto do grid (sem precisar entrar nela)
async function syncRapido(catId){
  const cat = TR_CATEGORIAS.find(c => c.id === catId);
  if (!cat || !cat.dinamico) return;
  toast('↻ Sincronizando '+cat.label+'…','aviso');
  try {
    const dados = await fetch(`${API}${cat.endpoint}`,
      {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json());
    const chaves = Array.isArray(dados)
      ? dados.flatMap(item => cat.mapear(item) || [])
      : [];
    if (!chaves.length) {
      toast('⚠️ Nenhuma chave gerada para '+cat.label+' — verifique se há dados no banco.','aviso');
      return;
    }
    const r = await fetch(`${API}/traducoes/seed`,{
      method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body: JSON.stringify({chaves, locale: TR_LOCALE}),
    });
    const res = await r.json();
    if (!r.ok) { toast('Erro: '+(res.erro||r.status),'erro'); return; }
    toast(`↻ ${cat.label}: ${res.inseridos} novas, ${res.existentes} já existentes`,'ok');
    await carregarTraducoes();
  } catch(e) { toast('Erro ao sincronizar: '+e.message,'erro'); }
}

async function carregarTraducoes(){
  TR_CAT=null; TR_DADOS=[]; TR_FILTRO='todos'; TR_EXPAND=null;
  setLoading('Carregando categorias…');

  // Busca stats e contagens de dinâmicas em paralelo — muito mais rápido
  let statsMap = {}, contsDinamicas = {};
  const dinamicas = TR_CATEGORIAS.filter(c => c.dinamico && !c.grupo);

  try {
    // /admin/stats retorna só contagens agregadas (sem transferir documentos)
    const [statsRes, ...dinamicasRes] = await Promise.all([
      fetch(`${API}/traducoes/admin/stats?locale=${TR_LOCALE}`,
        {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json()),
      ...dinamicas.map(cat =>
        fetch(`${API}${cat.endpoint}`,{headers:{Authorization:`Bearer ${TOKEN}`}})
          .then(r=>r.json()).then(dados=>{
            const lista = Array.isArray(dados) ? dados : (dados.items || dados.tropas || dados.dragoes || dados.edificios || dados.pesquisas || dados.itens || []);
            const total = lista.reduce((acc, item) => acc + (cat.mapear(item)?.length || 0), 0);
            contsDinamicas[cat.id] = total;
          }).catch(()=>{})
      ),
    ]);
    if (statsRes && typeof statsRes === 'object' && !statsRes.erro) statsMap = statsRes;
  } catch(e) { /* stats são opcionais */ }

  TR_STATS = statsMap;

  // Para categorias estáticas com múltiplos prefixos (ex: torneios_hub, torneio_general),
  // usa o total de chaves do próprio array quando o banco não tem nada ainda
  const statsDe = cat => {
    const prefix = TR_PREFIX[cat.id] || cat.id;
    const st = statsMap[prefix] || null;
    if (!st || st.total === 0) {
      if (cat.dinamico && contsDinamicas[cat.id]) {
        return {total: contsDinamicas[cat.id], ativo: 0, sem: contsDinamicas[cat.id]};
      }
      return {total: cat.chaves?.length || 0, ativo: 0, sem: cat.chaves?.length || 0};
    }
    return st;
  };

  // Categorias soltas (sem grupo) entram direto na grade.
  // Categorias com `grupo` são agregadas num único card do grupo.
  const soltas=TR_CATEGORIAS.filter(c=>!c.grupo);
  const gruposPresentes=[...new Set(TR_CATEGORIAS.filter(c=>c.grupo).map(c=>c.grupo))];

  const entradas=[
    ...soltas.map(cat=>({tipo:'cat', cat, st:statsDe(cat)})),
    ...gruposPresentes.map(gid=>{
      const grupo=TR_GRUPOS[gid];
      const membros=TR_CATEGORIAS.filter(c=>c.grupo===gid);
      const st=membros.reduce((acc,c)=>{
        const s=statsDe(c);
        acc.total+=s.total; acc.ativo+=s.ativo; acc.sem+=s.sem;
        return acc;
      },{total:0,ativo:0,sem:0});
      return {tipo:'grupo', grupo, st};
    }),
  ];

  document.getElementById('content').innerHTML = TR_CSS + `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <label style="font-size:0.72rem;color:var(--muted);font-weight:700;letter-spacing:0.08em;text-transform:uppercase">Idioma</label>
      <select onchange="TR_LOCALE=this.value;carregarTraducoes()"
        style="background:var(--bg);border:1.5px solid rgba(200,168,74,0.25);border-radius:8px;
               color:var(--text);padding:6px 12px;font-size:0.82rem;cursor:pointer;outline:none">
        <option value="en-US" ${TR_LOCALE==='en-US'?'selected':''}>🇺🇸 English (en-US)</option>
      </select>
      <button class="btn btn-navy btn-sm" onclick="testarAPITr()">🔍 Testar API de tradução</button>
    </div>
    <div id="tr-diag-box"></div>
    <div class="tr-grid">
      ${entradas.map(({tipo, cat, grupo, st})=>{
        const item = tipo==='grupo' ? grupo : cat;
        const onclick = tipo==='grupo' ? `abrirGrupo('${grupo.id}')` : `abrirCategoria('${cat.id}')`;
        const isDinamicaVazia = tipo==='cat' && cat.dinamico && st.ativo===0;
        const pct=st.total?Math.round((st.ativo/st.total)*100):0;
        const completo=st.total>0&&st.ativo===st.total;
        return `<div class="tr-cat-card" onclick="${onclick}"
          style="border-color:${completo?item.cor+'70':'rgba(200,168,74,0.2)'}">
          <div class="tr-cat-bar" style="background:linear-gradient(90deg,${item.cor},${item.cor}50)"></div>
          <span style="font-size:1.5rem;line-height:1">${item.icon}</span>
          <span style="font-family:'Cinzel',serif;font-weight:700;font-size:0.72rem;color:var(--text);line-height:1.25">${item.label}${tipo==='grupo'?`<br><span style="font-size:0.55rem;color:var(--muted);font-weight:600">(${TR_CATEGORIAS.filter(c=>c.grupo===grupo.id).length} módulos)</span>`:''}</span>
          <div class="tr-progress-bar">
            <div class="tr-progress-fill" style="width:${pct}%;background:${item.cor}"></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:0.56rem;color:var(--muted)">${st.ativo}/${st.total}</span>
            ${completo
              ?`<span class="tr-badge tr-badge-ativo">✓</span>`
              :isDinamicaVazia && st.total>0
                ?`<span class="tr-badge" style="background:rgba(59,92,140,0.15);color:#5C7FA3;border-color:#5C7FA3;cursor:pointer"
                    onclick="event.stopPropagation();syncRapido('${cat.id}')">↻ Sync</span>`
                :st.sem>0
                  ?`<span class="tr-badge tr-badge-sem">${st.sem} sem</span>`
                  :`<span class="tr-badge" style="background:rgba(200,168,74,0.1);color:var(--muted);border-color:rgba(200,168,74,0.2)">0</span>`}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

// ── TELA 1.5: Lista vertical de submódulos de um grupo ────────────────────────
function abrirGrupo(grupoId){
  const grupo=TR_GRUPOS[grupoId];
  if(!grupo) return;
  const membros=TR_CATEGORIAS.filter(c=>c.grupo===grupoId);

  const statsDe=cat=>{
    const prefix=TR_PREFIX[cat.id]||cat.id;
    return (TR_STATS&&TR_STATS[prefix])||{total:cat.chaves?.length||0,ativo:0,sem:cat.chaves?.length||0};
  };

  setBreadcrumb([
    {label:'🌐 Traduções', action:()=>carregarTraducoes()},
    {label:`${grupo.icon} ${grupo.label}`},
  ]);

  document.getElementById('content').innerHTML = TR_CSS + `
    <div style="margin-bottom:14px">
      <p style="font-family:'Cinzel',serif;font-weight:700;font-size:0.95rem;color:var(--text);margin-bottom:3px">
        ${grupo.icon} ${grupo.label}
      </p>
      <p style="font-size:0.72rem;color:var(--muted)">${grupo.desc} — selecione um módulo abaixo</p>
    </div>
    <div class="tr-sublist">
      ${membros.map(cat=>{
        const st=statsDe(cat);
        const pct=st.total?Math.round((st.ativo/st.total)*100):0;
        const completo=st.total>0&&st.ativo===st.total;
        return `<div class="tr-sub-item" onclick="abrirCategoria('${cat.id}')"
          style="border-left-color:${cat.cor}">
          <div class="tr-sub-icon">${cat.icon}</div>
          <div class="tr-sub-body">
            <div class="tr-sub-label">${cat.label}</div>
            <div class="tr-sub-desc">${cat.desc}</div>
          </div>
          <div class="tr-sub-progress">
            <div class="tr-progress-bar"><div class="tr-progress-fill" style="width:${pct}%;background:${cat.cor}"></div></div>
          </div>
          <div class="tr-sub-right">
            <span style="font-size:0.62rem;color:var(--muted)">${st.ativo}/${st.total}</span>
            ${completo
              ?`<span class="tr-badge tr-badge-ativo">✓</span>`
              :st.sem>0
                ?`<span class="tr-badge tr-badge-sem">${st.sem} sem</span>`
                :''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

// ── TELA 2: Lista da categoria ────────────────────────────────────────────────
async function abrirCategoria(catId){
  const cat=TR_CATEGORIAS.find(c=>c.id===catId);
  if(!cat) return;
  TR_CAT=cat; TR_FILTRO='todos'; TR_EXPAND=null;

  const grupo=cat.grupo?TR_GRUPOS[cat.grupo]:null;
  setBreadcrumb([
    {label:'🌐 Traduções', action:()=>carregarTraducoes()},
    ...(grupo?[{label:`${grupo.icon} ${grupo.label}`, action:()=>abrirGrupo(TR_CAT.grupo)}]:[]),
    {label:`${cat.icon} ${cat.label}`},
  ]);
  setLoading(`Carregando ${cat.label}…`);

  try{
    // Determina o prefixo para filtrar apenas as chaves desta categoria no banco
    const prefix = TR_PREFIX[cat.id] || (cat.dinamico ? null : cat.id);
    const urlBanco = prefix
      ? `${API}/traducoes/admin?locale=${TR_LOCALE}&prefixo=${prefix}`
      : `${API}/traducoes/admin?locale=${TR_LOCALE}`;

    // Paraleliza: busca banco e dados da categoria ao mesmo tempo
    const [todosBanco, dadosCat] = await Promise.all([
      fetch(urlBanco, {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json()),
      cat.dinamico
        ? fetch(`${API}${cat.endpoint}`, {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json())
        : Promise.resolve(null),
    ]);

    // 2. Chaves da categoria
    let chavesDaCat = [];
    if (cat.dinamico) {
      const lista = Array.isArray(dadosCat)
        ? dadosCat
        : (dadosCat?.items || dadosCat?.tropas || dadosCat?.dragoes ||
           dadosCat?.edificios || dadosCat?.pesquisas || dadosCat?.itens || []);
      // Corrigido: não filtra por item.slug (Tropas não tem slug)
      lista.forEach(item => {
        const chaves = cat.mapear(item) || [];
        chavesDaCat.push(...chaves);
      });
    } else {
      chavesDaCat = cat.chaves || [];
    }

    // 3. Mescla com o que existe no banco
    const bancoMap = {};
    if (Array.isArray(todosBanco)) todosBanco.forEach(d => { bancoMap[d.chave] = d; });

    TR_DADOS = chavesDaCat
      .filter(c => c.textoPT)
      .map(c => bancoMap[c.chave] || {
        _id:null, chave:c.chave, textoPT:c.textoPT,
        traducao:'', status:'rascunho', fonte:'manual',
      });

    renderListaCategoria();
  }catch(e){ toast('Erro: '+e.message,'erro'); grupo?abrirGrupo(grupo.id):carregarTraducoes(); }
}

function renderListaCategoria(){
  const cat=TR_CAT;
  if(!cat) return;

  const filtrados = TR_FILTRO==='sem'      ? TR_DADOS.filter(d=>!d.traducao)
    : TR_FILTRO==='rascunho' ? TR_DADOS.filter(d=>d.status==='rascunho'&&d.traducao)
    : TR_FILTRO==='revisado' ? TR_DADOS.filter(d=>d.status==='revisado')
    : TR_FILTRO==='ativo'    ? TR_DADOS.filter(d=>d.status==='ativo')
    : TR_DADOS;

  const total=TR_DADOS.length;
  const ativos=TR_DADOS.filter(d=>d.status==='ativo').length;
  const rascunho=TR_DADOS.filter(d=>d.status==='rascunho'&&d.traducao).length;
  const semTrad=TR_DADOS.filter(d=>!d.traducao).length;
  const pct=total?Math.round((ativos/total)*100):0;

  const filtros=['todos','sem','rascunho','revisado','ativo'];
  const fLabels={todos:`Todos (${total})`,sem:`Sem tradução (${semTrad})`,
    rascunho:`Rascunho (${rascunho})`,revisado:'Revisado',ativo:`Ativo (${ativos})`};

  const cardId=chave=>'tr-card-'+chave.replace(/[^a-z0-9]/gi,'-');
  const inpId =chave=>'tr-inp-' +chave.replace(/[^a-z0-9]/gi,'-');
  const bdgId =chave=>'tr-bdg-' +chave.replace(/[^a-z0-9]/gi,'-');
  const safe  =chave=>chave.replace(/'/g,"\\'");

  document.getElementById('content').innerHTML = TR_CSS + `
    <!-- Toolbar -->
    <div class="tr-toolbar">
      <span style="font-size:1.5rem">${cat.icon}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-weight:700;font-size:0.85rem;color:var(--text)">${esc(cat.label)}</div>
        <div style="font-size:0.68rem;color:var(--muted)">${cat.desc}</div>
      </div>
      <button class="btn btn-navy btn-sm" onclick="syncCategoria()">↻ Sincronizar</button>
      <button class="btn btn-navy btn-sm" onclick="autoTraduzirCategoria()">⚡ Auto-traduzir</button>
      <button class="tr-btn tr-btn-rev" style="padding:5px 11px" onclick="ativarRascunhosCategoria()">✓ Ativar rascunhos</button>
      <button class="tr-btn tr-btn-rev" style="padding:5px 11px" onclick="ativarRevisadosCategoria()">✓ Ativar revisados</button>
    </div>

    ${TR_ULTIMO_ERRO_AUTO && TR_ULTIMO_ERRO_AUTO.catId===cat.id ? `
    <div class="tr-diag erro" style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
      <div>
        <strong>⚠️ ${TR_ULTIMO_ERRO_AUTO.erros.length} entrada${TR_ULTIMO_ERRO_AUTO.erros.length>1?'s':''} não foram traduzidas:</strong>
        <ul style="margin:6px 0 0 18px;padding:0">
          ${TR_ULTIMO_ERRO_AUTO.erros.slice(0,8).map(e=>
            `<li style="margin-bottom:2px"><code style="font-size:0.68rem">${esc(e.chave)}</code> — ${esc(e.erro)}</li>`
          ).join('')}
          ${TR_ULTIMO_ERRO_AUTO.erros.length>8?`<li style="color:var(--muted)">e mais ${TR_ULTIMO_ERRO_AUTO.erros.length-8}…</li>`:''}
        </ul>
        <div style="font-size:0.7rem;margin-top:6px;color:var(--muted)">
          Use o filtro <strong>Sem tradução</strong> abaixo pra achá-las e tentar de novo.
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" style="flex-shrink:0" onclick="TR_ULTIMO_ERRO_AUTO=null;renderListaCategoria()">✕</button>
    </div>` : ''}

    <!-- Progresso -->
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:0.68rem;color:var(--muted)">Progresso</span>
        <span style="font-size:0.68rem;color:${cat.cor};font-weight:700">${pct}% — ${ativos}/${total} ativos</span>
      </div>
      <div class="tr-progress-bar" style="height:7px">
        <div class="tr-progress-fill" style="width:${pct}%;background:${cat.cor}"></div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="tr-filtros">
      ${filtros.map(f=>`<button class="tr-filtro ${TR_FILTRO===f?'on':''}"
        onclick="TR_FILTRO='${f}';renderListaCategoria()">${fLabels[f]}</button>`).join('')}
    </div>

    <!-- Cards -->
    <div class="tr-cards">
      ${filtrados.length===0?`
        <div style="text-align:center;padding:40px 20px;color:var(--muted)">
          <p style="font-size:1.4rem;margin-bottom:8px">📭</p>
          <p>Nenhuma entrada para este filtro.</p>
          ${semTrad>0&&TR_FILTRO!=='sem'
            ?`<p style="font-size:0.72rem;margin-top:6px">Tente o filtro <strong>Sem tradução</strong>.</p>`:''}
        </div>`
      :filtrados.map(doc=>{
        const exp=TR_EXPAND===doc.chave;
        return `<div class="tr-card" id="${cardId(doc.chave)}">
          <div class="tr-card-head" onclick="toggleExpandTr(fromStrArg('${strArg(doc.chave)}'))">
            <div class="tr-col">
              <div class="lbl">🇧🇷 Português</div>
              <div class="val">${esc(doc.textoPT)}</div>
            </div>
            <div class="tr-col">
              <div class="lbl">🇺🇸 ${TR_LOCALE}</div>
              <div class="val ${doc.traducao?'en':'vazio'}">${doc.traducao?esc(doc.traducao):'Sem tradução'}</div>
            </div>
            <div style="flex-shrink:0;margin:0 4px">${badgeTr(doc)}</div>
            <span class="tr-chevron ${exp?'open':''}">›</span>
          </div>
          ${exp?`<div class="tr-card-body">
            <span class="tr-chave-tag">🔑 ${esc(doc.chave)}</span>
            <div class="tr-field">
              <label>🇧🇷 Original</label>
              <input type="text" value="${esc(doc.textoPT)}" readonly />
            </div>
            <div class="tr-field">
              <label>🇺🇸 Tradução</label>
              <input type="text" id="${inpId(doc.chave)}"
                value="${esc(doc.traducao||'')}" placeholder="Digite aqui e clique Salvar…"
                onkeydown="if(event.key==='Enter'){salvarTrItem(fromStrArg('${strArg(doc.chave)}'))}"/>
            </div>
            <div class="tr-acoes">
              <button class="tr-btn tr-btn-auto" onclick="autoTraduzirItem(fromStrArg('${strArg(doc.chave)}'))">⚡ Auto</button>
              <button class="tr-btn tr-btn-save" onclick="salvarTrItem(fromStrArg('${strArg(doc.chave)}'))">💾 Salvar</button>
              <button class="tr-btn tr-btn-rev"  onclick="mudarStatusTrItem(fromStrArg('${strArg(doc.chave)}'),'revisado')">✓ Revisar</button>
              <button class="tr-btn tr-btn-ativ ${doc.status==='ativo'?'on':''}"
                onclick="mudarStatusTrItem(fromStrArg('${strArg(doc.chave)}'),'ativo')">
                ${doc.status==='ativo'?'✓ Ativo':'Ativar'}
              </button>
              <span id="${bdgId(doc.chave)}" style="margin-left:auto">${badgeTr(doc)}</span>
            </div>
          </div>`:''}
        </div>`;
      }).join('')}
    </div>`;
}

function toggleExpandTr(chave){
  TR_EXPAND=TR_EXPAND===chave?null:chave;
  renderListaCategoria();
  if(TR_EXPAND){
    const id='tr-card-'+chave.replace(/[^a-z0-9]/gi,'-');
    setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'nearest'}),60);
  }
}

// ── Salvar item ───────────────────────────────────────────────────────────────
async function salvarTrItem(chave){
  const inp=document.getElementById('tr-inp-'+chave.replace(/[^a-z0-9]/gi,'-'));
  if(!inp) return;
  const traducao=inp.value.trim();
  if(!traducao){toast('Digite a tradução antes de salvar','aviso');inp.focus();return;}
  const doc=TR_DADOS.find(d=>d.chave===chave);
  if(!doc) return;
  try{
    let resultado;
    if(doc._id){
      const r=await fetch(`${API}/traducoes/${doc._id}`,{
        method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({traducao,status:'revisado'}),
      });
      resultado=await r.json();
    } else {
      // Cria via seed depois atualiza
      await fetch(`${API}/traducoes/seed`,{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({chaves:[{chave,textoPT:doc.textoPT}],locale:TR_LOCALE}),
      });
      const todos=await fetch(`${API}/traducoes/admin?locale=${TR_LOCALE}`,
        {headers:{Authorization:`Bearer ${TOKEN}`}}).then(r=>r.json());
      const novo=todos.find(d=>d.chave===chave);
      if(novo){
        const r=await fetch(`${API}/traducoes/${novo._id}`,{
          method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
          body:JSON.stringify({traducao,status:'revisado'}),
        });
        resultado=await r.json();
      }
    }
    if(resultado){
      const idx=TR_DADOS.findIndex(d=>d.chave===chave);
      if(idx!==-1) TR_DADOS[idx]={...TR_DADOS[idx],...resultado};
      const bdg=document.getElementById('tr-bdg-'+chave.replace(/[^a-z0-9]/gi,'-'));
      if(bdg) bdg.innerHTML=badgeTr(resultado);
      toast('✓ Salvo e marcado como revisado','ok');
    }
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// ── Mudar status ──────────────────────────────────────────────────────────────
async function mudarStatusTrItem(chave,status){
  const doc=TR_DADOS.find(d=>d.chave===chave);
  if(!doc?._id){toast('Salve primeiro antes de mudar o status','aviso');return;}
  try{
    const r=await fetch(`${API}/traducoes/${doc._id}`,{
      method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({status}),
    });
    const resultado=await r.json();
    const idx=TR_DADOS.findIndex(d=>d.chave===chave);
    if(idx!==-1) TR_DADOS[idx]={...TR_DADOS[idx],...resultado};
    const bdg=document.getElementById('tr-bdg-'+chave.replace(/[^a-z0-9]/gi,'-'));
    if(bdg) bdg.innerHTML=badgeTr(resultado);
    toast(status==='ativo'?'✓ Ativado no app!':'✓ Marcado como revisado','ok');
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// ── Auto-traduzir item ────────────────────────────────────────────────────────
async function autoTraduzirItem(chave){
  const doc=TR_DADOS.find(d=>d.chave===chave);
  if(!doc) return;
  if(!doc._id){
    await fetch(`${API}/traducoes/seed`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({chaves:[{chave,textoPT:doc.textoPT}],locale:TR_LOCALE}),
    });
  }
  try{
    const r=await fetch(`${API}/traducoes/auto`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({chave,locale:TR_LOCALE}),
    });
    const res=await r.json();
    if(res.erros?.length){toast('⚠ Falhou: '+res.erros[0].erro,'erro');}
    else{await abrirCategoria(TR_CAT.id);toast('⚡ Rascunho gerado — revise e salve','ok');}
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// ── Sync, auto-traduzir toda a categoria, ativar revisados ────────────────────
async function syncCategoria(){
  if(!TR_CAT) return;
  setLoading('Sincronizando…');
  try{
    const chaves=TR_DADOS.map(d=>({chave:d.chave,textoPT:d.textoPT}));
    if(!chaves.length){ toast('Nenhuma chave para sincronizar.','aviso'); await abrirCategoria(TR_CAT.id); return; }
    const r=await fetch(`${API}/traducoes/seed`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({chaves,locale:TR_LOCALE}),
    });
    const res=await r.json();
    await abrirCategoria(TR_CAT.id);
    if(!r.ok){ toast('Erro: '+(res.erro||r.status),'erro'); return; }
    toast(`↻ ${res.inseridos} novas, ${res.existentes} já existentes`,'ok');
  }catch(e){toast('Erro: '+e.message,'erro');}
}

// Abre o modal de confirmação reutilizável com mensagem/botão customizados
function confirmarCustom(mensagemHtml, textoBotao, onConfirm, btnClass='btn btn-navy'){
  document.getElementById('confirm-msg').innerHTML=mensagemHtml;
  const btn=document.getElementById('confirm-ok');
  btn.textContent=textoBotao;
  btn.className=btnClass;
  btn.onclick=()=>{ fecharModal('confirm-modal'); onConfirm(); };
  abrirModal('confirm-modal');
}

function autoTraduzirCategoria(){
  if(!TR_CAT) return;
  const semTraducao=TR_DADOS.filter(d=>!d.traducao);
  if(!semTraducao.length){toast('Todas as entradas já têm tradução!','ok');return;}

  confirmarCustom(`
    Auto-traduzir <strong>${semTraducao.length}</strong> entrada${semTraducao.length>1?'s':''}
    em "<strong>${esc(TR_CAT.label)}</strong>" usando a MyMemory?
    <br><span style="font-size:0.7rem;color:var(--muted);display:block;margin-top:6px">
      Pode levar alguns segundos. As traduções entram como <strong>rascunho</strong>
      e precisam de revisão antes de aparecerem no app.
    </span>`,
    '⚡ Traduzir',
    ()=>executarAutoTraducao(semTraducao),
  );
}

// Renderiza a tela de progresso da tradução em lote (substitui o spinner genérico)
function renderProgressoAutoTraducao(feitos, total, erros){
  const pct=total?Math.round((feitos/total)*100):0;
  document.getElementById('content').innerHTML = TR_CSS + `
    <div style="max-width:420px;margin:50px auto 0;text-align:center">
      <p style="font-size:2.2rem;margin-bottom:8px;line-height:1">⚡</p>
      <p style="font-family:'Cinzel',serif;font-weight:700;font-size:1rem;color:var(--text);margin-bottom:5px">
        Traduzindo "${esc(TR_CAT.label)}"…
      </p>
      <p style="font-size:0.78rem;color:var(--muted);margin-bottom:16px">
        ${feitos}/${total} entradas processadas
        ${erros.length?` · <span style="color:#A83C2C;font-weight:700">${erros.length} erro${erros.length>1?'s':''}</span>`:''}
      </p>
      <div class="tr-progress-bar" style="height:10px">
        <div class="tr-progress-fill" style="width:${pct}%;background:${TR_CAT.cor};transition:width 0.25s"></div>
      </div>
      <p style="font-size:1.05rem;font-weight:800;color:${TR_CAT.cor};margin-top:10px">${pct}%</p>
    </div>`;
}

// Executa a tradução chave-por-chave, atualizando a barra de progresso a cada uma
async function executarAutoTraducao(itens){
  const total=itens.length;
  let feitos=0, erros=[];
  renderProgressoAutoTraducao(feitos, total, erros);

  // Garante que todas as chaves já existem no banco antes de traduzir
  try{
    const chaves=TR_DADOS.map(d=>({chave:d.chave,textoPT:d.textoPT}));
    await fetch(`${API}/traducoes/seed`,{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({chaves,locale:TR_LOCALE}),
    });
  }catch(e){
    toast('Erro ao preparar tradução: '+e.message,'erro');
    await abrirCategoria(TR_CAT.id);
    return;
  }

  for(const item of itens){
    try{
      const r=await fetch(`${API}/traducoes/auto`,{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
        body:JSON.stringify({chave:item.chave,locale:TR_LOCALE}),
      });
      const d=await r.json();
      if(!r.ok) throw new Error(d.erro||`HTTP ${r.status}`);
      if(d.erros?.length) erros.push({chave:item.chave, erro:d.erros[0].erro});
    }catch(e){
      erros.push({chave:item.chave, erro:e.message});
    }
    feitos++;
    renderProgressoAutoTraducao(feitos, total, erros);
  }

  TR_ULTIMO_ERRO_AUTO = erros.length ? {catId:TR_CAT.id, erros} : null;
  await abrirCategoria(TR_CAT.id);

  const ok=feitos-erros.length;
  if(erros.length){
    toast(`⚡ ${ok}/${total} traduzidas — ${erros.length} com erro (veja detalhes na lista)`,'aviso');
  } else {
    toast(`⚡ ${ok} entrada${ok>1?'s':''} traduzida${ok>1?'s':''} com sucesso!`,'ok');
  }
}

async function ativarStatusCategoria(itens, mensagemSucesso){
  try{
    await Promise.all(itens.map(d=>fetch(`${API}/traducoes/${d._id}`,{
      method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},
      body:JSON.stringify({status:'ativo'}),
    })));
    await abrirCategoria(TR_CAT.id);
    toast(mensagemSucesso,'ok');
  }catch(e){toast('Erro: '+e.message,'erro');}
}

function ativarRascunhosCategoria(){
  const rascunhos=TR_DADOS.filter(d=>d.status==='rascunho'&&d.traducao&&d._id);
  if(!rascunhos.length){toast('Nenhum rascunho pra ativar','aviso');return;}
  const n=rascunhos.length;
  confirmarCustom(`
    Ativar <strong>${n}</strong> ${n>1?'traduções':'tradução'}
    em rascunho em "<strong>${esc(TR_CAT.label)}</strong>"?
    <br><span style="font-size:0.7rem;color:var(--muted);display:block;margin-top:6px">
      Ela${n>1?'s':''} passa${n>1?'m':''} a aparecer no app sem revisão manual prévia.
    </span>`,
    '✓ Ativar rascunhos',
    ()=>ativarStatusCategoria(rascunhos, `✓ ${n} rascunho${n>1?'s':''} ativado${n>1?'s':''}!`),
    'btn btn-navy',
  );
}

function ativarRevisadosCategoria(){
  const revisados=TR_DADOS.filter(d=>d.status==='revisado'&&d._id);
  if(!revisados.length){toast('Nenhuma entrada revisada para ativar','aviso');return;}
  const n=revisados.length;
  confirmarCustom(`
    Ativar <strong>${n}</strong> ${n>1?'traduções revisadas':'tradução revisada'}
    em "<strong>${esc(TR_CAT.label)}</strong>"?`,
    '✓ Ativar revisados',
    ()=>ativarStatusCategoria(revisados, `✓ ${n} ${n>1?'traduções revisadas ativadas':'tradução revisada ativada'}!`),
    'btn btn-navy',
  );
}

// ── Diagnóstico API ───────────────────────────────────────────────────────────
async function testarAPITr(){
  const box=document.getElementById('tr-diag-box');
  if(!box) return;
  box.innerHTML=`<div class="tr-diag aviso">🔄 Testando MyMemory…</div>`;
  try{
    const params=new URLSearchParams({q:'Olá',langpair:'pt|en'});
    const r=await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`,
      {signal:AbortSignal.timeout(6000)});
    if(r.ok){
      const d=await r.json();
      const traduzido=d.responseData?.translatedText;
      if(traduzido && !/MYMEMORY WARNING/i.test(traduzido)){
        box.innerHTML=`<div class="tr-diag ok">
          ✅ <strong>MyMemory</strong> funcionando — "Olá" → "<strong>${traduzido}</strong>"<br>
          <small>Sem necessidade de configuração. Limite gratuito: ~5.000 palavras/dia por IP
          (configure <code>MYMEMORY_EMAIL</code> no Render para subir esse limite pra 50.000/dia).</small>
        </div>`;
        return;
      }
      box.innerHTML=`<div class="tr-diag erro">
        ❌ MyMemory respondeu, mas a cota diária gratuita parece ter sido excedida.<br>
        <small>Configure <code>MYMEMORY_EMAIL</code> no Render pra aumentar o limite, ou tente de novo mais tarde.</small>
      </div>`;
      return;
    }
    box.innerHTML=`<div class="tr-diag erro">❌ MyMemory retornou ${r.status}. Tente de novo mais tarde.</div>`;
  }catch(e){
    box.innerHTML=`<div class="tr-diag erro">❌ Não foi possível contatar a MyMemory: ${esc(e.message)}</div>`;
  }
}
