import React, { useMemo } from 'react';
import GameHeader from '../../shared/GameHeader.jsx';
import { useGameData } from '../../../data/GameDataContext.jsx';
import { convertBaseUtcTimeToRealm, parseUtcOffset } from '../../../utils/timezone.js';

const local = (record, field, locale) => locale !== 'pt-BR'
  ? record?.i18n?.[locale]?.[field] || record?.[field] || ''
  : record?.[field] || '';

function nav(setRoute, route, key, value) {
  try { if (key && value) sessionStorage.setItem(key, value); } catch { /* optional */ }
  setRoute?.(route);
}

function ItemIcon({ item, size = 46 }) {
  return item?.imagem
    ? <img className="zyr-item-icon" src={item.imagem} alt={item.nome || ''} style={{ width:size, height:size }} loading="lazy" />
    : <span className="zyr-item-fallback" style={{ width:size, height:size }}>◆</span>;
}

function Recipe({ recipe, locale }) {
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  return (
    <article className="zyr-recipe">
      <div className="zyr-recipe-result">
        <strong>{fmt.format(recipe.resultadoQuantidade || 1)}× {recipe.resultadoNome}</strong>
        {recipe.tempoHoras != null ? <small>⏳ {recipe.tempoHoras}h</small> : <small>⏳ Tempo não confirmado</small>}
      </div>
      <div className="zyr-recipe-ingredients">
        {(recipe.ingredientes || []).map((ingredient, index) => (
          <div key={`${ingredient.itemSlug}-${index}`}>
            <ItemIcon item={ingredient} size={36} />
            <span><b>{fmt.format(ingredient.quantidade)}</b> {ingredient.nome}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function BossCard({ entry, onOpen, locale }) {
  const z = entry.zyrvorthian || {};
  const status = z.dadosStatus || 'pendente';
  return (
    <button type="button" className={`zyr-boss-card is-${status}`} onClick={() => onOpen(entry)}>
      <div className="zyr-boss-card-top">
        <span>🐲 Chefe da Calamidade</span>
        <b>{status === 'confirmado' ? '✓ Confirmado' : status === 'parcial' ? '◐ Parcial' : 'Pendente'}</b>
      </div>
      <h3>{local(entry, 'nome', locale)}</h3>
      {z.descricao ? <p>{z.descricao}</p> : <p>Materiais e receitas confirmados; habilidades e ranking aguardam novos registros.</p>}
      <div className="zyr-material-strip">
        {(z.materiais || []).map(material => <ItemIcon key={material.itemSlug} item={material} />)}
      </div>
      <span className="zyr-open">Abrir ficha ›</span>
    </button>
  );
}

function ConfirmedSchedules({ mechanics = {} }) {
  const { reinos } = useGameData();
  const baseTime = mechanics.horarioBaseUtc || mechanics.referenciaHorario?.hora || '19:00';
  const rows = useMemo(() => {
    const zones = [...new Set((reinos || []).map(reino => reino?.fuso).filter(Boolean))]
      .sort((a,b) => parseUtcOffset(a) - parseUtcOffset(b));
    return zones.map(fuso => ({ fuso, converted:convertBaseUtcTimeToRealm(baseTime, fuso) })).filter(row => row.converted);
  }, [reinos, baseTime]);
  return (
    <section className="zyr-panel">
      <div className="zyr-section-title"><span>🕐</span><div><small>SERVIDOR BASE</small><strong>Conversão por fuso</strong></div></div>
      <p className="zyr-copy">A referência canônica é <b>{baseTime} UTC+0</b>. Os demais horários são calculados a partir do servidor base, incluindo a virada correta do dia.</p>
      {rows.length ? <div className="zyr-schedule-list">{rows.map(({fuso,converted}) => (
        <div key={fuso}><span><b>{fuso}</b></span><small>Base {baseTime} UTC+0</small><strong>{converted.time}{converted.dayDelta < 0 ? ' · dia anterior' : converted.dayDelta > 0 ? ' · dia seguinte' : ''}</strong></div>
      ))}</div> : null}
      <div className="zyr-server-reset">🌐 Virada diária do servidor base: <b>00:00 UTC+0</b>. A conversão para cada realm é feita automaticamente; Brasília não é referência interna.</div>
    </section>
  );
}

export function ZyrvorthianLanding({ entries, mechanics = {}, onOpen, onBack, setRoute, locale }) {
  const ref = mechanics.referenciaHorario || {};
  const increase = mechanics.aumentar || {};
  return (
    <div className="zyr-page">
      <button type="button" className="campaign-back" onClick={onBack}><span>←</span> Categorias</button>
      <div className="tw-card mb-3 zyr-hero">
        <GameHeader title="🐲 Zyrvorthian" />
        <div className="zyr-hero-copy">
          <p>Nas Provações da Calamidade, um Chefe da Calamidade permanece ativo por uma semana. Cada chefe possui habilidades, materiais exclusivos e uma Loja de Surpresas própria.</p>
          <div className="zyr-stat-grid">
            <div><b>7 dias</b><span>chefe ativo</span></div>
            <div><b>14 dias</b><span>loja disponível</span></div>
            <div><b>+{increase.maximoPercentual || 50}%</b><span>Aumentar máximo</span></div>
          </div>
          <small className="zyr-reference">Referência canônica confirmada: {ref.reinoNome || 'Corvith'} ({ref.fuso || 'UTC+0'}) — batalha {mechanics.horarioBaseUtc || ref.hora || '19:00'}, com {ref.preparacaoMinutos || 5} min de preparação. Os demais fusos são convertidos a partir de UTC+0.</small>
        </div>
      </div>

      <div className="zyr-action-grid">
        <button type="button" onClick={() => nav(setRoute,'dicas','guiadoa_open_tip','tutorial-defesa-inimigos')}>🛡️ Como se defender</button>
        <button type="button" onClick={() => nav(setRoute,'itens','guiadoa_open_item','tratado-cessar-fogo')}>⏳ Tratado de 12h</button>
        <button type="button" onClick={() => nav(setRoute,'itens','guiadoa_open_item','pergaminho-devastar')}>📜 Ticket Devastar</button>
        <button type="button" onClick={() => setRoute?.('dragao_dragao_agua')}>🐉 Dragão da Água</button>
      </div>

      <section className="zyr-panel">
        <div className="zyr-section-title"><span>⚔️</span><div><small>REGRAS PRINCIPAIS</small><strong>Como a batalha funciona</strong></div></div>
        <div className="zyr-mechanics-grid">
          <article><b>🔄 Rotação semanal</b><p>O chefe muda toda segunda-feira às 00:00 UTC. A loja do chefe continua acessível por 2 semanas.</p></article>
          <article><b>📈 Aumentar</b><p>Sorteia +{(increase.incrementosPercentuais || [5,10,15,20]).join('%, +')}% de ataque e pode acumular até {increase.maximoPercentual || 50}% durante a ocorrência atual.</p></article>
          <article><b>🎯 Golpe final</b><p>Quem causa o golpe final recebe uma recompensa adicional específica do chefe.</p></article>
          <article><b>🔥 Fúria</b><p>No fim da batalha, o chefe causa +{mechanics?.furia?.danoAdicionalPercentual ?? 0.1}% de dano adicional a todas as tropas.</p></article>
          <article><b>📊 Nível dinâmico</b><p>O chefe pode subir quando é derrotado rapidamente e cair após duas vitórias seguidas, nunca abaixo do Nv.1. Nível maior aumenta vida e recompensas.</p></article>
          <article><b>🎁 Recompensas</b><p>As recompensas são enviadas {mechanics.recompensaAposInicioMinutos || 15} minutos após o início da batalha.</p></article>
        </div>
      </section>

      <section className="zyr-panel">
        <div className="zyr-section-title"><span>🧭</span><div><small>AUTOMAÇÃO DO JOGO</small><strong>Organizando</strong></div></div>
        <p className="zyr-copy">Você pode preparar General, Dragão, Tomos e Tropas. Se não entrar manualmente no campo ou estiver offline quando começar, a formação é enviada automaticamente. Entrar manualmente no campo desfaz a organização. A reposição automática, quando ativada, recompõe as perdas a cada retorno.</p>
      </section>

      <ConfirmedSchedules mechanics={mechanics} />

      <div className="zyr-section-heading"><div><small>CHEFES DOCUMENTADOS</small><strong>Calamidades conhecidas</strong></div><span>{entries.length}</span></div>
      <div className="zyr-boss-grid">{entries.map(entry => <BossCard key={entry.slug} entry={entry} onOpen={onOpen} locale={locale} />)}</div>
    </div>
  );
}

export function ZyrvorthianDetail({ entry, onBack, setRoute, locale }) {
  const z = entry.zyrvorthian || {};
  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const status = z.dadosStatus || 'pendente';
  return (
    <div className="zyr-page">
      <button type="button" className="campaign-back" onClick={onBack}><span>←</span> Zyrvorthian</button>
      <div className="tw-card mb-3 zyr-boss-hero">
        <GameHeader title={`🐲 ${local(entry,'nome',locale)}`} />
        <div className="zyr-hero-copy">
          <span className={`zyr-status is-${status}`}>{status === 'confirmado' ? '✓ Dados confirmados' : status === 'parcial' ? '◐ Dados parciais' : 'Dados pendentes'}</span>
          {z.descricao ? <p>{z.descricao}</p> : <p>Esta ficha ainda está sendo completada. Somente informações comprovadas pelos screenshots foram cadastradas.</p>}
        </div>
      </div>

      {(z.habilidades || []).length > 0 && <section className="zyr-panel">
        <div className="zyr-section-title"><span>✦</span><div><small>COMBATE</small><strong>Habilidades</strong></div></div>
        <div className="zyr-skills">{z.habilidades.map(skill => (
          <article key={skill.id}><ItemIcon item={skill} size={58} /><div><strong>{skill.nome}</strong><p>{skill.descricao}</p>{skill.tropas?.length ? <small>Atacantes vitais: {skill.tropas.join(' · ')}</small> : null}</div></article>
        ))}</div>
      </section>}

      <section className="zyr-panel">
        <div className="zyr-section-title"><span>◆</span><div><small>EXCLUSIVOS</small><strong>Materiais do chefe</strong></div></div>
        <div className="zyr-material-list">{(z.materiais || []).map(material => <article key={material.itemSlug}><ItemIcon item={material} size={58}/><div><strong>{material.nome}</strong><button type="button" onClick={() => nav(setRoute,'itens','guiadoa_open_item',material.itemSlug)}>Ver em Itens ›</button></div></article>)}</div>
      </section>

      {(z.golpeFinal || []).length > 0 && <section className="zyr-panel">
        <div className="zyr-section-title"><span>🎯</span><div><small>BÔNUS</small><strong>Recompensa do golpe final</strong></div></div>
        <div className="zyr-reward-row">{z.golpeFinal.map(reward => <div key={reward.itemSlug}><ItemIcon item={reward}/><strong>{fmt.format(reward.quantidade)}×</strong><span>{reward.nome}</span></div>)}</div>
      </section>}

      {(z.ranking || []).length > 0 && <section className="zyr-panel">
        <div className="zyr-section-title"><span>🏆</span><div><small>CLASSIFICAÇÃO</small><strong>Recompensas confirmadas</strong></div></div>
        <div className="zyr-ranking">{z.ranking.map((rank,index) => <div key={index}><b>{rank.posicaoMin === rank.posicaoMax ? `${rank.posicaoMin}º` : `${rank.posicaoMin}º–${rank.posicaoMax}º`}</b><span>{fmt.format(rank.quantidade)}× {rank.itemNome}</span></div>)}</div>
      </section>}

      {(z.receitas || []).length > 0 && <section className="zyr-panel">
        <div className="zyr-section-title"><span>🛍️</span><div><small>LOJA DE SURPRESAS</small><strong>Receitas confirmadas</strong></div></div>
        <div className="zyr-recipes">{z.receitas.map(recipe => <Recipe key={recipe.id} recipe={recipe} locale={locale}/>)}</div>
      </section>}

      {(z.observacoes || []).length > 0 && <section className="zyr-pending-note"><b>ℹ️ Limites dos dados</b>{z.observacoes.map((note,index) => <p key={index}>{note}</p>)}</section>}

      <div className="zyr-detail-actions">
        <button type="button" onClick={() => nav(setRoute,'dicas','guiadoa_open_tip','tutorial-defesa-inimigos')}>🛡️ Abrir tutorial de defesa</button>
        <button type="button" onClick={() => nav(setRoute,'itens','guiadoa_open_item','tratado-cessar-fogo')}>⏳ Ver Tratado de Cessar-fogo</button>
      </div>
      <div className="campaign-source-foot">Fonte: {entry.fonte?.descricao || 'screenshots'} · {entry.fonte?.data || '—'}</div>
    </div>
  );
}
