import { carregarDadosAssistente } from './models.js';
import { APRIMORAMENTO, calcCustoApr } from './aprimoramento.js';

const localizedValue = (record, field, locale) => (
  locale === 'pt-BR' ? record?.[field] : record?.i18n?.[locale]?.[field] ?? record?.[field]
);

export const buildContext = async (locale = 'pt-BR') => {
  try {
    const { tropas, itens, edificios, dragoes, pesquisas, niveis, reinos } = await carregarDadosAssistente();

    // ── TROPAS ────────────────────────────────────────────────────────────────
    const tropasTxt = tropas.length
      ? [...tropas].sort((a, b) => (b.poder || 0) - (a.poder || 0)).map((t, i) => {
          const nome = localizedValue(t, 'nome', locale);
          const desc = localizedValue(t, 'desc', locale);
          const combate = t.combate === 'distancia' ? (locale === 'en-US' ? 'Ranged' : 'Distância') : (locale === 'en-US' ? 'Melee' : 'Corpo a Corpo');
          const flags   = [t.rapida && (locale === 'en-US' ? 'Fast' : 'Rápida'), t.tipo === 'especial' && (locale === 'en-US' ? 'Special' : 'Especial')].filter(Boolean).join(' · ');
          return (
            `${i + 1}. **${nome}** [${combate}${flags ? ' · ' + flags : ''}]\n` +
            `   Poder:${t.poder ?? 0} | Vida:${t.vida ?? 0} | Def:${t.def ?? 0} | ` +
            `AtqPerto:${t.atqPerto ?? 0} | AtqDist:${t.atqDist ?? 0}\n` +
            `   Alcance:${t.alcance ?? 0} | Vel:${t.vel ?? 0} | Carga:${t.car ?? 0} | Gestão:${t.gestao ?? 0}` +
            (desc ? `\n   Habilidade: ${desc}` : '')
          );
        }).join('\n\n')
      : 'Nenhuma tropa cadastrada.';

    // ── ITENS ─────────────────────────────────────────────────────────────────
    const itensTxt = itens.length
      ? itens.map(i => {
          const nome = localizedValue(i, 'nome', locale);
          const descricao = localizedValue(i, 'descricao', locale);
          const origem = localizedValue(i, 'origem', locale) || localizedValue(i, 'onde', locale);
          const uso = localizedValue(i, 'uso', locale);
          const categoria = localizedValue(i, 'categoria', locale);
          const raridade = localizedValue(i, 'raridade', locale);
          const meta = [categoria, raridade].filter(Boolean).join(' · ');
          const preco = Number.isFinite(Number(i?.preco?.valor)) ? ` | Preço: ${Number(i.preco.valor).toLocaleString(locale)} ${locale === 'en-US' ? 'Rubies' : 'Rubis'}` : '';
          const efeito = i?.efeito?.tipo && i?.efeito?.valor != null ? ` | Efeito: ${i.efeito.tipo} ${i.efeito.valor} ${i.efeito.unidade || ''}`.trimEnd() : '';
          return `• **${nome}**${meta ? ` [${meta}]` : ''}` + (descricao ? `: ${descricao}` : '') + preco + efeito + (uso ? ` | Uso: ${uso}` : '') + (origem ? ` | Origem: ${origem}` : '');
        }).join('\n')
      : 'Nenhum item cadastrado.';

    // ── EDIFÍCIOS — tabela completa de níveis ─────────────────────────────────
    const edificiosTxt = edificios.length
      ? edificios.map(e => {
          const nome = localizedValue(e, 'nome', locale);
          const tag = localizedValue(e, 'tag', locale);
          const descricao = localizedValue(e, 'descricao', locale);
          const niveisArr = Array.isArray(e.niveis) ? e.niveis : [];
          const cols      = e.colunas || [];
          const tabelaNiveis = niveisArr.length && cols.length
            ? '\n  Níveis:\n' + niveisArr.map(n =>
                `    Nv${n.nivel}: ` + cols.map(c => `${c.label}:${n[c.key] ?? '?'}`).join(' | ')
              ).join('\n')
            : '';
          let especial = '';
          if (e.tipoModulo === 'gruta' && e.dadosEspeciais) {
            const d = e.dadosEspeciais;
            especial = `
  Sistema especial: requer Aliança=${d.requerAlianca ? 'sim' : 'não'} | requer Base da Aliança=${d.requerBaseAlianca ? 'sim' : 'não'} | exploração=${d.exploracaoHoras ?? '?'}h | 100 Órbitas=${d.orbitasPorPedraNivel1 ?? '?'} Pedra Nv.1 | nível máximo=${d.nivelMax ?? '?'}`;
          }
          if (e.tipoModulo === 'basilica' && e.dadosEspeciais) {
            const d = e.dadosEspeciais;
            const pedras = (d.pedras || []).map(p => localizedValue(p, 'nome', locale)).filter(Boolean).join(', ');
            especial = `
  Sistema especial: depende dos recursos da Gruta | nível máximo=${d.nivelMax ?? '?'} | ranhuras máximas=${d.ranhurasMax ?? '?'} | Pedra máxima=Lv.${d.combinacao?.projecaoFormula?.nivelMaxExistente ?? '?'}${pedras ? `
  Pedras: ${pedras}` : ''}`;
          }
          return (
            `• **${nome}**${tag ? ` [${tag}]` : ''}` +
            (descricao ? ` — ${descricao}` : '') +
            especial + tabelaNiveis
          );
        }).join('\n\n')
      : 'Nenhum edifício cadastrado.';

    // ── DRAGÕES — todos os níveis ─────────────────────────────────────────────
    const dragoesTxt = dragoes.length
      ? dragoes.map(d => {
          const nome = localizedValue(d, 'nome', locale);
          const elemento = localizedValue(d, 'elemento', locale);
          const raridade = localizedValue(d, 'raridade', locale);
          const nArr = Array.isArray(d.niveis) ? d.niveis : [];
          const tabelaNiveis = nArr.length
            ? '\n  Níveis:\n' + nArr.map(n =>
                `    Nv${n.nivel}` +
                (n.xpNecessaria ? ` (XP:${n.xpNecessaria.toLocaleString(locale)})` : '') +
                ` | Vida:${n.vida ?? 0} | Def:${n.defesa ?? 0} | AtqPerto:${n.ataquePerto ?? 0}` +
                ` | AtqDist:${n.ataqueDistante ?? 0} | Elemental:${n.ataqueElemental ?? 0}`
              ).join('\n')
            : '';
          const alimentos = (d.itensAlimentacao || []).map(food => {
            const nomeComida = localizedValue(food, 'nome', locale);
            return `${nomeComida}: ${food.xp || 0} XP`;
          }).join(' · ');
          return (
            `• **${nome}**` +
            (elemento ? ` [${elemento}]` : '') +
            (raridade ? ` — ${raridade}` : '') +
            (alimentos ? `\n  ${locale === 'en-US' ? 'Feeding' : 'Alimentação'}: ${alimentos}` : '') +
            tabelaNiveis
          );
        }).join('\n\n')
      : 'Nenhum dragão cadastrado.';

    // ── PESQUISAS — agrupadas com todos os tempos ─────────────────────────────
    const pesquisasTxt = pesquisas.length
      ? (() => {
          const grupos = {};
          pesquisas.forEach(p => {
            const nome = localizedValue(p, 'nome', locale);
            const cat = p.categoria || 'Geral';
            if (!grupos[cat]) grupos[cat] = [];
            const niveisInfo = (p.niveis || []).length
              ? ` | Tempos: ${p.niveis.map(n => `Nv${n.nivel}=${n.tempo || '?'}`).join(', ')}`
              : '';
            grupos[cat].push(`  • **${nome}** (máx Nv${p.nivelMax ?? '?'})${niveisInfo}`);
          });
          return Object.entries(grupos)
            .map(([cat, lista]) => `[${cat}]\n${lista.join('\n')}`)
            .join('\n\n');
        })()
      : 'Nenhuma pesquisa cadastrada.';

    // ── NÍVEIS DO CASTELO ─────────────────────────────────────────────────────
    const niveisTxt = niveis.length
      ? niveis.map(n =>
          `  Nv${n.nivel}: ${(n.poderNecessario ?? n.xp) != null ? (n.poderNecessario ?? n.xp).toLocaleString(locale) + (String(locale).startsWith('en') ? ' power' : ' de poder') : (String(locale).startsWith('en') ? 'unknown' : 'desconhecido')}`
        ).join('\n')
      : 'Tabela de níveis não cadastrada.';

    // ── REINOS ────────────────────────────────────────────────────────────────
    const reinosTxt = reinos.length
      ? reinos.map(r => {
          const nome = localizedValue(r, 'nome', locale);
          const regiao = localizedValue(r, 'regiao', locale);
          const idioma = localizedValue(r, 'idioma', locale);
          return `  Reino ${r.id} — ${nome}` + (regiao ? ` | ${regiao}` : '') + (r.fuso ? ` | ${r.fuso}` : '') + (idioma ? ` | ${idioma}` : '');
        }).join('\n')
      : 'Nenhum reino cadastrado.';

    // ── APRIMORAMENTO ─────────────────────────────────────────────────────────
    const aprTxt =
      `Raridades (em ordem): ${APRIMORAMENTO.raridades.join(' → ')}\n\n` +
      `Custo por nível (ciclo base de 5 atributos): ${APRIMORAMENTO.custoBase.join(', ')} fósseis\n` +
      `Multiplicadores de fósseis por raridade: ` +
        Object.entries(APRIMORAMENTO.multiplicadores.fosseis).map(([r, v]) => `${r}:x${v}`).join(' | ') + '\n' +
      `Multiplicadores de poções: ` +
        Object.entries(APRIMORAMENTO.multiplicadores.pocoes).map(([r, v]) => `${r}:x${v}`).join(' | ') + '\n' +
      `Multiplicadores de relíquias: ` +
        Object.entries(APRIMORAMENTO.multiplicadores.reliquias).map(([r, v]) => `${r}:x${v}`).join(' | ') + '\n\n' +
      `Atributos disponíveis:\n` +
        APRIMORAMENTO.atributos.map(a =>
          `  • ${a.nome} [${a.tipo}]${a.contra ? ` — contra: ${a.contra}` : ''}: ${a.desc}`
        ).join('\n') + '\n\n' +
      `Categorias de tropas para aprimoramento:\n` +
        APRIMORAMENTO.categorias.map(c =>
          `  Categoria ${c.cat}: ${c.tropas}`
        ).join('\n') + '\n\n' +
      `Exemplos de custo total calculado:\n` + [
        ['Épico', 1, 5], ['Épico', 1, 10], ['Lendário', 1, 5], ['Lendário', 1, 10], ['Mitológico', 1, 5],
      ].map(([r, de, ate]) => {
        const c = calcCustoApr(r, de, ate);
        return `  ${r} Nv${de}→${ate}: ${c.fosseis} fósseis | ${c.pocoes} poções | ${c.reliquias} relíquias`;
      }).join('\n');

    return { tropasTxt, itensTxt, edificiosTxt, dragoesTxt, pesquisasTxt, niveisTxt, reinosTxt, aprTxt, tropasDados: tropas };
  } catch (e) {
    console.error('[assistente] erro contexto:', e.message);
    return { tropasTxt:'', itensTxt:'', edificiosTxt:'', dragoesTxt:'', pesquisasTxt:'', niveisTxt:'', reinosTxt:'', aprTxt:'', tropasDados:[] };
  }
};
