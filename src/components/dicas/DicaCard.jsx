import React from 'react';
import { C } from '../../theme.js';
import { fmtData } from './dicasUtils.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const typeIcon = { guia: '🧭', tutorial: '📘', dica: '💡' };

const DicaCard = ({ dica, catInfo, onClick }) => {
  const { t, content, locale } = useI18n();
  const titulo = content(dica, 'titulo');
  const resumo = content(dica, 'resumo') || content(dica, 'conteudo');
  const categoria = catInfo ? content(catInfo, 'label') : '';
  const featured = Boolean(dica.destaque);

  return (
    <article onClick={onClick}
      style={{
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        background: featured ? `linear-gradient(145deg, ${C.BG_HEADER}, #294f7a)` : C.BG_CARD,
        border: `1px solid ${featured ? 'rgba(200,168,74,.5)' : C.BORDER_SOFT}`,
        borderRadius: 16,
        boxShadow: featured ? '0 10px 26px rgba(28,58,94,.17)' : '0 4px 14px rgba(62,47,28,.07)',
        transition: 'transform .16s ease, box-shadow .16s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
    >
      {dica.imagens?.[0]?.url && (
        <div style={{ height: featured ? 178 : 145, overflow: 'hidden', background: C.BG_SECONDARY }}>
          <img src={dica.imagens[0].url} alt={titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
        </div>
      )}

      <div style={{ padding: featured ? '15px 16px 16px' : '13px 14px 14px' }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontSize: '.62rem', fontWeight: 900, letterSpacing: '.06em', textTransform: 'uppercase', color: featured ? '#e7c96e' : C.ACCENT }}>
            {typeIcon[dica.tipo] || '💡'} {t(`tips.type_${dica.tipo || 'dica'}`)}
          </span>
          {catInfo && <span style={{ fontSize: '.62rem', color: featured ? 'rgba(255,255,255,.64)' : C.TEXT_MUTED }}>{catInfo.icon} {categoria}</span>}
          {dica.destaque && <span style={{ marginLeft: 'auto', fontSize: '.6rem', fontWeight: 900, color: featured ? '#e7c96e' : C.ACCENT }}>⭐ {t('tips.featured')}</span>}
        </div>

        <h2 className="font-cinzel" style={{ fontSize: featured ? '1.03rem' : '.92rem', color: featured ? '#fff8e8' : C.TEXT_PRIMARY, margin: 0, lineHeight: 1.38 }}>
          {titulo}
        </h2>

        {resumo && (
          <p className="font-nunito" style={{ fontSize: '.76rem', color: featured ? 'rgba(255,255,255,.76)' : C.TEXT_SECONDARY, margin: '7px 0 0', lineHeight: 1.58, display: '-webkit-box', WebkitLineClamp: featured ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {resumo}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: '.64rem', color: featured ? 'rgba(255,255,255,.58)' : C.TEXT_FAINT }}>
          {dica.leituraMin > 0 && <span>⏱️ {t('tips.minutes', { count: dica.leituraMin })}</span>}
          {dica.criadoEm && <span>• {fmtData(dica.atualizadoEm || dica.criadoEm, locale)}</span>}
          <span style={{ marginLeft: 'auto', color: featured ? '#e7c96e' : C.ACCENT, fontWeight: 900 }}>{t('tips.read')} →</span>
        </div>
      </div>
    </article>
  );
};

export default DicaCard;
