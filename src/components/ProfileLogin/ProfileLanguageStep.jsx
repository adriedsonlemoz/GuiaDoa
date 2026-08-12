import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';

export default function ProfileLanguageStep({ locale, locales, onSelect }) {
  const { t } = useI18n();
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:C.BG_MAIN }}>
      <header style={{
        background:'linear-gradient(155deg,#172F4D 0%,#294E76 100%)',
        padding:'46px 20px 36px', textAlign:'center', borderBottom:`2px solid ${C.BORDER_STRONG}`,
      }}>
        <div style={{
          width:78, height:78, margin:'0 auto 15px', borderRadius:20, display:'grid', placeItems:'center',
          background:'rgba(248,242,224,.06)', border:'1.5px solid rgba(200,168,74,.55)',
          boxShadow:'0 12px 30px rgba(0,0,0,.22)', fontSize:36,
        }}>🛡️</div>
        <div className="font-nunito" style={{ color:C.ACCENT, fontSize:'.64rem', fontWeight:900, letterSpacing:2.5 }}>GUIA DOA</div>
        <h1 className="font-cinzel" style={{ color:C.TEXT_HEADER, fontSize:'1.16rem', margin:'7px 0 0' }}>{t('profile.welcome')}</h1>
      </header>

      <main style={{ flex:1, width:'100%', maxWidth:480, margin:'0 auto', padding:'28px 18px 36px' }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <h2 className="font-cinzel" style={{ color:C.TEXT_PRIMARY, fontSize:'.95rem', margin:'0 0 6px' }}>{t('profile.language.title')}</h2>
          <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.76rem', margin:0 }}>{t('profile.language.subtitle')}</p>
        </div>
        <div style={{ display:'grid', gap:10 }}>
          {locales.map(loc => (
            <button key={loc.code} type="button" onClick={() => onSelect(loc.code)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:14, padding:'15px 16px',
              background:C.BG_CARD, border:`1.5px solid ${locale === loc.code ? C.ACCENT : 'rgba(200,168,74,.28)'}`,
              borderRadius:13, textAlign:'left', cursor:'pointer', boxShadow:'0 3px 12px rgba(62,47,28,.06)',
            }}>
              <span style={{ fontSize:31, lineHeight:1 }}>{loc.flag}</span>
              <span style={{ flex:1 }}>
                <strong className="font-nunito" style={{ display:'block', color:C.TEXT_PRIMARY, fontSize:'.95rem' }}>{loc.nativo}</strong>
                <span className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.68rem' }}>{loc.label}</span>
              </span>
              <span style={{ color:C.ACCENT, fontSize:18 }}>›</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
