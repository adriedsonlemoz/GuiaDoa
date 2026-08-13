import React from 'react';
import { C } from '../theme.js';
import Toast from '../ui/Toast.jsx';
import useDicasFeed from './dicas/useDicasFeed.js';
import DicasSkeleton from './dicas/DicasSkeleton.jsx';
import CategoriaChip from './dicas/CategoriaChip.jsx';
import DicaCard from './dicas/DicaCard.jsx';
import DicaArtigo from './dicas/DicaArtigo.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

const Dicas = ({ setRoute }) => {
  const feed = useDicasFeed();
  const { t, content } = useI18n();
  const featured = feed.dicasFiltradas.filter(d => d.destaque);
  const regular = feed.dicasFiltradas.filter(d => !d.destaque);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 28, animation: 'reveal-up 0.4s ease both' }}>
      <Toast {...feed.toast} onClose={feed.closeToast} />

      <section style={{ margin: '12px 12px 13px', padding: '18px 17px', borderRadius: 18, background: `linear-gradient(145deg, ${C.BG_CARD_TOP} 0%, ${C.BG_CARD} 70%, #EFE1B9 100%)`, border: `1.5px solid ${C.BORDER}`, boxShadow: '0 8px 22px rgba(62,47,28,.10), inset 0 1px 0 rgba(255,248,238,.75)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -16, top: -22, fontSize: 84, opacity: .055, filter: 'sepia(1)' }}>📚</div>
        <div className="font-nunito" style={{ color: C.ACCENT_DEEP, fontSize: '.64rem', fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase' }}>{t('tips.library')}</div>
        <h1 className="font-cinzel" style={{ color: C.TEXT_PRIMARY, fontSize: '1.23rem', margin: '5px 0 0' }}>{t('tips.title')}</h1>
        <p className="font-nunito" style={{ color: C.TEXT_SECONDARY, fontSize: '.77rem', lineHeight: 1.5, margin: '6px 0 0', maxWidth: 430 }}>{t('tips.subtitle_long')}</p>
        <div style={{ marginTop: 13, display: 'flex', gap: 8, alignItems: 'center', background: C.BG_INPUT, border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 11, padding: '9px 11px' }}>
          <span style={{ opacity: .72 }}>⌕</span>
          <input value={feed.busca} onChange={e => feed.setBusca(e.target.value)} placeholder={t('tips.search_placeholder')} aria-label={t('tips.search_placeholder')}
            style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', color: C.TEXT_PRIMARY, fontFamily: 'Nunito, sans-serif', fontSize: '.76rem' }} />
          {feed.busca && <button onClick={() => feed.setBusca('')} style={{ border: 0, background: 'transparent', color: C.ACCENT_DEEP, cursor: 'pointer' }}>✕</button>}
        </div>
      </section>

      {feed.categorias.length > 0 && (
        <div style={{ display: 'flex', gap: 7, padding: '0 12px 13px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <CategoriaChip cat={{ icon: '✦', label: t('tips.all') }} ativo={!feed.filtroCat} onClick={() => feed.setFiltroCat(null)} />
          {feed.categorias.map(cat => (
            <CategoriaChip key={cat._id} cat={{ ...cat, label: content(cat, 'label') }} ativo={feed.filtroCat === cat.slug}
              onClick={() => feed.setFiltroCat(feed.filtroCat === cat.slug ? null : cat.slug)} />
          ))}
        </div>
      )}

      <div style={{ padding: '0 12px' }}>
        {feed.loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>{[1, 2, 3].map(i => <DicasSkeleton key={i} h={190} />)}</div>
        ) : feed.dicasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 20px', border: `1px dashed ${C.BORDER_SOFT}`, borderRadius: 16, color: C.TEXT_MUTED, background: C.BG_CARD }}>
            <div style={{ fontSize: '2rem' }}>📚</div>
            <p className="font-cinzel" style={{ fontSize: '.84rem', color: C.TEXT_PRIMARY, margin: '9px 0 0' }}>{t('tips.no_data')}</p>
            <p className="font-nunito" style={{ fontSize: '.7rem', margin: '5px 0 0', color: C.TEXT_FAINT }}>{t('tips.no_data_hint')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {featured.map(dica => <DicaCard key={dica._id} dica={dica} catInfo={feed.catMap[dica.categoria]} onClick={() => feed.setArtigoAberto(dica)} />)}
            {regular.length > 0 && featured.length > 0 && <div className="font-cinzel" style={{ color: C.TEXT_MUTED, fontSize: '.68rem', letterSpacing: '.08em', textTransform: 'uppercase', margin: '5px 2px -2px' }}>{t('tips.more_guides')}</div>}
            {regular.map(dica => <DicaCard key={dica._id} dica={dica} catInfo={feed.catMap[dica.categoria]} onClick={() => feed.setArtigoAberto(dica)} />)}
          </div>
        )}
      </div>

      {feed.artigoAberto && <DicaArtigo dica={feed.artigoAberto} catInfo={feed.catMap[feed.artigoAberto.categoria]} onClose={() => feed.setArtigoAberto(null)} setRoute={setRoute} />}
    </div>
  );
};

export default Dicas;
