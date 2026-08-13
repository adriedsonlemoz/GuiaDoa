import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { C } from '../../theme.js';
import { getIcone, getTipoAtaque, fmtFull, ATRIBUTOS } from './tropaUtils.js';
import RelatedTroopTips from './RelatedTroopTips.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

function AttributeRow({ icon, label, value, locale }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'8px 0', borderBottom:`1px solid ${C.BORDER_SOFT}` }}>
      <span className="font-nunito font-bold" style={{ color:C.TEXT_MUTED, fontSize:'.68rem' }}>{icon} {label}</span>
      <strong className="font-nunito" style={{ color:C.TEXT_PRIMARY, fontSize:'.72rem' }}>{value ? fmtFull(value, locale) : '—'}</strong>
    </div>
  );
}

export default function TropaModal({ tropa, onFechar, onOpenTips }) {
  const { t, content, locale } = useI18n();

  useEffect(() => {
    const handler = event => { if (event.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', handler);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = previous;
    };
  }, [onFechar]);

  if (!tropa) return null;

  const type = getTipoAtaque(tropa, t);
  const name = content(tropa, 'nome');
  const description = content(tropa, 'desc');
  const unlock = tropa.desbloqueio || {};
  const unlockSource = content({ desbloqueioFonte:unlock.fonte, i18n:tropa.i18n }, 'desbloqueioFonte') || unlock.fonte;
  const unlockNote = content({ desbloqueioObservacao:unlock.observacao, i18n:tropa.i18n }, 'desbloqueioObservacao') || unlock.observacao;

  return createPortal(
    <div onClick={onFechar} style={{ position:'fixed', inset:0, zIndex:1300, background:'rgba(25,18,10,.58)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <article onClick={event => event.stopPropagation()} style={{ width:'100%', maxWidth:520, maxHeight:'91dvh', display:'flex', flexDirection:'column', overflow:'hidden', background:C.BG_MAIN, borderRadius:'18px 18px 0 0', boxShadow:'0 -12px 34px rgba(32,22,12,.28)', border:`1px solid ${C.BORDER}` }}>
        <div style={{ width:38, height:4, borderRadius:999, background:'rgba(62,47,28,.2)', margin:'8px auto 5px', flexShrink:0 }} />

        <header style={{ display:'flex', gap:12, alignItems:'center', padding:'8px 14px 12px', borderBottom:`1px solid ${C.BORDER_SOFT}`, background:'linear-gradient(180deg,rgba(242,234,218,.98),rgba(232,224,204,.98))' }}>
          <div style={{ width:70, height:70, borderRadius:10, overflow:'hidden', flex:'0 0 70px', display:'grid', placeItems:'center', background:'rgba(200,168,74,.12)', border:`1px solid ${C.BORDER_SOFT}` }}>
            {tropa.imagem ? <img src={tropa.imagem} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:'2.3rem' }}>{getIcone(tropa.nome)}</span>}
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <h2 className="font-cinzel" style={{ margin:0, color:C.TEXT_PRIMARY, fontSize:'.98rem', lineHeight:1.25 }}>{name}</h2>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:6 }}>
              <span className="font-nunito font-bold" style={{ fontSize:'.57rem', color:type.color, border:`1px solid ${type.color}30`, background:`${type.color}0d`, borderRadius:999, padding:'2px 7px' }}>{type.label}</span>
              <span className="font-nunito font-bold" style={{ fontSize:'.57rem', color:'#765c22', border:'1px solid rgba(200,168,74,.3)', background:'rgba(200,168,74,.11)', borderRadius:999, padding:'2px 7px' }}>⭐ {tropa.poder || 0} {t('common.power').toLowerCase()}</span>
              {tropa.tipo === 'especial' && <span className="font-nunito font-bold" style={{ fontSize:'.57rem', color:C.TEXT_MUTED, border:`1px solid ${C.BORDER_SOFT}`, borderRadius:999, padding:'2px 7px' }}>✨ {t('troops.special')}</span>}
            </div>
          </div>
          <button onClick={onFechar} aria-label={t('common.close')} style={{ width:34, height:34, borderRadius:9, border:`1px solid ${C.BORDER_SOFT}`, background:C.BG_CARD, color:C.TEXT_MUTED, cursor:'pointer', fontSize:'1rem' }}>✕</button>
        </header>

        <div style={{ overflowY:'auto', padding:'12px 14px 28px' }}>
          {description && <p className="font-nunito" style={{ margin:'0 0 14px', color:C.TEXT_SECONDARY, fontSize:'.76rem', lineHeight:1.55 }}>{description}</p>}

          <section style={{ background:C.BG_CARD, border:`1px solid ${C.BORDER_SOFT}`, borderRadius:11, padding:'4px 11px 2px' }}>
            <div className="font-cinzel" style={{ padding:'8px 0 5px', color:'#735a24', fontSize:'.7rem' }}>⚔️ {t('troops.attributes')}</div>
            {ATRIBUTOS.filter(attr => attr.id !== 'efi').map(attr => (
              <AttributeRow key={attr.id} icon={attr.icon} label={attr.labelKey ? t(attr.labelKey) : attr.label} value={tropa[attr.id]} locale={locale} />
            ))}
          </section>

          <section style={{ marginTop:10, background:'rgba(200,168,74,.07)', border:'1px solid rgba(200,168,74,.28)', borderRadius:11, padding:'11px 12px' }}>
            <div className="font-cinzel" style={{ color:'#735a24', fontSize:'.7rem' }}>🔓 {t('troops.training_requirement')}</div>
            {unlockSource ? (
              <div style={{ marginTop:7 }}>
                <div className="font-nunito font-bold" style={{ color:C.TEXT_PRIMARY, fontSize:'.72rem' }}>{unlockSource}{unlock.nivel ? ` · ${t('common.level_short')} ${unlock.nivel}` : ''}</div>
                {unlockNote && <div className="font-nunito" style={{ marginTop:4, color:C.TEXT_MUTED, fontSize:'.65rem', lineHeight:1.45 }}>{unlockNote}</div>}
              </div>
            ) : (
              <div className="font-nunito" style={{ marginTop:6, color:C.TEXT_FAINT, fontSize:'.65rem' }}>{t('troops.training_requirement_unknown')}</div>
            )}
          </section>

          <RelatedTroopTips troopName={tropa.nome} onOpenTips={onOpenTips} />
        </div>
      </article>
    </div>,
    document.body,
  );
}
