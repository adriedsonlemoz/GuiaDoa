import {
  ILHAS_NOMES, TIPOS_RECURSO_TERRESTRE, TIPOS_CIDADE,
  LIMITES,
} from './constants.js';

export const fmtN = n => Number(n || 0).toLocaleString('pt-BR');
export const asNumber = value => Number.parseInt(value, 10) || 0;

export function isAllowed(type, colIndex) {
  if (TIPOS_RECURSO_TERRESTRE.includes(type)) return colIndex === 0;
  if (type === 'perolas') return colIndex === 2;
  return true;
}

export function buildEdificiosMap(edificios = []) {
  return Object.fromEntries(
    edificios.map(ed => [ed.slug, Array.isArray(ed.niveis) ? ed.niveis : []]),
  );
}

export function findNivel(dbEdificios, slug, nivel) {
  const lista = dbEdificios?.[slug] || [];
  return lista.find(item => item.nivel === nivel) || lista[0] || {};
}

export function limiteSitioPrincipal(dbEdificios, nivelFortaleza) {
  let limite = 11;
  const lista = dbEdificios?.Fortaleza || [];
  for (let nivel = 1; nivel <= nivelFortaleza; nivel += 1) {
    const atual = lista.find(item => item.nivel === nivel);
    if (atual) limite += Number(atual.areas || 0);
  }
  return limite;
}

export function limiteIlhaSecundaria(colIndex, expansoes) {
  if (colIndex === 1) return expansoes.FOGO ? 12 : 6;
  if (colIndex === 3) return expansoes.BELLA ? 12 : 6;
  if (colIndex === 4) return expansoes.TERRA ? 12 : 6;
  return null;
}

export function calcularTotais(data) {
  const totais = { casas: 0, fontes: 0, guarnicoes: 0, fazendas: 0, minas: 0, pedreiras: 0, serrarias: 0, perolas: 0 };
  let cidPrinc = 5;
  let sitPrinc = 0;
  let cidAgua = 0;
  let sitAgua = 0;
  let totFogo = 0;
  let totBella = 0;
  let totTerra = 0;

  data.forEach(row => {
    const isRT = TIPOS_RECURSO_TERRESTRE.includes(row.type);
    const isRA = row.type === 'perolas';
    const isCid = TIPOS_CIDADE.includes(row.type);
    row.values.forEach((value, index) => {
      const numero = asNumber(value);
      if (index === 0) {
        if (isRT) sitPrinc += numero;
        if (isCid) cidPrinc += numero;
      } else if (index === 1) totFogo += numero;
      else if (index === 2) {
        if (isRA) sitAgua += numero;
        if (isCid) cidAgua += numero;
      } else if (index === 3) totBella += numero;
      else if (index === 4) totTerra += numero;
    });
    row.values.forEach(value => { totais[row.type] += asNumber(value); });
  });

  return { totais, cidPrinc, sitPrinc, cidAgua, sitAgua, totFogo, totBella, totTerra };
}

export function calcularMetricas({ data, niveis, territorios, dbEdificios }) {
  const base = calcularTotais(data);
  const fortaleza = findNivel(dbEdificios, 'Fortaleza', niveis.fortaleza);
  const limiteSipioPrinc = limiteSitioPrincipal(dbEdificios, niveis.fortaleza);
  const maxTerritorios = Number(fortaleza.territorios || 0);
  const terrUsados = Object.values(territorios).reduce((acc, valor) => acc + Number(valor || 0), 0);
  const terrLivres = Math.max(0, maxTerritorios - terrUsados);

  const dbCasa = findNivel(dbEdificios, 'Casa', niveis.casas);
  const dbFonte = findNivel(dbEdificios, 'FonteDaCura', niveis.fontes);
  const dbFaz = findNivel(dbEdificios, 'Fazenda', niveis.fazendas);
  const dbMin = findNivel(dbEdificios, 'Mina', niveis.minas);
  const dbPed = findNivel(dbEdificios, 'Pedra', niveis.pedreiras);
  const dbSer = findNivel(dbEdificios, 'Serraria', niveis.serrarias);
  const dbPer = findNivel(dbEdificios, 'FazendaPerolas', niveis.perolas);

  const { totais } = base;
  const popTotal = totais.casas * Number(dbCasa.popAumento || 0);
  const popUsada = (totais.fazendas * Number(dbFaz.pop || 0))
    + (totais.minas * Number(dbMin.pop || 0))
    + (totais.pedreiras * Number(dbPed.pop || 0))
    + (totais.serrarias * Number(dbSer.pop || 0))
    + (totais.perolas * Number(dbPer.pop || 0));

  return {
    ...base,
    limiteSipioPrinc,
    maxTerritorios,
    terrUsados,
    terrLivres,
    popTotal,
    popUsada,
    popLivre: popTotal - popUsada,
    totalCura: totais.fontes * Number(dbFonte.maxTropas || 0),
    prodComida: (totais.fazendas * Number(dbFaz.prodHora || 0)) + (territorios.fazendas * 2750),
    prodFerro: (totais.minas * Number(dbMin.prodHora || 0)) + (territorios.minas * 2750),
    prodPedra: (totais.pedreiras * Number(dbPed.prodHora || 0)) + (territorios.pedreiras * 2750),
    prodMadeira: (totais.serrarias * Number(dbSer.prodHora || 0)) + (territorios.serrarias * 2750),
    prodPerolas: totais.perolas * Number(dbPer.prodHora || 0),
    dbCasa,
    limites: { ...LIMITES, sitioPrincipal: limiteSipioPrinc },
  };
}

export function validarDistribuicao({ data, rowIndex, colIndex, valNum, expansoes, limiteSipioPrinc }) {
  const rowType = data[rowIndex].type;
  if (!isAllowed(rowType, colIndex)) return { ok: false };
  const isRT = TIPOS_RECURSO_TERRESTRE.includes(rowType);
  const isRA = rowType === 'perolas';
  const isCid = TIPOS_CIDADE.includes(rowType);
  let total = 0;

  if (colIndex === 0) {
    if (isRT) {
      data.forEach((row, index) => {
        if (TIPOS_RECURSO_TERRESTRE.includes(row.type)) total += index === rowIndex ? valNum : asNumber(row.values[0]);
      });
      if (total > limiteSipioPrinc) return { ok: false, message: `SÍTIO CHEIO: Limite de ${limiteSipioPrinc} atingido.`, severity: 'warning' };
    } else if (isCid) {
      total = 5;
      data.forEach((row, index) => {
        if (TIPOS_CIDADE.includes(row.type)) total += index === rowIndex ? valNum : asNumber(row.values[0]);
      });
      if (total > LIMITES.cidadePrincipal) return { ok: false, message: `CIDADE PRINCIPAL LOTADA: Máx ${LIMITES.cidadePrincipal}.`, severity: 'error' };
    }
  } else if (colIndex === 2) {
    if (isRA) {
      data.forEach((row, index) => {
        if (row.type === 'perolas') total += index === rowIndex ? valNum : asNumber(row.values[2]);
      });
      if (total > LIMITES.sitioAgua) return { ok: false, message: `ILHA DE ÁGUA LOTADA: Máx ${LIMITES.sitioAgua} Pérolas.`, severity: 'error' };
    } else if (isCid) {
      data.forEach((row, index) => {
        if (TIPOS_CIDADE.includes(row.type)) total += index === rowIndex ? valNum : asNumber(row.values[2]);
      });
      if (total > LIMITES.cidadeAgua) return { ok: false, message: `CIDADE NA ÁGUA LOTADA: Máx ${LIMITES.cidadeAgua}.`, severity: 'error' };
    }
  } else {
    const limite = limiteIlhaSecundaria(colIndex, expansoes);
    data.forEach((row, index) => { total += index === rowIndex ? valNum : asNumber(row.values[colIndex]); });
    if (limite !== null && total > limite) {
      return { ok: false, message: `LIMITE ILHA ${ILHAS_NOMES[colIndex]} ATINGIDO: ${limite}.`, severity: 'error' };
    }
  }

  return { ok: true };
}
