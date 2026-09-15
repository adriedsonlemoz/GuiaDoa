// Catálogo inicial recuperado das referências visuais do jogo.
// Mantido no backend para que o MongoDB continue sendo a fonte única dos dados oficiais.
export const ITENS_SEED = [
  {
    nome: '13th Anniversary Chest I', icone: '🧰', categoria: 'Arcas', raridade: 'Épico', ordem: 10,
    descricao: 'Baú comemorativo que contém itens ligados aos eventos de aniversário.',
    origem: 'Loja de Itens e eventos de aniversário', uso: 'Abrir para receber itens do evento.',
    limites: 'Disponibilidade sazonal durante eventos.', onde: 'Loja de Itens',
    i18n: { 'en-US': {
      categoria: 'Chests', raridade: 'Epic', descricao: 'Anniversary chest containing items tied to anniversary events.',
      origem: 'Item Shop and anniversary events', uso: 'Open it to receive event items.',
      limites: 'Seasonal availability during events.', onde: 'Item Shop',
    } },
  },
  {
    nome: '13th Anniversary Chest I (Premium)', icone: '👑', categoria: 'Arcas', raridade: 'Lendário', ordem: 20,
    descricao: 'Versão premium do baú comemorativo de aniversário.',
    origem: 'Loja premium e eventos especiais', uso: 'Abrir para receber recompensas premium do evento.',
    limites: 'Oferta limitada por evento.', onde: 'Loja premium',
    i18n: { 'en-US': {
      categoria: 'Chests', raridade: 'Legendary', descricao: 'Premium version of the anniversary event chest.',
      origem: 'Premium shop and special events', uso: 'Open it to receive premium event rewards.',
      limites: 'Limited event offer.', onde: 'Premium shop',
    } },
  },
  {
    nome: '10.000 Pergaminhos de Cura', icone: '📜', categoria: 'Cura', raridade: 'Raro', quantidade: 10000, ordem: 30,
    descricao: 'Pacote que concede 10.000 pergaminhos de cura.',
    origem: 'Loja, eventos e recompensas', uso: 'Usado na recuperação de tropas feridas.',
    limites: 'Consumível.', onde: 'Loja de Itens',
    i18n: { 'en-US': {
      nome: '10,000 Healing Scrolls', categoria: 'Healing', raridade: 'Rare', descricao: 'Pack that grants 10,000 healing scrolls.',
      origem: 'Shop, events and rewards', uso: 'Used to recover wounded troops.', limites: 'Consumable.', onde: 'Item Shop',
    } },
  },
  {
    nome: '10X Essence of Fury', icone: '🧪', categoria: 'Poder', raridade: 'Épico', quantidade: 10, ordem: 40,
    descricao: 'Pacote contendo dez unidades de Essence of Fury.',
    origem: 'Baús, loja e recompensas especiais', uso: 'Item utilizado em progressão e recompensas específicas.',
    limites: 'Pode variar conforme o evento.', onde: 'Baús e Loja de Itens',
    i18n: { 'en-US': {
      categoria: 'Power', raridade: 'Epic', descricao: 'Pack containing ten units of Essence of Fury.',
      origem: 'Chests, shop and special rewards', uso: 'Item used in specific progression and rewards.',
      limites: 'May vary by event.', onde: 'Chests and Item Shop',
    } },
  },
  {
    nome: 'Caixas de Nanos', icone: '📦', categoria: 'Nanos', raridade: 'Épico', ordem: 50,
    descricao: 'Caixa contendo nanos de uma semana de cada tipo.',
    origem: 'Loja, eventos e recompensas de ranking', uso: 'Abrir para obter nanos de longa duração.',
    limites: 'Consumível.', onde: 'Loja de Itens',
    i18n: { 'en-US': {
      nome: 'Nanos Crates', categoria: 'Nanos', raridade: 'Epic', descricao: 'Crate containing one-week nanos of each type.',
      origem: 'Shop, events and ranking rewards', uso: 'Open it to obtain long-duration nanos.', limites: 'Consumable.', onde: 'Item Shop',
    } },
  },
  {
    nome: 'Latas de Nanos', icone: '🫙', categoria: 'Nanos', raridade: 'Raro', ordem: 60,
    descricao: 'Lata contendo nanos de um dia de cada tipo.',
    origem: 'Loja, missões e recompensas', uso: 'Abrir para obter nanos de curta duração.',
    limites: 'Consumível.', onde: 'Loja de Itens',
    i18n: { 'en-US': {
      nome: 'Nanos Cans', categoria: 'Nanos', raridade: 'Rare', descricao: 'Can containing one-day nanos of each type.',
      origem: 'Shop, missions and rewards', uso: 'Open it to obtain short-duration nanos.', limites: 'Consumable.', onde: 'Item Shop',
    } },
  },
];
