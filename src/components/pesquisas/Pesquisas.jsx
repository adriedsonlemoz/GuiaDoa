import React from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';
import { GameSectionTitle } from '../shared/GameChrome.jsx';

const CATEGORIAS = [
  { id:'Corpo a Corpo', key:'research.category.melee', icone:'⚔️' },
  { id:'Ataque à Distância', key:'research.category.ranged', icone:'🏹' },
  { id:'Produção', key:'research.category.production', icone:'🌾' },
  { id:'Movimento e Construção', key:'research.category.movement', icone:'🏃' },
];

function PesquisaRow({ pesquisa, onClick }) {
  const { t, content } = useI18n();
  return (
    <button className="game-list-row" onClick={onClick}>
      <div className="game-thumb" style={{ fontSize:'2.2rem' }}>{pesquisa.icone || '🔬'}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="game-list-name">{content(pesquisa, 'nome')}</div>
        <div className="game-list-meta">
          {pesquisa.nivelMax === 1 ? t('research.single_level') : t('research.up_to_level',{level:pesquisa.nivelMax})}
        </div>
        {content(pesquisa,'descricao') ? <p className="game-list-copy">{content(pesquisa,'descricao')}</p> : null}
      </div>
      <span aria-hidden="true" style={{ color:'#9b7d40', fontSize:'1.4rem', alignSelf:'center' }}>›</span>
    </button>
  );
}

export default function Pesquisas({ setRoute }) {
  const { pesquisas } = useGameData();
  const { t } = useI18n();

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:16 }}>
      <GameHeader title={t('research.subtitle')} subtitle={t('research.available',{count:pesquisas.length})} />
      <div style={{ display:'grid', gap:9 }}>
        {CATEGORIAS.map(cat => {
          const lista = pesquisas.filter(p => p.categoria === cat.id);
          if (!lista.length) return null;
          return (
            <section className="game-panel" key={cat.id}>
              <GameSectionTitle>{cat.icone} {t(cat.key)}</GameSectionTitle>
              <div>
                {lista.map(p => <PesquisaRow key={p.slug} pesquisa={p} onClick={() => setRoute(`pesquisa_${p.slug}`)} />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
