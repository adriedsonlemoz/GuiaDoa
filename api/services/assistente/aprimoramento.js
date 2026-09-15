export const APRIMORAMENTO = {
  raridades: ['Incomum', 'Raro', 'Épico', 'Lendário', 'Mitológico'],
  custoBase: [5, 8, 12, 18, 30],
  multiplicadores: {
    fosseis: { Incomum: 1, Raro: 2, Épico: 4, Lendário: 8, Mitológico: 15 },
    pocoes: { Incomum: 0, Raro: 1, Épico: 2, Lendário: 4, Mitológico: 8 },
    reliquias: { Incomum: 0, Raro: 0, Épico: 1, Lendário: 2, Mitológico: 4 },
  },
  atributos: [
    { nome: 'Vida', tipo: 'ofensivo', desc: 'Aumenta a vida da tropa.' },
    { nome: 'Ataque Elemental', tipo: 'ofensivo', desc: 'Ataques causam dano elemental extra.' },
    { nome: 'Impulso Elemental', tipo: 'ofensivo', contra: 'Barreira Elemental', desc: 'Aumenta o dano elemental. Combatido pela Barreira Elemental.' },
    { nome: 'Barreira Elemental', tipo: 'defensivo', contra: 'Impulso Elemental', desc: 'Reduz dano elemental recebido. Combatido pelo Impulso Elemental.' },
    { nome: 'Bombardeio Elemental', tipo: 'ofensivo', contra: 'Confronto Elemental', desc: 'Dano crítico elemental de 250%. Combatido pelo Confronto Elemental.' },
    { nome: 'Confronto Elemental', tipo: 'defensivo', contra: 'Bombardeio Elemental', desc: 'Reduz chance de críticos elementais recebidos.' },
    { nome: 'Bloqueio Elemental', tipo: 'defensivo', contra: 'Ruptura Elemental', desc: 'Chance de bloquear 60% do dano elemental.' },
    { nome: 'Ruptura Elemental', tipo: 'ofensivo', contra: 'Bloqueio Elemental', desc: 'Reduz a chance de bloqueio do alvo.' },
  ],
  categorias: [
    { cat: 1, tropas: 'Minotauros, Arqueiros, Dragões de Ataque Rápido' },
    { cat: 2, tropas: 'Dragões de Combate' },
    { cat: 3, tropas: 'Andarilhos da Areia, Hoplitas' },
    { cat: 4, tropas: 'Gigantes, Abissais, Terrores do Pântano' },
    { cat: 5, tropas: 'Espelhos de Fogo, Bigas de Fogo, Serpente Vingativa, Canhão Elétrico, Amarande' },
    { cat: 6, tropas: 'Ogro de Granito, Serpente Arsênica, Dragonete da Tempestade, Magmassauros, Guerreiro do Magma' },
    { cat: 7, tropas: 'Titã Petrificado, Dragão do Veneno, Golem do Trovão, Gigante do Gelo, Leviatã Ártico, Cavaleiro Dragão, Centauros Infernais, Condenadores, Cavaleiros Espectrais' },
    { cat: 8, tropas: 'Perseguidor das Sombras, Escaravelho de Guerra, Arruinador Dimensional, Megalibgwilia, Medusa, Gatuno Alado' },
    { cat: 9, tropas: 'Esmagadores Colossais, Fantasma do Trovão, Lordes da Lava' },
  ],
};

export const calcCustoApr = (raridade, nivelDe, nivelAte) => {
  const mF = APRIMORAMENTO.multiplicadores.fosseis[raridade] || 0;
  const mP = APRIMORAMENTO.multiplicadores.pocoes[raridade] || 0;
  const mR = APRIMORAMENTO.multiplicadores.reliquias[raridade] || 0;
  let f = 0, p = 0, r = 0;
  for (let n = nivelDe; n <= nivelAte; n++) {
    const base = APRIMORAMENTO.custoBase[(n - 1) % 5];
    f += base * mF;
    p += base * mP;
    r += base * mR;
  }
  return { fosseis: f, pocoes: p, reliquias: r };
};
