import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { C } from '../../theme.js';
import { fmtData } from './dicasUtils.js';
import ImagemLightbox from './ImagemLightbox.jsx';
import GuideContentRenderer from './GuideContentRenderer.jsx';
import DicaGameContext from './DicaGameContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useGameData } from '../../data/GameDataContext.jsx';
import { buildDicaGameVariables } from './dicaGameUtils.js';

const typeIcon = { guia: '🧭', tutorial: '📘', dica: '💡' };

const DicaArtigo = ({ dica, catInfo, onClose, setRoute }) => {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const { t, content, locale } = useI18n();
  const { edificios } = useGameData();
  const gameVariables = buildDicaGameVariables(edificios, locale);
  const titulo = content(dica, 'titulo');
  const resumo = content(dica, 'resumo');
  const conteudo = content(dica, 'conteudo');
  const categoria = catInfo ? content(catInfo, 'label') : '';

  const navegar = route => {
    onClose?.();
    setRoute?.(route);
  };

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const article = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: C.BG_MAIN,
        overflowY: 'auto', overscrollBehavior: 'contain',
      }}
    >
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(242,234,218,.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.BORDER}`, boxShadow: '0 3px 12px rgba(62,47,28,.08)' }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.BORDER_SOFT}, ${C.ACCENT}, ${C.BORDER_STRONG}, ${C.ACCENT}, ${C.BORDER_SOFT}, transparent)` }} />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onClose}
            aria-label={t('common.back')}
            style={{
              background: C.BG_INPUT,
              border: `1px solid ${C.BORDER_SOFT}`,
              borderRadius: 9,
              color: C.ACCENT_DEEP,
              width: 34, height: 34, cursor: 'pointer', fontSize: '1rem',
              boxShadow: '0 2px 6px rgba(62,47,28,.06)',
            }}
          >←</button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="font-nunito" style={{ fontSize: '.57rem', color: C.TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 900 }}>{t('tips.reading')}</div>
            <div className="font-cinzel" style={{ fontSize: '.71rem', color: C.TEXT_PRIMARY, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{titulo}</div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 640, width: '100%', margin: '0 auto', paddingBottom: 34 }}>
        {dica.imagens?.length > 0 && (
          <div style={{ position: 'relative', height: 245, overflow: 'hidden', cursor: 'zoom-in', background: C.BG_SECONDARY }} onClick={() => setLightboxIdx(0)}>
            <img src={dica.imagens[0].url} alt={titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(62,47,28,.68), transparent 62%)' }} />
          </div>
        )}

        <header style={{ padding: '20px 16px 15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.63rem', fontWeight: 900, color: C.ACCENT_DEEP, textTransform: 'uppercase', letterSpacing: '.06em' }}>{typeIcon[dica.tipo] || '💡'} {t(`tips.type_${dica.tipo || 'dica'}`)}</span>
            {catInfo && <span style={{ fontSize: '.63rem', color: C.TEXT_MUTED }}>• {catInfo.icon} {categoria}</span>}
            {dica.destaque && <span style={{ fontSize: '.62rem', color: C.ACCENT_DEEP, fontWeight: 900 }}>⭐ {t('tips.featured')}</span>}
          </div>
          <h1 className="font-cinzel" style={{ margin: '8px 0 0', color: C.TEXT_PRIMARY, fontSize: '1.28rem', lineHeight: 1.32 }}>{titulo}</h1>
          {resumo && <p className="font-nunito" style={{ margin: '9px 0 0', fontSize: '.84rem', lineHeight: 1.62, color: C.TEXT_SECONDARY }}>{resumo}</p>}
          <div className="font-nunito" style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 11, fontSize: '.64rem', color: C.TEXT_FAINT }}>
            {dica.leituraMin > 0 && <span>⏱️ {t('tips.minutes', { count: dica.leituraMin })}</span>}
            {dica.atualizadoEm && <span>• {t('tips.updated')} {fmtData(dica.atualizadoEm, locale)}</span>}
          </div>
        </header>

        <div style={{ padding: '0 12px' }}>
          <GuideContentRenderer content={conteudo} variables={gameVariables} />
          <DicaGameContext dica={dica} setRoute={navegar} />
        </div>
      </main>

      {lightboxIdx !== null && dica.imagens?.length > 0 && (
        <ImagemLightbox imagens={dica.imagens} indiceInicial={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(article, document.body) : article;
};

export default DicaArtigo;
