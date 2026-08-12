import React from 'react';
import { C } from '../../theme.js';
import { fmtData } from './dicasUtils.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const DicaCard = ({ dica, catInfo, onClick }) => {
  const { t, content, locale } = useI18n();
  const titulo = content(dica, 'titulo');
  const conteudo = content(dica, 'conteudo');
  const categoria = catInfo ? content(catInfo, 'label') : '';
  return (
  <div onClick={onClick}
    style={{
      background: C.BG_CARD,
      border: `1.5px solid ${C.BORDER_SOFT}`,
      borderRadius: 13, overflow: 'hidden',
      cursor: 'pointer', transition: 'all 0.14s',
      boxShadow: dica.destaque ? `0 0 0 2px ${C.ACCENT}` : 'none',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = C.ACCENT; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(62,47,28,0.12)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.BORDER_SOFT; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = dica.destaque ? `0 0 0 2px ${C.ACCENT}` : 'none'; }}
  >
    {/* Capa */}
    {dica.imagens?.length > 0 && (
      <div style={{ position: 'relative', height: 170, overflow: 'hidden', background: C.BG_SECONDARY }}>
        <img src={dica.imagens[0].url} alt={titulo}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        {dica.imagens.length > 1 && (
          <span style={{
            position: 'absolute', bottom: 7, right: 7,
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            fontSize: '0.64rem', padding: '2px 8px', borderRadius: 100,
          }}>
            📷 {dica.imagens.length}
          </span>
        )}
        {dica.destaque && (
          <span style={{
            position: 'absolute', top: 7, left: 7,
            background: C.ACCENT, color: C.BG_HEADER,
            fontSize: '0.6rem', fontWeight: 700, padding: '2px 9px',
            borderRadius: 100, letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>{`⭐ ${t('tips.featured')}`}</span>
        )}
      </div>
    )}

    {/* Conteúdo */}
    <div style={{ padding: '12px 14px' }}>
      {/* Categoria + data — estilo byline de notícia */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {catInfo && (
          <span style={{
            fontSize: '0.62rem', fontWeight: 700, color: C.ACCENT,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {catInfo.icon} {categoria}
          </span>
        )}
        {dica.criadoEm && (
          <>
            <span style={{ color: C.TEXT_FAINT, fontSize: '0.6rem' }}>•</span>
            <span style={{ fontSize: '0.62rem', color: C.TEXT_FAINT }}>{fmtData(dica.criadoEm, locale)}</span>
          </>
        )}
        {dica.destaque && !dica.imagens?.length && (
          <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, color: C.ACCENT }}>⭐</span>
        )}
      </div>

      <p className="font-cinzel font-bold"
        style={{ fontSize: '0.92rem', color: C.TEXT_PRIMARY, margin: 0, lineHeight: 1.35 }}>
        {titulo}
      </p>

      {conteudo && (
        <p className="font-nunito"
          style={{
            fontSize: '0.76rem', color: C.TEXT_SECONDARY, margin: '6px 0 0',
            lineHeight: 1.55, display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
          {conteudo}
        </p>
      )}

      <p style={{ fontSize: '0.68rem', color: C.ACCENT, fontWeight: 700, margin: '8px 0 0' }}>
        {t('tips.read')} →
      </p>
    </div>
  </div>
  );
};

export default DicaCard;
