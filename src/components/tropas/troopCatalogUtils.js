export function combatClass(troop) {
  if (troop?.combate === 'distancia') return 'ranged';
  if (troop?.combate === 'corpo_a_corpo') return 'melee';
  const ranged = Number(troop?.atqDist) || 0;
  const melee = Number(troop?.atqPerto) || 0;
  return ranged > melee ? 'ranged' : 'melee';
}

export function matchesTroopFilter(troop, filter) {
  if (filter === 'ranged') return combatClass(troop) === 'ranged';
  if (filter === 'melee') return combatClass(troop) === 'melee';
  if (filter === 'special') return troop?.tipo === 'especial';
  return true;
}
