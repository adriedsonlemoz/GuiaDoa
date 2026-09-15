// Itens de alimentação confirmados nas telas do jogo.
// Os valores são XP do dragão, não pontos de torneio.
export const DRAGON_FEEDING_ITEMS = Object.freeze([
  { id:'mutton', nome:'Carneiro', xp:100, imagem:'/assets/items/fields/savanna/pedaco-carne-carneiro.webp', campo:'savana', descricao:'Concede 100 XP ao alimentar um dragão.', i18n:{ 'en-US':{ nome:'Mutton', descricao:"This tender meat will increase your Dragons' exp by 100" } } },
  { id:'beef', nome:'Carne bovina', xp:200, imagem:'/assets/items/fields/savanna/pedaco-carne-bovina.webp', campo:'savana', descricao:'Concede 200 XP ao alimentar um dragão.', i18n:{ 'en-US':{ nome:'Beef', descricao:"This tasty meat will increase your Dragons' exp by 200" } } },
  { id:'chicken', nome:'Frango', xp:500, imagem:'/assets/items/fields/savanna/pedaco-frango.webp', campo:'savana', descricao:'Concede 500 XP ao alimentar um dragão.', i18n:{ 'en-US':{ nome:'Chicken', descricao:"This choice bird will increase your Dragons' exp by 500" } } },
  { id:'venison', nome:'Veado', xp:1000, imagem:'', campo:'', descricao:'Concede 1.000 XP ao alimentar um dragão.', i18n:{ 'en-US':{ nome:'Venison', descricao:"This rich, gamey meat will increase your Dragons' exp by 1000" } } },
]);
