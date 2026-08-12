import { C } from '../../theme.js';

export const ILHAS_NOMES = ['PRINC', 'FOGO', 'ÁGUA', 'BELLA', 'TERRA'];
export const EXPANSIVEIS = ['FOGO', 'BELLA', 'TERRA'];

export const ILHA_META = {
  PRINC: { icon: '🏰', label: 'Principal', color: C.ACCENT, lightBg: '#FDF5E6' },
  FOGO: { icon: '🔥', label: 'Fogo', color: C.ATTACK, lightBg: '#FFF3E0' },
  ÁGUA: { icon: '💧', label: 'Água', color: C.DEFENSE, lightBg: '#EFF6FF' },
  BELLA: { icon: '🌸', label: 'Bella', color: C.HEALTH, lightBg: '#FFF0F0' },
  TERRA: { icon: '🌿', label: 'Terra', color: C.ENERGY, lightBg: '#F0FAF0' },
};

export const TIPO_COR = {
  fazendas: { accent: '#2E7D32', bg: '#F1F8E9', label: '🌾' },
  minas: { accent: '#6A1B9A', bg: '#F3E5F5', label: '⛏️' },
  pedreiras: { accent: '#5D4037', bg: '#EFEBE9', label: '🪨' },
  serrarias: { accent: '#E65100', bg: '#FFF3E0', label: '🪵' },
  perolas: { accent: '#1565C0', bg: '#E3F2FD', label: '🔮' },
};

export const ROWS_DEFAULT = [
  { id: 'r1', type: 'casas', name: 'Casas', values: ['', '', '', '', ''] },
  { id: 'r2', type: 'fontes', name: 'Fontes', values: ['', '', '', '', ''] },
  { id: 'r3', type: 'guarnicoes', name: 'Guarnições', values: ['', '', '', '', ''] },
  { id: 'r4', type: 'fazendas', name: 'Fazendas', values: ['', '', '', '', ''] },
  { id: 'r5', type: 'minas', name: 'Minas', values: ['', '', '', '', ''] },
  { id: 'r6', type: 'pedreiras', name: 'Pedreiras', values: ['', '', '', '', ''] },
  { id: 'r7', type: 'serrarias', name: 'Serrarias', values: ['', '', '', '', ''] },
  { id: 'r8', type: 'perolas', name: 'F. Pérolas', values: ['', '', '', '', ''] },
];

export const FIXOS = ['Viveiro', 'Forja', 'Fábrica', 'Cofre', 'Sentinela'];
export const TIPOS_RECURSO_TERRESTRE = ['fazendas', 'minas', 'pedreiras', 'serrarias'];
export const TIPOS_CIDADE = ['casas', 'fontes', 'guarnicoes'];

export const NIVEIS_DEFAULT = {
  fortaleza: 1, casas: 1, fontes: 1, fazendas: 1,
  minas: 1, pedreiras: 1, serrarias: 1, perolas: 1,
};
export const TERRITORIOS_DEFAULT = { fazendas: 0, minas: 0, pedreiras: 0, serrarias: 0 };
export const EXPANSOES_DEFAULT = { FOGO: false, BELLA: false, TERRA: false };

export const LIMITES = { cidadePrincipal: 25, sitioAgua: 8, cidadeAgua: 4 };
