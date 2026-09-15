import React from 'react';
import { rankingLabel } from './eventUtils.js';

function openRewardReference(item, setRoute) {
  const type = item?.tipoReferencia;
  const target = String(item?.referenciaSlug || '').trim();
  if (!type || !target || typeof setRoute !== 'function') return;
  try {
    if (type === 'tropa') {
      sessionStorage.setItem('guiadoa_open_troop', target);
      setRoute('tropas');
      return;
    }
    if (type === 'item') {
      sessionStorage.setItem('guiadoa_open_item', target);
      setRoute('itens');
      return;
    }
  } catch { /* navegação ainda funciona para rotas diretas */ }
  if (type === 'dragao') return setRoute(`dragao_${target}`);
  if (type === 'pesquisa') return setRoute(`pesquisa_${target}`);
  if (type === 'edificio') {
    const normalized = target.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (normalized.includes('gruta')) return setRoute('edificios_gruta');
    if (normalized.includes('basilica')) return setRoute('edificios_basilica');
    try { sessionStorage.setItem('guiadoa_open_building', target); } catch {}
    return setRoute('edificios_normais');
  }
}

function RewardItem({ item, content, setRoute }) {
  const linked = Boolean(item?.tipoReferencia && item?.referenciaSlug && setRoute);
  const label = <><span>{content(item, 'nome')}</span><b>×{item.quantidade ?? 1}</b>{linked ? <em>›</em> : null}</>;
  return linked
    ? <button type="button" className="event-reward-item is-linked" onClick={() => openRewardReference(item, setRoute)}>{label}</button>
    : <span className="event-reward-item">{label}</span>;
}

export default function EventRewards({ groups, t, content, setRoute }) {
  if (!groups?.length) return <p className="event-empty-note">{t('events.rewards_pending')}</p>;
  const sorted = [...groups].sort((a,b) => Number(a.ordem || 0) - Number(b.ordem || 0));
  return <div className="event-reward-groups">{sorted.map((group, idx) => {
    const title = group.tipo === 'ranking'
      ? `${t('events.ranking')} ${rankingLabel(group)}`
      : group.requisito != null ? `${t('events.require')} ${Number(group.requisito).toLocaleString()}` : t('events.rewards');
    return <div className="event-reward-group" key={group.id || `${group.tipo}-${group.requisito}-${group.classificacao}-${idx}`}>
      <strong>{title}</strong>
      <div>{(group.itens || []).map((item, itemIdx) => <RewardItem item={item} content={content} setRoute={setRoute} key={item.id || `${item.nome}-${itemIdx}`} />)}</div>
    </div>;
  })}</div>;
}
