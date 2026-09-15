import React, { useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import ColorTextBuilder from './colorbuilder/index.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

export default function Extras({ setRoute }) {
  const { t } = useI18n();
  const [colorBuilder, setColorBuilder] = useState(false);
  const cards = [
    { icon:'🌍', title:t('realms.title'), sub:t('extras.realms_sub'), action:()=>setRoute('reinos') },
    { icon:'💎', title:t('donation.title'), sub:t('donation.extras_sub'), action:()=>setRoute('doacao') },
    { icon:'ℹ️', title:t('home.botao.sobre'), sub:t('home.botao.sobre.sub'), action:()=>setRoute('sobre') },
    { icon:'🎨', title:t('home.botao.texto_colorido'), sub:t('home.botao.texto_colorido.sub'), action:()=>setColorBuilder(true) },
    { icon:'💾', title:t('backup.nav'), sub:t('extras.backup_sub'), action:()=>setRoute('backup') },
  ];
  return <div className="max-w-md mx-auto pb-6">
    <div className="tw-card mb-3"><GameHeader title={t('extras.title')} /><div className="extras-intro">{t('extras.intro')}</div></div>
    <div className="extras-grid">{cards.map(card => <button key={card.title} className="extras-card" onClick={card.action}><span>{card.icon}</span><div><strong>{card.title}</strong><small>{card.sub}</small></div><b>›</b></button>)}</div>
    {colorBuilder && <ColorTextBuilder onClose={()=>setColorBuilder(false)} />}
  </div>;
}
