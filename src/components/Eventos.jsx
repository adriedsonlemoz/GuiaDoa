import React, { useEffect, useMemo, useState } from 'react';
import { useGameData } from '../data/GameDataContext.jsx';
import { getProfile } from '../utils/storage.js';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
import EventRewards from './eventos/EventRewards.jsx';
import EventPhaseList from './eventos/EventPhaseList.jsx';
import { occurrenceForRealm, eventStatus, currentPhase, formatUtcDate, timeRemaining, ruleText, buildEventShareText } from './eventos/eventUtils.js';

const STATUS_ORDER = { ativo:0, proximo:1, encerrado:2, nao_confirmado:3 };

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const el=document.createElement('textarea'); el.value=text; el.style.position='fixed'; el.style.opacity='0'; document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove();
}

export default function Eventos({ setRoute }) {
  const { eventos = [] } = useGameData();
  const profile = getProfile();
  const realmName = profile?.reino || '';
  const { t, content, locale } = useI18n();
  const [scope, setScope] = useState('realm');
  const [openSlug, setOpenSlug] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer=window.setInterval(() => setNow(new Date()), 15000); return () => window.clearInterval(timer); }, []);

  const rows = useMemo(() => {
    if (scope === 'all') return eventos.flatMap(evento => (evento.ocorrencias || []).filter(o => o.confirmado !== false).map(ocorrencia => ({ evento, ocorrencia })));
    return eventos.map(evento => ({ evento, ocorrencia:occurrenceForRealm(evento, realmName) })).filter(x => x.ocorrencia);
  }, [eventos, realmName, scope]);

  const sorted = rows.map(row => ({ ...row, status:eventStatus(row.ocorrencia, now), fase:currentPhase(row.evento,row.ocorrencia, now) }))
    .sort((a,b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) || new Date(a.ocorrencia.inicioServidor) - new Date(b.ocorrencia.inicioServidor));

  const handleCopy = async (evento, ocorrencia, key) => {
    try {
      await copyToClipboard(buildEventShareText(evento, ocorrencia, { content, locale, t }));
      setCopiedKey(key); window.setTimeout(() => setCopiedKey(current => current===key ? '' : current), 1800);
    } catch { setCopiedKey(''); }
  };

  return <div className="max-w-md mx-auto pb-6">
    <div className="tw-card mb-3"><GameHeader title={t('events.title')} /><div className="event-intro">
      <p>{t('events.intro')}</p>
      <div className="event-realm-line"><span>🌍</span><div><small>{t('events.selected_realm')}</small><strong>{realmName || t('events.no_realm')}</strong></div></div>
      <div className="event-confirmation-note">ℹ️ {t('events.not_confirmed_rule')}</div>
      <div className="event-scope-tabs"><button className={scope==='realm'?'active':''} onClick={()=>setScope('realm')}>{t('events.this_realm')}</button><button className={scope==='all'?'active':''} onClick={()=>setScope('all')}>{t('events.confirmed_realms')}</button></div>
    </div></div>

    {sorted.length === 0 ? <div className="tw-card event-empty"><span>📭</span><strong>{t('events.none_confirmed')}</strong><p>{t('events.none_confirmed_help')}</p></div> : sorted.map(({ evento, ocorrencia, status, fase }) => {
      const key=`${evento.slug}:${ocorrencia.codigo}`; const expanded=openSlug===key; const left=timeRemaining(status==='proximo'?ocorrencia.inicioServidor:ocorrencia.fimServidor, now);
      const confirmedRealms=(evento.ocorrencias||[]).filter(o=>o.confirmado!==false).map(o=>o.reinoNome).filter(Boolean);
      return <article className="tw-card event-card" key={key}>
        <button className="event-card-summary" onClick={()=>setOpenSlug(expanded?'':key)}>
          <div className="event-card-top"><div><small>{ocorrencia.reinoNome} · {ocorrencia.fusoReino || '—'}</small><strong>{content(evento,'nome')}</strong></div><span className={`event-status is-${status}`}>{t(`events.status.${status}`)}</span></div>
          <p>{content(evento,'resumo')}</p>
          {fase && <div className="event-current-phase"><small>{t('events.current_phase')}</small><strong>{content(fase,'nome')}</strong></div>}
          <div className="event-card-dates"><span>{formatUtcDate(ocorrencia.inicioServidor,locale)}</span><b>→</b><span>{formatUtcDate(ocorrencia.fimServidor,locale)}</span></div>
          {(status==='ativo'||status==='proximo') && <div className="event-countdown">⏳ {status==='proximo'?t('events.starts_in'):t('events.ends_in')} {left.days?`${left.days}d `:''}{left.hours}h {left.minutes}m</div>}
        </button>
        {expanded && <div className="event-card-detail">
          <div className="event-detail-actions"><button type="button" className="event-copy-button" onClick={()=>handleCopy(evento,ocorrencia,key)}>{copiedKey===key?'✓ '+t('events.copied'):'⧉ '+t('events.copy_instructions')}</button></div>
          <div className="event-reset-rule"><strong>🌐 {t('events.server_clock')}</strong><span>{t('events.server_clock_help',{time:evento.horarioReset||'00:00',zone:evento.servidorFuso||'UTC'})}</span></div>
          <div className="event-confirmed-realms"><small>{t('events.confirmed_in')}</small><div>{confirmedRealms.map(name=><span key={name}>{name}</span>)}</div></div>
          <EventPhaseList evento={evento} occurrence={ocorrencia} current={fase} t={t} content={content} locale={locale} setRoute={setRoute} />
          {(evento.recompensas||[]).length>0 && <details className="event-rules event-final-rewards"><summary>{t('events.final_ranking_rewards')}</summary><div className="event-rules-body"><EventRewards groups={evento.recompensas} t={t} content={content} setRoute={setRoute} /></div></details>}
          {(evento.regras||[]).length>0 && <details className="event-rules"><summary>{t('events.rules')}</summary><ul>{evento.regras.map((r,i)=>{const text=typeof r==='string'?r:(content(r,'texto')||ruleText(r));return text?<li key={r?.id||i}><span aria-hidden="true">›</span><p>{text}</p></li>:null;})}</ul></details>}
        </div>}
      </article>;
    })}
  </div>;
}
