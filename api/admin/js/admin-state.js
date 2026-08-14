const API = '/api';
const AdminCore = window.DOAAdminCore;
const esc = AdminCore.escapeHtml;
const dataArg = AdminCore.dataArg;
const fromDataArg = AdminCore.fromDataArg;
const strArg = AdminCore.strArg;
const fromStrArg = AdminCore.fromStrArg;
const safeColor = AdminCore.safeColor;
let TOKEN = AdminCore.getToken();
let PAGINA = 1, TOTAL_PAG = 1, ORDENAR = 'nome', DIR = '1', BUSCA = '', TIPO = '';
let EDITANDO_ID = null;
// niveis
let PAGINAN = 1, TOTAL_PAG_N = 1, EDITANDO_NIVEL_ID = null;
// itens
let EDITANDO_ITEM_ID = null, ICONE_SELECIONADO = '🎒';
// dragoes
let DRAGAO_ED_SLUG = null, DRAGAO_NIV_ATUAL = null;

// ── Módulos da home ──────────────────────────────────────────────────────────
const MODULOS = [
  { id:'tropas',    icon:'⚔️',  label:'Tropas',     desc:'Criar, editar e remover unidades', ativo:true,  badge:'novo'  },
  { id:'dragoes',   icon:'🐉',  label:'Dragões',    desc:'Atributos, habilidades e captura',   ativo:true,  badge:'novo'  },
  { id:'edificios', icon:'🏗️',  label:'Edifícios',  desc:'Níveis e efeitos por construção',  ativo:true,  badge:'novo'  },
  { id:'niveis',    icon:'🏰',  label:'Níveis',     desc:'Poder necessário por nível',           ativo:true,  badge:'novo'  },
  { id:'itens',     icon:'🎒',  label:'Itens',      desc:'Criar e gerenciar itens do jogo',  ativo:true,  badge:'novo'  },
  { id:'reinos',    icon:'🌍',  label:'Reinos',     desc:'Reinos, fusos e idiomas',          ativo:true,  badge:'novo'  },
  { id:'torneios',  icon:'🏆',  label:'Torneios',   desc:'Metas e configurações',            ativo:false, badge:'breve' },
  { id:'pesquisas', icon:'🔬',  label:'Pesquisas',  desc:'Centro de Ciência e pesquisas',    ativo:true,  badge:'novo'  },
  { id:'ilhas',     icon:'🏝️',  label:'Ilhas',      desc:'Produção e territórios',           ativo:false, badge:'breve' },
  { id:'dicas',     icon:'💡',  label:'Dicas',        desc:'Tutoriais e guias da comunidade',   ativo:true,  badge:'novo'  },
  { id:'alliances', icon:'🛡️',  label:'Aliança',      desc:'Tracker privado de membros e atividade', ativo:true, badge:'novo' },
];

// ── Auth ─────────────────────────────────────────────────────────────────────
