import React, { useEffect, useMemo, useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import { useGameData } from '../data/GameDataContext.jsx';
import { useI18n } from '../hooks/useI18n.jsx';
import { occurrenceForRealm, eventStatus } from './eventos/eventUtils.js';
import { API_URL as API } from '../config/api.js';
import { formatRealmAge } from '../utils/realmAge.js';

function dateLong(value, locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }).format(date);
}

function timezoneCurrentTime(value, now = new Date(), locale = 'pt-BR') {
  const offset=timezoneOrder(value);
  const shifted=new Date(now.getTime()+offset*3600000);
  return new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit',timeZone:'UTC',hour12:false}).format(shifted);
}

function timezoneOrder(value) {
  const match = String(value || '').match(/^UTC([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) + Number(match[3] || 0) / 60);
}

function realmIcon(realm) {
  if (realm?.tipoEspecial === 'idade_dragao') return '🐉';
  if (realm?.tipoEspecial === 'hardcore') return '⚔️';
  return '◎';
}

function RealmFact({ label, value, muted = false }) {
  return <div className={`realm-detail-fact${muted?' is-missing':''}`}><small>{label}</small><strong>{value}</strong></div>;
}

function RealmTypeBadge({ realm, t }) {
  if (realm?.tipoEspecial === 'idade_dragao') return <span className="realm-type-badge is-dragon">🐉 {t('realms.type_dragon_age')}</span>;
  if (realm?.tipoEspecial === 'hardcore') return <span className="realm-type-badge is-hardcore">⚔️ {t('realms.type_hardcore')}</span>;
  return null;
}

export default function Reinos() {
  const { reinos = [], eventos = [] } = useGameData();
  const { t, content, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [timezone, setTimezone] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [remoteDetail, setRemoteDetail] = useState(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id=window.setInterval(()=>setNow(new Date()),30000); return()=>window.clearInterval(id); }, []);

  const sorted = useMemo(() => [...reinos].sort((a,b) => Number(b.id||0)-Number(a.id||0)), [reinos]);
  const timezones = useMemo(() => [...new Set(sorted.map(realm => realm.fuso).filter(Boolean))].sort((a,b) => timezoneOrder(a)-timezoneOrder(b)), [sorted]);
  const timezoneCounts = useMemo(() => Object.fromEntries(timezones.map(zone => [zone, sorted.filter(realm=>realm.fuso===zone).length])), [sorted,timezones]);
  const filtered = useMemo(() => {
    const q=query.trim().toLowerCase();
    return sorted.filter(realm => {
      if (timezone !== 'all' && realm.fuso !== timezone) return false;
      if (!q) return true;
      return `${realm.id} ${content(realm,'nome')} ${realm.fuso||''}`.toLowerCase().includes(q);
    });
  }, [sorted, query, timezone, content]);

  const selectedBase = sorted.find(r => String(r.id)===String(selectedId)) || null;
  useEffect(() => {
    let cancelled=false;
    setRemoteDetail(null);
    if (!selectedBase?.slug) return undefined;
    fetch(`${API}/api/reinos/${encodeURIComponent(selectedBase.slug)}`, { cache:'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (!cancelled && data) setRemoteDetail(data); })
      .catch(() => {});
    return () => { cancelled=true; };
  }, [selectedBase?.slug]);
  const selected = remoteDetail && String(remoteDetail.id) === String(selectedId) ? remoteDetail : selectedBase;

  if (selected) {
    const age=formatRealmAge(selected.aberturaEm, locale, now);
    const activeEvents=eventos.filter(evento => {
      const occurrence=occurrenceForRealm(evento, selected.nome);
      return occurrence && eventStatus(occurrence)==='ativo';
    });
    const localizedHistory=content(selected,'historico',selected.historico)||selected.historico||{};
    const hasHistory=Boolean(localizedHistory?.status || localizedHistory?.observacoes);
    const merges=Array.isArray(selected.fusoes)?selected.fusoes:[];
    const missing=t('realms.not_informed');
    const schedule=selected.horarios || {};
    const specialHelp = selected.tipoEspecial === 'hardcore'
      ? t('realms.hardcore_help')
      : selected.tipoEspecial === 'idade_dragao' ? t('realms.dragon_age_help') : '';

    return <div className="max-w-md mx-auto pb-6">
      <button type="button" className="realm-back-button" onClick={()=>setSelectedId(null)}>‹ {t('common.back')}</button>
      <div className="tw-card realm-detail-card">
        <GameHeader title={content(selected,'nome')} />
        <div className="realm-detail-heading">
          <span>{realmIcon(selected)}</span>
          <div><strong>{content(selected,'nome')}</strong><small>#{selected.id} · {selected.fuso || missing}</small><RealmTypeBadge realm={selected} t={t} /></div>
        </div>
        {specialHelp && <div className="realm-special-note"><span>{realmIcon(selected)}</span><p>{specialHelp}</p></div>}
        <div className="realm-schedule-note">⏱️ {t('realms.schedule_server_note')}</div>
        <div className="realm-detail-grid">
          <RealmFact label={t('realms.opened_on')} value={selected.aberturaEm ? dateLong(selected.aberturaEm,locale) : missing} muted={!selected.aberturaEm} />
          <RealmFact label={t('realms.age')} value={age || missing} muted={!age} />
          <RealmFact label={t('realms.timezone')} value={selected.fuso || missing} muted={!selected.fuso} />
          <RealmFact label={t('realms.tournaments_end')} value={schedule.torneiosFim || missing} muted={!schedule.torneiosFim} />
          <RealmFact label={t('realms.zyrvorthian')} value={schedule.zyrvorthian || missing} muted={!schedule.zyrvorthian} />
          <RealmFact label={t('realms.dragon_battle')} value={schedule.batalhaDragao || missing} muted={!schedule.batalhaDragao} />
        </div>
        <section className="realm-detail-section"><h3>{t('realms.active_events')}</h3>{activeEvents.length ? <div className="realm-active-events">{activeEvents.map(evento=><div key={evento.slug}><span>⚡</span><strong>{content(evento,'nome')}</strong></div>)}</div> : <p>{t('realms.no_active_events')}</p>}</section>
        <section className="realm-detail-section"><h3>{t('realms.history')}</h3>{hasHistory ? <div className="realm-history-copy">{localizedHistory?.status && <strong>{localizedHistory.status}</strong>}{localizedHistory?.observacoes && <p>{localizedHistory.observacoes}</p>}</div> : <p>{t('realms.no_history')}</p>}</section>
        {merges.length ? <section className="realm-detail-section"><h3>{t('realms.mergers')}</h3><div className="realm-merge-list">{merges.map((merge,index)=><div key={merge._id||index}><strong>{t('realms.merger_result',{id:merge.reinoResultanteId})}</strong><small>{merge.dataFusao ? dateLong(merge.dataFusao,locale) : t('realms.not_informed')}</small>{merge.observacoes && <p>{merge.observacoes}</p>}</div>)}</div></section> : null}
        <div className="realm-merge-note">⛓️ <span>{t('realms.merge_ready')}</span></div>
      </div>
    </div>;
  }

  return <div className="max-w-md mx-auto pb-6">
    <div className="tw-card mb-3">
      <GameHeader title={t('realms.title')} />
      <div className="realms-intro">
        <div className="realms-count"><strong>{sorted.length}</strong><span>{t('realms.open_count',{count:sorted.length})}</span></div>
        <p>{t('realms.intro')}</p>
        <div className="realm-info-stack">
          <details className="realm-info-panel" open>
            <summary>{t('realms.how_title')}</summary>
            <p>{t('realms.how_body')}</p>
          </details>
          <details className="realm-info-panel">
            <summary>{t('realms.power_title')}</summary>
            <div className="realm-info-copy"><p>{t('realms.power_body')}</p><ul><li>{t('realms.power_top_1_3')}</li><li>{t('realms.power_top_4_10')}</li><li>{t('realms.power_rest')}</li><li>{t('realms.power_bottom_3')}</li></ul><p>{t('realms.power_dragon_age')}</p></div>
          </details>
          <details className="realm-info-panel">
            <summary>{t('realms.language_title')}</summary>
            <div className="realm-language-grid">
              <div><strong>UTC-7</strong><span>{t('realms.language_utc_7')}</span></div>
              <div><strong>UTC+0</strong><span>{t('realms.language_utc_0')}</span></div>
              <div><strong>UTC-3</strong><span>{t('realms.language_utc_3')}</span></div>
              <div><strong>UTC-4</strong><span>{t('realms.language_utc_4')}</span></div>
            </div>
            <small className="realm-community-note">{t('realms.language_note')}</small>
          </details>
        </div>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('realms.search')} aria-label={t('realms.search')} />
        <div className="realm-filter-block">
          <span>{t('realms.filter_timezone')}</span>
          <div className="realm-filter-chips" role="group" aria-label={t('realms.filter_timezone')}>
            <button type="button" className={`is-all${timezone==='all'?' active':''}`} onClick={()=>setTimezone('all')}><strong>{t('realms.filter_all')}</strong><small>{t('realms.timezone_realm_count',{count:sorted.length})}</small></button>
            {timezones.map(zone=><button type="button" key={zone} className={timezone===zone?'active':''} onClick={()=>setTimezone(zone)}><strong>{zone}</strong><small>{t('realms.timezone_realm_count',{count:timezoneCounts[zone]})}</small><em>{timezoneCurrentTime(zone,now,locale)}</em></button>)}
          </div>
        </div>
      </div>
    </div>
    <div className="realms-result-meta">{t('realms.showing_count',{shown:filtered.length,total:sorted.length})}</div>
    <div className="realms-public-list">
      {filtered.map(realm => {
        const age=formatRealmAge(realm.aberturaEm, locale, now);
        return <button type="button" key={realm.id} className={`realm-public-card${realm.tipoEspecial?` is-${realm.tipoEspecial}`:''}`} onClick={()=>setSelectedId(realm.id)}>
          <span className="realm-public-icon">{realmIcon(realm)}</span>
          <div>
            <div className="realm-public-title"><strong>{content(realm,'nome')}</strong><RealmTypeBadge realm={realm} t={t} /></div>
            <small>#{realm.id} · {realm.fuso || t('realms.not_informed')}</small>
            {age && <p>{age}</p>}
          </div><b>›</b>
        </button>;
      })}
      {!filtered.length && <div className="tw-card realm-empty-list">{t('realms.no_results')}</div>}
    </div>
  </div>;
}

export { realmIcon, timezoneOrder };
export { formatRealmAge as realmAge };
