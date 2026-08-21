import React, { useState } from 'react';
import { C } from '../theme.js';
import { copyDiagnostic } from '../errors/appErrors.js';
import { useI18n } from '../hooks/useI18n.jsx';

export default function AppErrorState({
  title,
  message,
  code = 'GD-UNK-001',
  diagnostic = '',
  onRetry,
  onHome,
  compact = false,
}) {
  const [copiado, setCopiado] = useState(false);
  const { t } = useI18n();
  const errorKey = ({
    'GD-NET-002':'errors.net_timeout',
    'GD-NET-001':'errors.net_offline',
    'GD-SRV-001':'errors.server',
    'GD-DATA-001':'errors.data',
    'GD-UI-001':'errors.ui',
    'GD-START-001':'errors.start',
  })[code];
  const shownTitle = errorKey ? t(`${errorKey}.title`) : title || t('errors.default_title');
  const shownMessage = errorKey ? t(`${errorKey}.message`) : message || t('errors.default_message');

  const copiar = async () => {
    try {
      await copyDiagnostic(diagnostic || `GUIA DOA\nCódigo: ${code}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div style={{ textAlign:'center', maxWidth:420, margin:'0 auto', padding:compact ? '10px 4px' : '18px 8px' }}>
      <div style={{
        width:64, height:64, borderRadius:'50%', margin:'0 auto 12px',
        display:'grid', placeItems:'center', fontSize:30,
        background:'rgba(168,60,44,.08)', border:`1.5px solid ${C.BORDER}`,
        boxShadow:'0 5px 18px rgba(62,47,28,.10)',
      }}>⚠️</div>
      <h2 className="font-cinzel" style={{ color:C.TEXT_PRIMARY, fontSize:'1rem', margin:'0 0 7px', lineHeight:1.35 }}>{shownTitle}</h2>
      <p className="font-nunito" style={{ color:C.TEXT_SECONDARY, fontSize:'.8rem', lineHeight:1.55, margin:'0 auto 12px' }}>{shownMessage}</p>
      <div className="font-nunito" style={{
        display:'inline-flex', alignItems:'center', gap:6, padding:'5px 9px', borderRadius:7,
        background:'rgba(49,72,74,.06)', border:'1px solid rgba(49,72,74,.16)',
        color:C.TEXT_MUTED, fontSize:'.74rem', fontWeight:800, letterSpacing:'.5px',
      }}>
        {t('errors.support_code')}: <strong style={{ color:C.BLUE_DARK }}>{code}</strong>
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginTop:15 }}>
        {onRetry && <button className="btn-gold" onClick={onRetry}>{t('errors.retry')}</button>}
        {onHome && <button className="btn-navy" onClick={onHome}>{t('errors.home')}</button>}
        <button className="btn-ghost" onClick={copiar}>{copiado ? `✓ ${t('errors.copied')}` : t('errors.copy')}</button>
      </div>
    </div>
  );
}
