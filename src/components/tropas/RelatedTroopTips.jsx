import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/api.js';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';

export default function RelatedTroopTips({ troopName, onOpenTips }) {
  const { t, content } = useI18n();
  const [tips, setTips] = useState([]);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/api/dicas?tropa=${encodeURIComponent(troopName)}`, { cache:'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (active) setTips(Array.isArray(data) ? data.slice(0,3) : []); })
      .catch(() => {});
    return () => { active = false; };
  }, [troopName]);

  if (!tips.length) return null;
  const open = tip => {
    sessionStorage.setItem('guiadoa_open_tip', tip.slug || tip._id);
    onOpenTips?.();
  };

  return <section style={{ border:`1px solid ${C.BORDER_SOFT}`, background:C.BG_CARD, borderRadius:10, padding:'10px 11px', marginTop:8 }}>
    <div className="font-nunito font-black" style={{ fontSize:'.62rem', color:C.TEXT_MUTED, letterSpacing:'1px', textTransform:'uppercase' }}>📚 {t('troops.related_tips')}</div>
    <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:7 }}>
      {tips.map(tip => <button key={tip._id || tip.slug} onClick={() => open(tip)} style={{ border:`1px solid ${C.BORDER_SOFT}`, background:'rgba(200,168,74,.05)', borderRadius:8, padding:'7px 8px', textAlign:'left', cursor:'pointer' }}>
        <div className="font-nunito font-bold" style={{ fontSize:'.65rem', color:C.TEXT_PRIMARY }}>{content(tip,'titulo')}</div>
        <div className="font-nunito" style={{ fontSize:'.54rem', color:'#7a5a1f', marginTop:2 }}>{t('troops.open_tip')} →</div>
      </button>)}
    </div>
  </section>;
}
