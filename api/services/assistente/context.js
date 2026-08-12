import { carregarDadosAssistente } from './models.js';
import { APRIMORAMENTO, calcCustoApr } from './aprimoramento.js';

export const buildContext = async () => {
  try {
    const { tropas, itens, edificios, dragoes, pesquisas, niveis, reinos } = await carregarDadosAssistente();

    // ── TROPAS ────────────────────────────────────────────────────────────────
    const tropasTxt = tropas.length
      ? [...tropas].sort((a, b) => (b.poder || 0) - (a.poder || 0)).map((t, i) => {
          const combate = t.combate === 'distancia' ? 'Distância' : 'Corpo a Corpo';
          const flags   = [t.rapida && 'Rápida', t.tipo === 'especial' && 'Especial'].filter(Boolean).join(' · ');
          return (
            `${i + 1}. **${t.nome}** [${combate}${flags ? ' · ' + flags : ''}]\n` +
            `   Poder:${t.poder ?? 0} | Vida:${t.vida ?? 0} | Def:${t.def ?? 0} | ` +
            `AtqPerto:${t.atqPerto ?? 0} | AtqDist:${t.atqDist ?? 0}\n` +
            `   Alcance:${t.alcance ?? 0} | Vel:${t.vel ?? 0} | Carga:${t.car ?? 0} | Gestão:${t.gestao ?? 0}` +
            (t.desc ? `\n   Habilidade: ${t.desc}` : '')
          );
        }).join('\n\n')
      : 'Nenhuma tropa cadastrada.';

    // ── ITENS ─────────────────────────────────────────────────────────────────
    const itensTxt = itens.length
      ? itens.map(i =>
          `• **${i.nome}**` +
          (i.descricao ? `: ${i.descricao}` : '') +
          (i.onde      ? ` | Onde obter: ${i.onde}` : '')
        ).join('\n')
      : 'Nenhum item cadastrado.';

    // ── EDIFÍCIOS — tabela completa de níveis ─────────────────────────────────
    const edificiosTxt = edificios.length
      ? edificios.map(e => {
          const niveisArr = Array.isArray(e.niveis) ? e.niveis : [];
          const cols      = e.colunas || [];
          const tabelaNiveis = niveisArr.length && cols.length
            ? '\n  Níveis:\n' + niveisArr.map(n =>
                `    Nv${n.nivel}: ` + cols.map(c => `${c.label}:${n[c.key] ?? '?'}`).join(' | ')
              ).join('\n')
            : '';
          return (
            `• **${e.nome}**${e.tag ? ` [${e.tag}]` : ''}` +
            (e.descricao ? ` — ${e.descricao}` : '') +
            tabelaNiveis
          );
        }).join('\n\n')
      : 'Nenhum edifício cadastrado.';

    // ── DRAGÕES — todos os níveis ─────────────────────────────────────────────
    const dragoesTxt = dragoes.length
      ? dragoes.map(d => {
          const nArr = Array.isArray(d.niveis) ? d.niveis : [];
          const tabelaNiveis = nArr.length
            ? '\n  Níveis:\n' + nArr.map(n =>
                `    Nv${n.nivel}` +
                (n.xpNecessaria ? ` (XP:${n.xpNecessaria.toLocaleString('pt-BR')})` : '') +
                ` | Vida:${n.vida ?? 0} | Def:${n.defesa ?? 0} | AtqPerto:${n.ataquePerto ?? 0}` +
                ` | AtqDist:${n.ataqueDistante ?? 0} | Elemental:${n.ataqueElemental ?? 0}`
              ).join('\n')
            : '';
          return (
            `• **${d.nome}**` +
            (d.elemento ? ` [${d.elemento}]` : '') +
            (d.raridade ? ` — ${d.raridade}` : '') +
            tabelaNiveis
          );
        }).join('\n\n')
      : 'Nenhum dragão cadastrado.';

    // ── PESQUISAS — agrupadas com todos os tempos ─────────────────────────────
    const pesquisasTxt = pesquisas.length
      ? (() => {
          const grupos = {};
          pesquisas.forEach(p => {
            const cat = p.categoria || 'Geral';
            if (!grupos[cat]) grupos[cat] = [];
            const niveisInfo = (p.niveis || []).length
              ? ` | Tempos: ${p.niveis.map(n => `Nv${n.nivel}=${n.tempo || '?'}`).join(', ')}`
              : '';
            grupos[cat].push(`  • **${p.nome}** (máx Nv${p.nivelMax ?? '?'})${niveisInfo}`);
          });
          return Object.entries(grupos)
            .map(([cat, lista]) => `[${cat}]\n${lista.join('\n')}`)
            .join('\n\n');
        })()
      : 'Nenhuma pesquisa cadastrada.';

    // ── NÍVEIS DO CASTELO ─────────────────────────────────────────────────────
    const niveisTxt = niveis.length
      ? niveis.map(n =>
          `  Nv${n.nivel}: ${n.xp != null ? n.xp.toLocaleString('pt-BR') + ' XP' : 'desconhecido'}`
        ).join('\n')
      : 'Tabela de níveis não cadastrada.';

    // ── REINOS ────────────────────────────────────────────────────────────────
    const reinosTxt = reinos.length
      ? reinos.map(r =>
          `  Reino ${r.id} — ${r.nome}` +
          (r.regiao ? ` | ${r.regiao}` : '') +
          (r.fuso   ? ` | ${r.fuso}` : '') +
          (r.idioma ? ` | ${r.idioma}` : '')
        ).join('\n')
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
