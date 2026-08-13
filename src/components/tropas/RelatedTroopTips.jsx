import React, { useEffect, useState } from 'react';
import { API_URL } from '../../config/api.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { GameSectionTitle } from '../shared/GameChrome.jsx';

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

  return (
    <section className="game-panel" style={{ marginTop:10 }}>
      <GameSectionTitle>📚 {t('troops.related_tips')}</GameSectionTitle>
      <div>
        {tips.map(tip => (
          <button key={tip._id || tip.slug} onClick={() => open(tip)} className="game-list-row" style={{ padding:'9px 11px' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="game-list-name" style={{ fontSize:'.76rem' }}>{content(tip,'titulo')}</div>
              <div className="game-list-meta">{t('troops.open_tip')} →</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
