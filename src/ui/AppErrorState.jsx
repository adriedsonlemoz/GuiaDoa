import React, { useState } from 'react';
import { C } from '../theme.js';
import { copyDiagnostic } from '../errors/appErrors.js';

export default function AppErrorState({
  title = 'Não foi possível concluir esta ação',
  message = 'Ocorreu uma falha inesperada. Tente novamente.',
  code = 'GD-UNK-001',
  diagnostic = '',
  onRetry,
  onHome,
  compact = false,
}) {
  const [copiado, setCopiado] = useState(false);

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
      <h2 className="font-cinzel" style={{ color:C.TEXT_PRIMARY, fontSize:'1rem', margin:'0 0 7px', lineHeight:1.35 }}>{title}</h2>
      <p className="font-nunito" style={{ color:C.TEXT_SECONDARY, fontSize:'.8rem', lineHeight:1.55, margin:'0 auto 12px' }}>{message}</p>
      <div className="font-nunito" style={{
        display:'inline-flex', alignItems:'center', gap:6, padding:'5px 9px', borderRadius:7,
        background:'rgba(28,58,94,.06)', border:'1px solid rgba(28,58,94,.16)',
        color:C.TEXT_MUTED, fontSize:'.65rem', fontWeight:800, letterSpacing:'.5px',
      }}>
        Código de suporte: <strong style={{ color:C.BLUE_DARK }}>{code}</strong>
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginTop:15 }}>
        {onRetry && <button className="btn-gold" onClick={onRetry}>Tentar novamente</button>}
        {onHome && <button className="btn-navy" onClick={onHome}>Voltar ao início</button>}
        <button className="btn-ghost" onClick={copiar}>{copiado ? '✓ Diagnóstico copiado' : 'Copiar diagnóstico'}</button>
      </div>
    </div>
  );
}
