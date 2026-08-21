import React from 'react';
import { fmtData } from './dicasUtils.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const typeIcon = { guia:'🧭', tutorial:'📘', dica:'💡' };

const DicaCard = ({ dica, catInfo, onClick }) => {
  const { t, content, locale } = useI18n();
  const titulo = content(dica,'titulo');
  const resumo = content(dica,'resumo') || content(dica,'conteudo');
  const categoria = catInfo ? content(catInfo,'label') : '';

  return (
    <article onClick={onClick} className="game-panel" style={{ cursor:'pointer' }}>
      {dica.destaque ? <div style={{ height:3, background:'linear-gradient(90deg,#806033,#d0b55e,#806033)' }} /> : null}
      {dica.imagens?.[0]?.url ? (
        <div style={{ height:150, overflow:'hidden', borderBottom:'1px solid rgba(117,91,51,.25)' }}>
          <img src={dica.imagens[0].url} alt={titulo} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      ) : null}
      <div style={{ padding:'11px 12px 12px' }}>
        <div className="game-list-meta">
          {typeIcon[dica.tipo] || '💡'} {t(`tips.type_${dica.tipo || 'dica'}`)}
          {categoria ? ` • ${catInfo?.icon || ''} ${categoria}` : ''}
          {dica.destaque ? ` • ⭐ ${t('tips.featured')}` : ''}
        </div>
        <h2 className="game-list-name" style={{ marginTop:5, fontSize:'.94rem' }}>{titulo}</h2>
        {resumo ? <p className="game-list-copy" style={{ fontSize:'.80rem' }}>{resumo}</p> : null}
        <div style={{ display:'flex', gap:7, marginTop:9, color:'#806d4d', fontSize:'.72rem', fontWeight:800 }}>
          {dica.leituraMin > 0 ? <span>⏱ {t('tips.minutes',{count:dica.leituraMin})}</span> : null}
          {dica.criadoEm ? <span>• {fmtData(dica.atualizadoEm || dica.criadoEm,locale)}</span> : null}
          <span style={{ marginLeft:'auto', color:'#725528' }}>{t('tips.read')} →</span>
        </div>
      </div>
    </article>
  );
};

export default DicaCard;
