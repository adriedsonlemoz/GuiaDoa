import React from 'react';
import Toast from '../ui/Toast.jsx';
import useDicasFeed from './dicas/useDicasFeed.js';
import DicasSkeleton from './dicas/DicasSkeleton.jsx';
import CategoriaChip from './dicas/CategoriaChip.jsx';
import DicaCard from './dicas/DicaCard.jsx';
import DicaArtigo from './dicas/DicaArtigo.jsx';
import GameHeader from './shared/GameHeader.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

const Dicas = ({ setRoute }) => {
  const feed = useDicasFeed();
  const { t, content } = useI18n();
  const featured = feed.dicasFiltradas.filter(d => d.destaque);
  const regular = feed.dicasFiltradas.filter(d => !d.destaque);

  return (
    <div style={{ maxWidth:640, margin:'0 auto', paddingBottom:24, animation:'reveal-up .3s ease both' }}>
      <Toast {...feed.toast} onClose={feed.closeToast} />
      <GameHeader title={t('tips.library')} subtitle={t('tips.subtitle_long')} />

      <div className="game-filter-row">
        <span aria-hidden="true">⌕</span>
        <input className="game-field" value={feed.busca} onChange={e => feed.setBusca(e.target.value)} placeholder={t('tips.search_placeholder')} aria-label={t('tips.search_placeholder')} />
        {feed.busca ? <button onClick={() => feed.setBusca('')} style={{ border:0, background:'transparent', color:'#725528', cursor:'pointer' }}>✕</button> : null}
      </div>

      {feed.categorias.length > 0 ? (
        <div className="game-tabs" style={{ marginTop:8, overflowX:'auto', justifyContent:'flex-start' }}>
          <CategoriaChip cat={{ icon:'✦', label:t('tips.all') }} ativo={!feed.filtroCat} onClick={() => feed.setFiltroCat(null)} />
          {feed.categorias.map(cat => <CategoriaChip key={cat._id} cat={{ ...cat, label:content(cat,'label') }} ativo={feed.filtroCat === cat.slug} onClick={() => feed.setFiltroCat(feed.filtroCat === cat.slug ? null : cat.slug)} />)}
        </div>
      ) : null}

      <div style={{ display:'grid', gap:9, marginTop:10 }}>
        {feed.loading ? [1,2,3].map(i => <DicasSkeleton key={i} h={170} />) : null}
        {!feed.loading && !feed.dicasFiltradas.length ? (
          <div className="game-panel" style={{ textAlign:'center', padding:'42px 18px', color:'#806d4d' }}>
            <div style={{ fontSize:'2rem' }}>📚</div>
            <div style={{ marginTop:8, fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:700 }}>{t('tips.no_data')}</div>
            <div style={{ marginTop:4, fontSize:'.76rem' }}>{t('tips.no_data_hint')}</div>
          </div>
        ) : null}
        {!feed.loading ? featured.map(dica => <DicaCard key={dica._id} dica={dica} catInfo={feed.catMap[dica.categoria]} onClick={() => feed.setArtigoAberto(dica)} />) : null}
        {!feed.loading && regular.length > 0 && featured.length > 0 ? <div className="game-home-divider"><span>{t('tips.more_guides')}</span></div> : null}
        {!feed.loading ? regular.map(dica => <DicaCard key={dica._id} dica={dica} catInfo={feed.catMap[dica.categoria]} onClick={() => feed.setArtigoAberto(dica)} />) : null}
      </div>

      {feed.artigoAberto ? <DicaArtigo dica={feed.artigoAberto} catInfo={feed.catMap[feed.artigoAberto.categoria]} onClose={() => feed.setArtigoAberto(null)} setRoute={setRoute} /> : null}
    </div>
  );
};

export default Dicas;
