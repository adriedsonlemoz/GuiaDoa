import React from 'react';
import { C } from '../theme.js';
import GameHeader from './shared/GameHeader.jsx';
import Toast from '../ui/Toast.jsx';
import useDicasFeed from './dicas/useDicasFeed.js';
import DicasSkeleton from './dicas/DicasSkeleton.jsx';
import CategoriaChip from './dicas/CategoriaChip.jsx';
import DicaCard from './dicas/DicaCard.jsx';
import DicaArtigo from './dicas/DicaArtigo.jsx';

const Dicas = ({ setRoute }) => {
  const feed = useDicasFeed();
  return (
    <div className="max-w-md mx-auto pb-6" style={{ animation: 'reveal-up 0.4s ease both' }}>
      <Toast {...feed.toast} onClose={feed.closeToast} />
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 0' }}>
        <button onClick={() => setRoute('home')} aria-label="Voltar"
          style={{ background: 'transparent', border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 8, color: C.TEXT_SECONDARY, width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>←</button>
      </div>
      <GameHeader title="💡 Dicas & Tutoriais" subtitle="Guias da comunidade" />
      {feed.categorias.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '4px 8px 12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <CategoriaChip cat={{ icon: '📰', label: 'Todas' }} ativo={!feed.filtroCat} onClick={() => feed.setFiltroCat(null)} />
          {feed.categorias.map(cat => (
            <CategoriaChip key={cat._id} cat={cat} ativo={feed.filtroCat === cat.slug}
              onClick={() => feed.setFiltroCat(feed.filtroCat === cat.slug ? null : cat.slug)} />
          ))}
        </div>
      )}
      <div style={{ padding: '0 8px' }}>
        {feed.loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{[1, 2, 3].map(i => <DicasSkeleton key={i} h={220} />)}</div>
        ) : feed.dicasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: C.TEXT_MUTED }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>📭</p>
            <p className="font-nunito font-semibold" style={{ fontSize: '0.85rem' }}>{feed.filtroCat ? 'Nenhuma dica nessa categoria ainda.' : 'Nenhuma dica publicada ainda.'}</p>
            <p style={{ fontSize: '0.72rem', marginTop: 6, color: C.TEXT_FAINT }}>Em breve teremos conteúdos aqui!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feed.dicasFiltradas.map(dica => <DicaCard key={dica._id} dica={dica} catInfo={feed.catMap[dica.categoria]} onClick={() => feed.setArtigoAberto(dica)} />)}
          </div>
        )}
      </div>
      {feed.artigoAberto && <DicaArtigo dica={feed.artigoAberto} catInfo={feed.catMap[feed.artigoAberto.categoria]} onClose={() => feed.setArtigoAberto(null)} />}
    </div>
  );
};

export default Dicas;
