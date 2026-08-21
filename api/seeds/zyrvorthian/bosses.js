const item = (itemSlug, nome, imagem, quantidade = null) => ({ itemSlug, nome, imagem, quantidade });
const ingrediente = (itemSlug, nome, imagem, quantidade) => ({ itemSlug, nome, imagem, quantidade });
const receita = (id, resultadoItemSlug, resultadoNome, resultadoQuantidade, ingredientes, tempoHoras = null) => ({
  id, resultadoItemSlug, resultadoNome, resultadoQuantidade, ingredientes, tempoHoras,
});

const ASTraxShard = '/assets/items/zyrvorthian/estilhaco-poeira-estelar-astrax.webp';
const ASTraxEye = '/assets/items/zyrvorthian/astrax-olho-do-vazio.webp';
const AetherionFeather = '/assets/items/zyrvorthian/pena-aetherion.webp';
const AetherionClaw = '/assets/items/zyrvorthian/garra-trovao-aetherion.webp';

export const ZYRVORTHIAN_SEED = [
  {
    slug:'zyrvorthian-astrax', categoria:'zyrvorthian', subtipo:'chefe', nivel:null, ordem:1, ativo:true,
    nome:'Astrax',
    tags:['zyrvorthian','provações-da-calamidade','astrax','chefe'],
    zyrvorthian:{
      chefeId:'astrax', dadosStatus:'confirmado',
      descricao:'Um convidado indesejado vindo de além das estrelas, capaz de arrastar todos aqueles que o desafiam para o vazio infinito.',
      habilidades:[
        { id:'viajante-do-vazio', nome:'Viajante do Vazio', imagem:'/assets/campaign/zyrvorthian/viajante-do-vazio.webp', descricao:'Cada vez que Astrax é atacado, há 30% de chance de ficar imune àquele ataque.' },
        { id:'atacantes-vitais', nome:'Atacantes Vitais', imagem:'/assets/campaign/zyrvorthian/atacantes-vitais.webp', descricao:'Arqueiro, Serpente Vingativa e Hoplita causam 30% a mais de dano final contra Astrax.', bonusDanoFinalPercentual:30, tropas:['Arqueiro','Serpente Vingativa','Hoplita'] },
      ],
      materiais:[
        item('estilhaco-poeira-estelar-astrax','Estilhaço de Poeira Estelar de Astrax',ASTraxShard),
        item('astrax-olho-do-vazio','Astrax, o Olho do Vazio',ASTraxEye),
      ],
      golpeFinal:[
        item('estilhaco-poeira-estelar-astrax','Estilhaço de Poeira Estelar de Astrax',ASTraxShard,50),
        item('astrax-olho-do-vazio','Astrax, o Olho do Vazio',ASTraxEye,1),
      ],
      ranking:[
        { posicaoMin:1, posicaoMax:1, itemSlug:'estilhaco-poeira-estelar-astrax', itemNome:'Estilhaço de Poeira Estelar de Astrax', imagem:ASTraxShard, quantidade:50 },
        { posicaoMin:2, posicaoMax:3, itemSlug:'estilhaco-poeira-estelar-astrax', itemNome:'Estilhaço de Poeira Estelar de Astrax', imagem:ASTraxShard, quantidade:40 },
        { posicaoMin:4, posicaoMax:10, itemSlug:'estilhaco-poeira-estelar-astrax', itemNome:'Estilhaço de Poeira Estelar de Astrax', imagem:ASTraxShard, quantidade:30 },
        { posicaoMin:11, posicaoMax:30, itemSlug:'estilhaco-poeira-estelar-astrax', itemNome:'Estilhaço de Poeira Estelar de Astrax', imagem:ASTraxShard, quantidade:20 },
      ],
      receitas:[
        receita('astrax-tratado','tratado-cessar-fogo','Tratado de Cessar-fogo',1,[
          ingrediente('estilhaco-poeira-estelar-astrax','Estilhaço de Poeira Estelar de Astrax',ASTraxShard,25),
          ingrediente('astrax-olho-do-vazio','Astrax, o Olho do Vazio',ASTraxEye,1),
        ]),
        receita('astrax-devastar','pergaminho-devastar','Ticket de Campanha de Devastar',25,[
          ingrediente('estilhaco-poeira-estelar-astrax','Estilhaço de Poeira Estelar de Astrax',ASTraxShard,100),
          ingrediente('astrax-olho-do-vazio','Astrax, o Olho do Vazio',ASTraxEye,1),
        ],6),
      ],
      observacoes:['A faixa abaixo do 30º lugar não foi cadastrada porque o valor não estava visível no material enviado.'],
    },
    fonte:{ tipo:'screenshot', data:'2026-08-21', descricao:'Telas do Astrax, habilidades, ranking e Loja de Surpresas.', verificado:true },
    i18n:{ 'en-US':{ nome:'Astrax' } },
  },
  {
    slug:'zyrvorthian-aetherion', categoria:'zyrvorthian', subtipo:'chefe', nivel:null, ordem:2, ativo:true,
    nome:'Aetherion',
    tags:['zyrvorthian','provações-da-calamidade','aetherion','chefe'],
    zyrvorthian:{
      chefeId:'aetherion', dadosStatus:'parcial', descricao:'', habilidades:[],
      materiais:[
        item('pena-aetherion','Pena de Aetherion',AetherionFeather),
        item('garra-trovao-aetherion','Garra de Trovão de Aetherion',AetherionClaw),
      ],
      golpeFinal:[], ranking:[],
      receitas:[
        receita('aetherion-tratado','tratado-cessar-fogo','Tratado de Cessar-fogo',1,[
          ingrediente('pena-aetherion','Pena de Aetherion',AetherionFeather,20),
          ingrediente('garra-trovao-aetherion','Garra de Trovão de Aetherion',AetherionClaw,1),
        ]),
        receita('aetherion-devastar','pergaminho-devastar','Ticket de Campanha de Devastar',25,[
          ingrediente('pena-aetherion','Pena de Aetherion',AetherionFeather,100),
          ingrediente('garra-trovao-aetherion','Garra de Trovão de Aetherion',AetherionClaw,1),
        ],6),
      ],
      observacoes:['Habilidades, golpe final e ranking de Aetherion ainda não foram confirmados por screenshots.'],
    },
    fonte:{ tipo:'screenshot', data:'2026-08-21', descricao:'Loja de Surpresas de Aetherion; materiais e duas receitas confirmadas.', verificado:true },
    i18n:{ 'en-US':{ nome:'Aetherion' } },
  },
];
