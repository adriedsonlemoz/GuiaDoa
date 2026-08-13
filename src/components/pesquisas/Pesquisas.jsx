import React, { useMemo, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';
import { GameSectionTitle, GameTabs } from '../shared/GameChrome.jsx';
import { getAllResearchProgress } from './researchProgress.js';
import { RESEARCH_FILTERS, matchesResearchFilter } from './researchConfig.js';

const CATEGORY_ORDER = {
  'Produção': 0,
  'Movimento e Construção': 1,
  'Corpo a Corpo': 2,
  'Ataque à Distância': 3,
};

function PesquisaRow({ pesquisa, current, onClick }) {
  const { t, content } = useI18n();
  return (
    <button className="game-list-row" onClick={onClick}>
      <div className="game-thumb" style={{ fontSize:'2.2rem' }}>{pesquisa.icone || '🔬'}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="game-list-name">{content(pesquisa, 'nome')}</div>
        <div className="game-list-meta">
          {current > 0
            ? t('research.progress_level',{current,max:pesquisa.nivelMax})
            : (pesquisa.nivelMax === 1 ? t('research.single_level') : t('research.up_to_level',{level:pesquisa.nivelMax}))}
          {' · '}{pesquisa.categoria}
        </div>
        {content(pesquisa,'descricao') ? <p className="game-list-copy">{content(pesquisa,'descricao')}</p> : null}
      </div>
      <div className="game-row-side" style={{ minWidth:48 }}>
        {current > 0 ? (
          <div style={{ textAlign:'right' }}>
            <span className="game-power-label">{t('common.level')}</span>
            <span className="game-power-value">{current}/{pesquisa.nivelMax}</span>
          </div>
        ) : null}
        <span aria-hidden="true" style={{ color:'#7c7a63', fontSize:'1.35rem', marginTop:'auto' }}>›</span>
      </div>
    </button>
  );
}

export default function Pesquisas({ setRoute }) {
  const { pesquisas } = useGameData();
  const { t, content } = useI18n();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('all');
  const progress = useMemo(() => getAllResearchProgress(), []);

  const lista = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return [...pesquisas]
      .filter(p => matchesResearchFilter(p, filtro))
      .filter(p => !term || [content(p,'nome'), content(p,'descricao'), p.categoria]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(term)))
      .sort((a,b) => (CATEGORY_ORDER[a.categoria] ?? 9) - (CATEGORY_ORDER[b.categoria] ?? 9) || (a.ordem ?? 0) - (b.ordem ?? 0) || String(a.nome).localeCompare(String(b.nome)));
  }, [pesquisas, filtro, busca, content]);

  const tabs = RESEARCH_FILTERS.map(item => ({ id:item.id, label:t(item.key) }));

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:16 }}>
      <GameHeader title={t('research.subtitle')} subtitle={t('research.available',{count:pesquisas.length})} />

      <div className="game-filter-row" style={{ margin:'9px 0 8px' }}>
        <span aria-hidden="true">⌕</span>
        <input
          className="game-field"
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder={t('research.search')}
          aria-label={t('research.search')}
          style={{ border:0, background:'transparent', padding:'4px 2px', boxShadow:'none' }}
        />
        {busca ? <button type="button" onClick={() => setBusca('')} style={{ border:0, background:'transparent', cursor:'pointer', color:'#53655d', fontWeight:900 }}>✕</button> : null}
      </div>

      <GameTabs tabs={tabs} value={filtro} onChange={setFiltro} compact />

      <section className="game-panel" style={{ marginTop:8 }}>
        <GameSectionTitle aside={t('research.result_count',{count:lista.length})}>{t('research.title')}</GameSectionTitle>
        {lista.length ? (
          <div className="game-list" style={{ border:0, borderRadius:0 }}>
            {lista.map(p => (
              <PesquisaRow
                key={p.slug}
                pesquisa={p}
                current={Math.max(0, Math.min(p.nivelMax, Number(progress[p.slug]?.current) || 0))}
                onClick={() => setRoute(`pesquisa_${p.slug}`)}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding:'28px 18px', textAlign:'center', color:'#6f7469', fontSize:'.74rem', fontWeight:700 }}>
            🔬 {t('research.no_results')}
          </div>
        )}
      </section>
    </div>
  );
}
