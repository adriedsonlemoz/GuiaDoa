import React, { useMemo, useState } from 'react';
import { useGameData } from '../data/GameDataContext.jsx';
import { getProfile } from '../utils/storage.js';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
import { occurrenceForRealm, eventStatus, currentPhase, formatUtcDate, timeRemaining } from './eventos/eventUtils.js';

const STATUS_ORDER = { ativo:0, proximo:1, encerrado:2, nao_confirmado:3 };

function RewardGroups({ groups, t, content }) {
  if (!groups?.length) return <p className="event-empty-note">{t('events.rewards_pending')}</p>;
  return <div className="event-reward-groups">{groups.map((group, idx) => (
    <div className="event-reward-group" key={`${group.tipo}-${group.requisito}-${group.classificacao}-${idx}`}>
      <strong>{group.tipo === 'ranking' ? `${t('events.ranking')} ${group.classificacao}` : group.requisito != null ? `${t('events.require')} ${group.requisito}` : t('events.rewards')}</strong>
      <div>{(group.itens || []).map((item, itemIdx) => <span key={`${item.nome}-${itemIdx}`}>{content(item,'nome')} ×{item.quantidade ?? 1}</span>)}</div>
    </div>
  ))}</div>;
}

export default function Eventos() {
  const { eventos = [] } = useGameData();
  const profile = getProfile();
  const realmName = profile?.reino || '';
  const { t, content, locale } = useI18n();
  const [scope, setScope] = useState('realm');
  const [openSlug, setOpenSlug] = useState('');

  const rows = useMemo(() => {
    if (scope === 'all') {
      return eventos.flatMap(evento => (evento.ocorrencias || []).filter(o => o.confirmado !== false).map(ocorrencia => ({ evento, ocorrencia })));
    }
    return eventos.map(evento => ({ evento, ocorrencia:occurrenceForRealm(evento, realmName) })).filter(x => x.ocorrencia);
  }, [eventos, realmName, scope]);

  const sorted = rows.map(row => ({ ...row, status:eventStatus(row.ocorrencia), fase:currentPhase(row.evento,row.ocorrencia) }))
    .sort((a,b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) || new Date(a.ocorrencia.inicioServidor) - new Date(b.ocorrencia.inicioServidor));

  return (
    <div className="max-w-md mx-auto pb-6">
      <div className="tw-card mb-3"><GameHeader title={t('events.title')} /><div className="event-intro">
        <p>{t('events.intro')}</p>
        <div className="event-realm-line"><span>🌍</span><div><small>{t('events.selected_realm')}</small><strong>{realmName || t('events.no_realm')}</strong></div></div>
        <div className="event-confirmation-note">ℹ️ {t('events.not_confirmed_rule')}</div>
        <div className="event-scope-tabs">
          <button className={scope==='realm'?'active':''} onClick={()=>setScope('realm')}>{t('events.this_realm')}</button>
          <button className={scope==='all'?'active':''} onClick={()=>setScope('all')}>{t('events.confirmed_realms')}</button>
        </div>
      </div></div>

      {sorted.length === 0 ? <div className="tw-card event-empty"><span>📭</span><strong>{t('events.none_confirmed')}</strong><p>{t('events.none_confirmed_help')}</p></div> : sorted.map(({ evento, ocorrencia, status, fase }) => {
        const expanded = openSlug === `${evento.slug}:${ocorrencia.codigo}`;
        const left = timeRemaining(status === 'proximo' ? ocorrencia.inicioServidor : ocorrencia.fimServidor);
        const key = `${evento.slug}:${ocorrencia.codigo}`;
        return <article className="tw-card event-card" key={key}>
          <button className="event-card-summary" onClick={()=>setOpenSlug(expanded?'':key)}>
            <div className="event-card-top"><div><small>{ocorrencia.reinoNome} · {ocorrencia.fusoReino || '—'}</small><strong>{content(evento,'nome')}</strong></div><span className={`event-status is-${status}`}>{t(`events.status.${status}`)}</span></div>
            <p>{content(evento,'resumo')}</p>
            {fase && <div className="event-current-phase"><small>{t('events.current_phase')}</small><strong>{content(fase,'nome')}</strong></div>}
            <div className="event-card-dates"><span>{formatUtcDate(ocorrencia.inicioServidor, locale)}</span><b>→</b><span>{formatUtcDate(ocorrencia.fimServidor, locale)}</span></div>
            {(status==='ativo' || status==='proximo') && <div className="event-countdown">⏳ {status==='proximo'?t('events.starts_in'):t('events.ends_in')} {left.days ? `${left.days}d ` : ''}{left.hours}h {left.minutes}m</div>}
          </button>
          {expanded && <div className="event-card-detail">
            <div className="event-reset-rule"><strong>🌐 {t('events.server_clock')}</strong><span>{t('events.server_clock_help', { time:evento.horarioReset || '00:00', zone:evento.servidorFuso || 'UTC' })}</span></div>
            {(evento.fases || []).map(phase => <details className="event-phase" key={phase.codigo} open={fase?.codigo===phase.codigo}>
              <summary><span>{content(phase,'nome')}</span><small>{t('events.days', { start:phase.diaInicio, end:phase.diaFim })}</small></summary>
              <div><p>{content(phase,'objetivo')}</p><RewardGroups groups={phase.recompensas} t={t} content={content} /></div>
            </details>)}
            {(evento.recompensas || []).length > 0 && <details className="event-rules event-final-rewards"><summary>{t('events.final_ranking_rewards')}</summary><RewardGroups groups={evento.recompensas} t={t} content={content} /></details>}
            {(evento.regras || []).length > 0 && <details className="event-rules"><summary>{t('events.rules')}</summary><ul>{evento.regras.map((r,i)=><li key={i}>{r}</li>)}</ul></details>}
          </div>}
        </article>;
      })}
    </div>
  );
}
