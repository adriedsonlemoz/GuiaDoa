import { C } from '../../theme.js';

// ─── Ícone por nome da tropa ──────────────────────────────────────────────
export const getIcone = (nome) => {
  const n = nome.toLowerCase();
  if (n.includes('magma') || n.includes('lava') || n.includes('infernal')) return '🌋';
  if (n.includes('espectral') || n.includes('fantasma') || n.includes('alma')) return '👻';
  if (n.includes('condenador') || n.includes('demônio') || n.includes('abismo')) return '👹';
  if (n.includes('leviatã') || n.includes('kraken') || n.includes('marinho')) return '🦑';
  if (n.includes('quimera') || n.includes('manticora')) return '🦁';
  if (n.includes('serpente') || n.includes('cobra') || n.includes('víbora') || n.includes('arsên')) return '🐍';
  if (n.includes('dragão') || n.includes('dragonete') || n.includes('dragões') || n.includes('wyrm')) return '🐲';
  if (n.includes('golem') || n.includes('pedra')) return '🪨';
  if (n.includes('ogro') || n.includes('troll') || n.includes('granito')) return '🧌';
  if (n.includes('gigante') || n.includes('titã')) return '🗿';
  if (n.includes('águia') || n.includes('grifo') || n.includes('falcão')) return '🦅';
  if (n.includes('minotauro') || n.includes('touro')) return '🐂';
  if (n.includes('centauro')) return '🐎';
  if (n.includes('aranha') || n.includes('teia')) return '🕷️';
  if (n.includes('lobo') || n.includes('fera')) return '🐺';
  if (n.includes('sapo') || n.includes('tóxico')) return '🐸';
  if (n.includes('escaravelho')) return '🦂';
  if (n.includes('mago') || n.includes('feiticeiro') || n.includes('bruxo') || n.includes('xamã')) return '🧙‍♂️';
  if (n.includes('arqueiro') || n.includes('caçador') || n.includes('atirador')) return '🏹';
  if (n.includes('espião') || n.includes('assassino') || n.includes('sombra') || n.includes('perseguidor')) return '🥷';
  if (n.includes('cavaleiro') || n.includes('montado') || n.includes('biga') || n.includes('jinete')) return '🏇';
  if (n.includes('guardião') || n.includes('defensor') || n.includes('paladino')) return '🛡️';
  if (n.includes('fada')) return '🧚';
  if (n.includes('lorde') || n.includes('lord')) return '👑';
  if (n.includes('medusa')) return '🐍';
  if (n.includes('esmagador') || n.includes('colossal')) return '💥';
  if (n.includes('hoplita')) return '⚔️';
  if (n.includes('carregador') || n.includes('transporte') || n.includes('escevóforo')) return '📦';
  if (n.includes('espelho')) return '🔆';
  if (n.includes('canhão')) return '💣';
  if (n.includes('guerreiro') || n.includes('soldado') || n.includes('bárbaro') || n.includes('miliciano')) return '⚔️';
  if (n.includes('gatuno') || n.includes('alado')) return '🦅';
  if (n.includes('andarilho') || n.includes('areia')) return '🏜️';
  if (n.includes('amarande')) return '✨';
  return '🗡️';
};

// ─── Tipo de ataque ───────────────────────────────────────────────────────
export const getTipoAtaque = (t) => {
  if (t.atqPerto > 0 && t.atqDist > 0) return { label: 'Híbrido',      color: '#B8965A' };
  if (t.atqDist  > t.atqPerto)          return { label: 'Dist.',        color: '#0369a1' };
  if (t.atqPerto > 0)                   return { label: 'C. a Corpo',   color: '#b91c1c' };
  return                                        { label: 'Suporte',     color: '#6a5018' };
};

// ─── Formatação numérica ──────────────────────────────────────────────────
export const fmt = (v) => {
  if (v === null || v === undefined || v === 0) return '—';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',') + 'M';
  if (v >= 1_000)     return (v / 1_000).toFixed(1).replace('.0', '').replace('.', ',') + 'K';
  return String(v);
};

export const fmtFull = (v) =>
  (v === null || v === undefined || v === 0) ? '—' : v.toLocaleString('pt-BR');

// ─── Todos os atributos com maxes calibrados nos dados reais ──────────────
export const ATRIBUTOS = [
  { id: 'vida',     label: 'VIDA',      icon: '❤️',  color: '#e05030', max: 32_000 },
  { id: 'def',      label: 'DEFESA',    icon: '🛡️',  color: '#1e6b8a', max: 5_000  },
  { id: 'atqPerto', label: 'ATQ PERTO', icon: '⚔️',  color: '#b91c1c', max: 6_000  },
  { id: 'atqDist',  label: 'ATQ DIST',  icon: '🏹',  color: '#B8965A', max: 6_000  },
  { id: 'alcance',  label: 'ALCANCE',   icon: '🎯',  color: '#0f766e', max: 3_500  },
  { id: 'vel',      label: 'VELOCIDADE',icon: '⚡',  color: '#0369a1', max: 3_000  },
  { id: 'car',      label: 'CARGA',     icon: '📦',  color: '#b08a30', max: 5_000  },
  { id: 'gestao',   label: 'GESTÃO',    icon: '👥',  color: '#6a5018', max: 200    },
  { id: 'poder',    label: 'PODER',     icon: '⭐',  color: '#7c3aed', max: 50     },
  { id: 'efi',      label: 'EFICIÊNCIA',icon: '🚀',  color: '#0d7c5e', max: 15_000 },
];

// ─── Atributos que ficam no resumo inline do card (linha de preview) ──────
// Mostra os 3 mais relevantes dependendo do tipo de tropa
export const getAtributosResumo = (t) => [
  { icon: '❤️', val: fmt(t.vida)     },
  { icon: '🛡️', val: fmt(t.def)      },
  { icon: t.atqDist > t.atqPerto ? '🏹' : '⚔️', val: fmt(Math.max(t.atqPerto, t.atqDist)) },
  { icon: '⚡', val: fmt(t.vel)      },
];

// ─── Filtros ──────────────────────────────────────────────────────────────
export const FILTROS = [
  { id: 'Todas',         label: 'Todas'      },
  { id: 'Corpo a Corpo', label: 'C. a Corpo' },
  { id: 'Longo Alcance', label: 'Dist.'      },
  { id: 'Maior Vida',    label: '+ Vida'     },
  { id: 'Maior Defesa',  label: '+ Defesa'   },
  { id: 'Alta Carga',    label: '+ Carga'    },
  { id: 'Mais Rápidas',  label: '+ Rápidas'  },
];
