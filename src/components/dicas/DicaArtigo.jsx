import React, { useState } from 'react';
import { C } from '../../theme.js';
import { fmtData } from './dicasUtils.js';
import ImagemLightbox from './ImagemLightbox.jsx';

const DicaArtigo = ({ dica, catInfo, onClose }) => {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: C.BG_MAIN || C.BG_CARD,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Header sticky */}
      <div style={{
        background: `linear-gradient(135deg,${C.BG_HEADER},#2A4C72)`,
        padding: '11px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: `1px solid rgba(200,168,74,0.3)`,
      }}>
        <button onClick={onClose} style={{
          background: 'transparent', border: '1px solid rgba(200,168,74,0.3)',
          borderRadius: 7, color: 'rgba(200,168,74,0.7)', width: 30, height: 30,
          cursor: 'pointer', fontSize: '1rem', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <p className="font-cinzel font-bold" style={{
          fontSize: '0.76rem', color: 'rgba(200,168,74,0.9)',
          letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0, flex: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {catInfo ? `${catInfo.icon} ${catInfo.label}` : '💡 Dica'}
        </p>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${C.ACCENT},transparent)`, opacity: 0.5 }} />

      <div style={{ maxWidth: 560, width: '100%', margin: '0 auto', flex: 1 }}>

        {/* Imagem de capa — clicável para lightbox */}
        {dica.imagens?.length > 0 && (
          <div style={{ position: 'relative', background: C.BG_SECONDARY, cursor: 'zoom-in' }}
            onClick={() => setLightboxIdx(0)}>
            <img src={dica.imagens[0].url} alt={dica.titulo}
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <span style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              fontSize: '0.68rem', padding: '3px 10px', borderRadius: 100,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>🔍 Ver imagem{dica.imagens.length > 1 ? `s (${dica.imagens.length})` : ''}</span>
          </div>
        )}

        {/* Corpo do artigo */}
        <div style={{ padding: '20px 18px 8px' }}>
          {dica.destaque && (
            <span style={{
              fontSize: '0.64rem', fontWeight: 700, color: C.ACCENT,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              display: 'inline-block', marginBottom: 8,
              background: 'rgba(200,168,74,0.12)', padding: '2px 10px', borderRadius: 100,
            }}>⭐ Destaque</span>
          )}

          <h1 className="font-cinzel font-bold"
            style={{ fontSize: '1.25rem', color: C.TEXT_PRIMARY, margin: '0 0 8px', lineHeight: 1.3 }}>
            {dica.titulo}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            {catInfo && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.TEXT_SECONDARY }}>
                {catInfo.icon} {catInfo.label}
              </span>
            )}
            {dica.criadoEm && (
              <>
                <span style={{ color: C.TEXT_FAINT, fontSize: '0.65rem' }}>•</span>
                <span style={{ fontSize: '0.7rem', color: C.TEXT_FAINT }}>{fmtData(dica.criadoEm)}</span>
              </>
            )}
          </div>

          {dica.conteudo && (
            <p className="font-nunito" style={{
              fontSize: '0.9rem', color: C.TEXT_SECONDARY, lineHeight: 1.8,
              margin: 0, whiteSpace: 'pre-wrap',
            }}>
              {dica.conteudo}
            </p>
          )}
        </div>

        {/* Galeria de imagens adicionais — estilo matéria com fotos */}
        {dica.imagens?.length > 1 && (
          <div style={{ padding: '8px 18px 24px' }}>
            <p style={{
              fontSize: '0.66rem', fontWeight: 700, color: C.TEXT_MUTED,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
            }}>📷 Galeria</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
              {dica.imagens.map((img, i) => (
                <div key={i}
                  onClick={() => setLightboxIdx(i)}
                  style={{
                    aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden',
                    cursor: 'zoom-in', border: `1px solid ${C.BORDER_SOFT}`,
                  }}>
                  <img src={img.url} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <ImagemLightbox imagens={dica.imagens} indexInicial={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  );
};


export default DicaArtigo;
