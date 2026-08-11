import React, { useState, useEffect } from 'react';
import { C } from '../theme.js';
import GameHeader from './shared/GameHeader.jsx';
import Toast from '../ui/Toast.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const fmtData = iso => {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return ''; }
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ h = 80, radius = 12 }) => (
  <div style={{
    height: h, borderRadius: radius,
    background: `linear-gradient(90deg,${C.BG_CARD} 25%,${C.BG_SECONDARY} 50%,${C.BG_CARD} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }} />
);

// ─── Chip de filtro de categoria ──────────────────────────────────────────────
const CatChip = ({ cat, ativo, onClick }) => (
  <button onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      background: ativo ? C.BG_HEADER : C.BG_CARD,
      border: `1.5px solid ${ativo ? C.BG_HEADER : C.BORDER_SOFT}`,
      borderRadius: 100, padding: '6px 13px',
      cursor: 'pointer', transition: 'all 0.14s',
      fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap',
      color: ativo ? '#F8F2E0' : C.TEXT_SECONDARY,
    }}
  >
    <span>{cat.icon}</span>
    <span>{cat.label}</span>
  </button>
);

// ─── Card de dica — estilo feed de notícia ────────────────────────────────────
const DicaCard = ({ dica, catInfo, onClick }) => (
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
        <img src={dica.imagens[0].url} alt={dica.titulo}
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
          }}>⭐ Destaque</span>
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
            {catInfo.icon} {catInfo.label}
          </span>
        )}
        {dica.criadoEm && (
          <>
            <span style={{ color: C.TEXT_FAINT, fontSize: '0.6rem' }}>•</span>
            <span style={{ fontSize: '0.62rem', color: C.TEXT_FAINT }}>{fmtData(dica.criadoEm)}</span>
          </>
        )}
        {dica.destaque && !dica.imagens?.length && (
          <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, color: C.ACCENT }}>⭐</span>
        )}
      </div>

      <p className="font-cinzel font-bold"
        style={{ fontSize: '0.92rem', color: C.TEXT_PRIMARY, margin: 0, lineHeight: 1.35 }}>
        {dica.titulo}
      </p>

      {dica.conteudo && (
        <p className="font-nunito"
          style={{
            fontSize: '0.76rem', color: C.TEXT_SECONDARY, margin: '6px 0 0',
            lineHeight: 1.55, display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
          {dica.conteudo}
        </p>
      )}

      <p style={{ fontSize: '0.68rem', color: C.ACCENT, fontWeight: 700, margin: '8px 0 0' }}>
        Ler mais →
      </p>
    </div>
  </div>
);

// ─── Visualizador de imagem em pop-up (lightbox) ──────────────────────────────
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

// ─── Artigo completo (estilo notícia/matéria) ────────────────────────────────
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

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — feed de dicas
// ══════════════════════════════════════════════════════════════════════════════
const Dicas = ({ setRoute }) => {
  const [categorias, setCategorias] = useState([]);
  const [dicas,       setDicas]     = useState([]);
  const [filtroCat,   setFiltroCat] = useState(null); // null = todas
  const [loading,     setLoading]   = useState(true);
  const [artigoAberto, setArtigoAberto] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // Carrega categorias + todas as dicas de uma vez (feed)
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/dicas/categorias`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/dicas`).then(r => r.json()).catch(() => []),
    ]).then(([cats, todasDicas]) => {
      setCategorias(Array.isArray(cats) ? cats : []);
      setDicas(Array.isArray(todasDicas) ? todasDicas : []);
      setLoading(false);
    }).catch(() => {
      setToast({ open: true, message: 'Erro ao carregar dicas', severity: 'error' });
      setLoading(false);
    });
  }, []);

  const catMap = Object.fromEntries(categorias.map(c => [c.slug, c]));
  const dicasFiltradas = filtroCat ? dicas.filter(d => d.categoria === filtroCat) : dicas;

  return (
    <div className="max-w-md mx-auto pb-6" style={{ animation: 'reveal-up 0.4s ease both' }}>
      <Toast {...toast} onClose={() => setToast(t => ({ ...t, open: false }))} />

      {/* Barra de voltar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 0' }}>
        <button
          onClick={() => setRoute('home')}
          style={{
            background: 'transparent', border: `1px solid ${C.BORDER_SOFT}`,
            borderRadius: 8, color: C.TEXT_SECONDARY, width: 32, height: 32,
            cursor: 'pointer', fontSize: '1rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >←</button>
      </div>

      <GameHeader title="💡 Dicas & Tutoriais" subtitle="Guias da comunidade" />

      {/* Filtro de categorias — chips horizontais com scroll */}
      {categorias.length > 0 && (
        <div style={{
          display: 'flex', gap: 6, padding: '4px 8px 12px',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        }}>
          <CatChip cat={{ icon: '📰', label: 'Todas' }} ativo={!filtroCat} onClick={() => setFiltroCat(null)} />
          {categorias.map(cat => (
            <CatChip key={cat._id} cat={cat} ativo={filtroCat === cat.slug}
              onClick={() => setFiltroCat(filtroCat === cat.slug ? null : cat.slug)} />
          ))}
        </div>
      )}

      {/* Feed de dicas */}
      <div style={{ padding: '0 8px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} h={220} />)}
          </div>
        ) : dicasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: C.TEXT_MUTED }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>📭</p>
            <p className="font-nunito font-semibold" style={{ fontSize: '0.85rem' }}>
              {filtroCat ? 'Nenhuma dica nessa categoria ainda.' : 'Nenhuma dica publicada ainda.'}
            </p>
            <p style={{ fontSize: '0.72rem', marginTop: 6, color: C.TEXT_FAINT }}>
              Em breve teremos conteúdos aqui!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dicasFiltradas.map(d => (
              <DicaCard key={d._id} dica={d} catInfo={catMap[d.categoria]}
                onClick={() => setArtigoAberto(d)} />
            ))}
          </div>
        )}
      </div>

      {/* Artigo completo */}
      {artigoAberto && (
        <DicaArtigo dica={artigoAberto} catInfo={catMap[artigoAberto.categoria]}
          onClose={() => setArtigoAberto(null)} />
      )}
    </div>
  );
};

export default Dicas;
