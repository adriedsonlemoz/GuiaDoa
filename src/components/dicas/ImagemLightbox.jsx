import React, { useState } from 'react';
import { C } from '../../theme.js';

const ImagemLightbox = ({ imagens, indexInicial, onClose }) => {
  const [idx, setIdx] = useState(indexInicial);
  if (!imagens?.length) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5,8,15,0.94)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Fechar */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '50%', width: 38, height: 38, color: '#fff',
        fontSize: '1.2rem', cursor: 'pointer', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* Contador */}
      {imagens.length > 1 && (
        <span style={{
          position: 'absolute', top: 16, left: 16, color: 'rgba(255,255,255,0.7)',
          fontSize: '0.78rem', fontWeight: 700,
        }}>
          {idx + 1} / {imagens.length}
        </span>
      )}

      {/* Imagem */}
      <img src={imagens[idx]?.url} alt=""
        style={{ maxWidth: '100%', maxHeight: '88vh', objectFit: 'contain', borderRadius: 6 }}
        onClick={e => e.stopPropagation()}
        onError={e => { e.target.style.display = 'none'; }}
      />

      {/* Navegação */}
      {imagens.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + imagens.length) % imagens.length); }}
            style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', borderRadius: '50%', width: 40, height: 40,
              cursor: 'pointer', fontSize: '1.3rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>‹</button>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % imagens.length); }}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', borderRadius: '50%', width: 40, height: 40,
              cursor: 'pointer', fontSize: '1.3rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>›</button>

          {/* Miniaturas */}
          <div style={{
            position: 'absolute', bottom: 14, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', padding: '0 16px',
          }}>
            {imagens.map((img, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                style={{
                  width: 38, height: 38, borderRadius: 6, overflow: 'hidden',
                  border: i === idx ? `2px solid ${C.ACCENT}` : '2px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer', padding: 0, opacity: i === idx ? 1 : 0.6,
                  flexShrink: 0,
                }}>
                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};


export default ImagemLightbox;
