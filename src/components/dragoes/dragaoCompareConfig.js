export const ATTRS_BASE = [
  { key: 'vida', label: 'Vida', icon: '❤️' },
  { key: 'defesa', label: 'Defesa', icon: '🛡️' },
  { key: 'ataquePerto', label: 'Atq. Perto', icon: '⚔️' },
  { key: 'ataqueDistante', label: 'Atq. Distante', icon: '🏹' },
  { key: 'alcance', label: 'Alcance', icon: '🎯' },
  { key: 'velocidade', label: 'Velocidade', icon: '⚡' },
];

export const ATTRS_ELEM = [
  { key: 'ataqueElemental', label: 'Atq. Elem.', icon: '🔥' },
  { key: 'impulsoElemental', label: 'Impulso Elem.', icon: '💥' },
  { key: 'barreiraElemental', label: 'Barreira Elem.', icon: '🔰' },
  { key: 'bombardeioElemental', label: 'Bombardeio', icon: '💣' },
  { key: 'confrontoElemental', label: 'Confronto', icon: '⚡' },
  { key: 'bloqueioElemental', label: 'Bloqueio', icon: '🛡' },
  { key: 'rupturaElemental', label: 'Ruptura', icon: '💢' },
];

export const fmtDragaoValor = value => (value == null || value === 0 ? '0' : Number(value).toLocaleString('pt-BR'));
