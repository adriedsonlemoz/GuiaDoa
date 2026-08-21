import React from 'react';
import { C } from '../../theme.js';
import Field from './ProfileField.jsx';
import ReinoSelector from './ReinoSelector.jsx';
import RealmClock from '../reinos/RealmClock.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

export default function ProfileDetailsStep({
  editing, nome, setNome, reino, onReino, fuso, onSave, onBack, onCancel,
}) {
  const { t } = useI18n();
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:C.BG_MAIN }}>
      <header style={{
        background:'linear-gradient(155deg,#293F41 0%,#486467 100%)',
        padding:'28px 18px 24px', borderBottom:`2px solid ${C.BORDER_STRONG}`,
      }}>
        <div style={{ maxWidth:480, margin:'0 auto', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            width:56, height:56, borderRadius:15, display:'grid', placeItems:'center', flexShrink:0,
            background:'rgba(248,242,224,.06)', border:'1.5px solid rgba(200,168,74,.5)', fontSize:27,
          }}>🎖️</div>
          <div>
            <div className="font-nunito" style={{ color:C.ACCENT, fontWeight:900, fontSize:'.72rem', letterSpacing:2 }}>{t('profile.eyebrow')}</div>
            <h1 className="font-cinzel" style={{ color:C.TEXT_HEADER, fontSize:'1.02rem', margin:'4px 0 4px' }}>{t('profile.title')}</h1>
            <p className="font-nunito" style={{ color:'rgba(248,242,224,.66)', fontSize:'.76rem', lineHeight:1.4, margin:0 }}>{t('profile.subtitle')}</p>
          </div>
        </div>
      </header>

      <main style={{ flex:1, width:'100%', maxWidth:480, margin:'0 auto', padding:'16px 14px 32px' }}>
        <section style={{
          padding:'10px 12px', borderRadius:10, marginBottom:12, display:'flex', gap:9, alignItems:'flex-start',
          background:'rgba(200,168,74,.07)', border:'1px solid rgba(200,168,74,.3)',
        }}>
          <span aria-hidden="true">ℹ️</span>
          <div>
            <strong className="font-nunito" style={{ color:C.TEXT_SECONDARY, fontSize:'.76rem' }}>{t('profile.unofficial.title')}</strong>
            <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.74rem', lineHeight:1.45, margin:'2px 0 0' }}>{t('profile.unofficial.text')}</p>
          </div>
        </section>

        <section style={{
          background:C.BG_CARD, border:`1.5px solid ${C.BORDER}`, borderRadius:14,
          boxShadow:'0 5px 18px rgba(62,47,28,.09)', overflow:'visible',
        }}>
          <div style={{ padding:'11px 16px', background:C.BG_CARD_TOP, borderBottom:`1px solid ${C.BORDER_SOFT}`, borderRadius:'14px 14px 0 0' }}>
            <span className="font-cinzel" style={{ color:C.TEXT_PRIMARY, fontWeight:700, fontSize:'.80rem', letterSpacing:1.6 }}>{t('profile.identity')}</span>
          </div>
          <div style={{ padding:'16px 16px 18px' }}>
            <Field label={t('profile.commander_name')}>
              <input className="tw-input" autoComplete="nickname" maxLength={40} placeholder={t('profile.commander_placeholder')} value={nome} onChange={e => setNome(e.target.value)} />
            </Field>

            <div style={{ display:'flex', alignItems:'center', gap:8, margin:'17px 0 14px' }}>
              <div style={{ flex:1, height:1, background:C.BORDER_SOFT }} />
              <span className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.74rem', fontWeight:900, letterSpacing:1.6, textTransform:'uppercase' }}>{t('profile.realm_section')}</span>
              <div style={{ flex:1, height:1, background:C.BORDER_SOFT }} />
            </div>

            <Field label={t('profile.realm')}>
              <ReinoSelector value={reino} onChange={onReino} />
            </Field>

            {fuso && <RealmClock realm={reino} fuso={fuso} compact />}

            <p className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.74rem', lineHeight:1.45, margin:'13px 0 0' }}>🔒 {t('profile.privacy')}</p>
          </div>
        </section>

        <div style={{ display:'grid', gap:8, marginTop:12 }}>
          <button className="btn-navy btn-lg" type="button" onClick={onSave}>{editing ? t('profile.save') : t('profile.continue')}</button>
          <div style={{ display:'flex', gap:8 }}>
            {!editing && <button className="btn-ghost" style={{ flex:1 }} type="button" onClick={onBack}>← {t('common.back')}</button>}
            {editing && onCancel && <button className="btn-ghost" style={{ flex:1 }} type="button" onClick={onCancel}>{t('common.back')}</button>}
          </div>
        </div>
      </main>
    </div>
  );
}
