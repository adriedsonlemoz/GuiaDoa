import React, { useMemo, useState } from 'react';
import { useGameData } from '../data/GameDataContext.jsx';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
import { GameSectionTitle, GameTabs } from './shared/GameChrome.jsx';

function normalizeItem(item, content) {
  return {
    ...item,
    nome: content(item,'nome') || item.nome || 'Item',
    descricao: content(item,'descricao') || item.descricao || '',
    categoria: item.categoria || 'Geral',
    raridade: item.raridade || '',
    origem: content(item,'origem') || item.origem || content(item,'onde') || item.onde || '',
    uso: content(item,'uso') || item.uso || '',
    limites: content(item,'limites') || item.limites || '',
    quantidade: Number.isFinite(Number(item.quantidade)) ? Number(item.quantidade) : null,
  };
}

function ItemVisual({ item, size=76 }) {
  return (
    <div className="game-thumb" style={{ width:size, height:size, flexBasis:size, fontSize:size * .38 }}>
      {item.imagem ? <img src={item.imagem} alt="" loading="lazy" /> : <span>{item.icone || '🎒'}</span>}
    </div>
  );
}

function ItemRow({ item, onClick }) {
  return (
    <button className="game-list-row" onClick={onClick}>
      <ItemVisual item={item} />
      <div style={{ flex:1, minWidth:0 }}>
        <div className="game-list-name">{item.nome}</div>
        <div className="game-list-meta">
          {item.categoria}{item.raridade ? ` • ${item.raridade}` : ''}{item.quantidade !== null ? ` • x${item.quantidade}` : ''}
        </div>
        {item.descricao ? <p className="game-list-copy">{item.descricao}</p> : null}
      </div>
      <span aria-hidden="true" style={{ color:'#9b7d40', fontSize:'1.4rem', alignSelf:'center' }}>›</span>
    </button>
  );
}

function ItemGridCard({ item, onClick }) {
  return (
    <button onClick={onClick} style={{
      minWidth:0, textAlign:'left', padding:9, border:'1px solid #a48955', borderRadius:5,
      background:'linear-gradient(180deg,#e5d8b2,#d3c396)', boxShadow:'inset 0 1px 0 rgba(255,248,218,.55)', cursor:'pointer',
    }}>
      <ItemVisual item={item} size={64} />
      <div className="game-list-name" style={{ marginTop:7, fontSize:'.78rem' }}>{item.nome}</div>
      <div className="game-list-meta">{item.categoria}{item.quantidade !== null ? ` • x${item.quantidade}` : ''}</div>
    </button>
  );
}

function ItemDetailsModal({ item, onClose, t }) {
  const rows = [
    [t('items.field_category'), item.categoria],
    [t('items.field_quantity'), item.quantidade],
    [t('items.field_rarity'), item.raridade],
    [t('items.field_origin'), item.origem],
    [t('items.field_usage'), item.uso],
    [t('items.field_limits'), item.limites],
  ].filter(([,value]) => value !== null && value !== undefined && value !== '');

  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <article className="game-modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth:480 }}>
        <header className="game-modal-heading">
          <button className="game-modal-close" onClick={onClose}>‹</button>
          <h2>{item.nome}</h2>
          <button className="game-modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="game-detail-hero">
          <ItemVisual item={item} size={90} />
          <div style={{ minWidth:0 }}>
            <h3 className="game-detail-title">{item.nome}</h3>
            <div className="game-list-meta">{item.categoria}{item.raridade ? ` • ${item.raridade}` : ''}</div>
            {item.descricao ? <p className="game-detail-copy">{item.descricao}</p> : null}
          </div>
        </div>
        <div className="game-modal-content">
          <GameSectionTitle>{t('items.title')}</GameSectionTitle>
          <div className="game-info-table-wrap">
            <div className="game-info-table-body">
              {rows.map(([label,value]) => (
                <div className="game-info-table-row" key={label} style={{ gridTemplateColumns:'minmax(0,1fr) minmax(0,1.45fr)' }}>
                  <span className="game-info-label">{label}</span>
                  <span className="game-info-value" style={{ textAlign:'right' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function Itens() {
  const { itens: itensOnline } = useGameData();
  const { t, content } = useI18n();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('all');
  const [modo, setModo] = useState('list');
  const [selecionado, setSelecionado] = useState(null);

  const catalogo = useMemo(
    () => itensOnline.map(item => normalizeItem(item,content)).sort((a,b) => (a.ordem ?? 999) - (b.ordem ?? 999) || a.nome.localeCompare(b.nome)),
    [itensOnline, content],
  );
  const categorias = useMemo(() => ['all', ...Array.from(new Set(catalogo.map(i => i.categoria).filter(Boolean)))], [catalogo]);
  const filtrados = useMemo(() => {
    const query = busca.trim().toLowerCase();
    return catalogo.filter(item => {
      if (categoria !== 'all' && item.categoria !== categoria) return false;
      if (!query) return true;
      return [item.nome,item.descricao,item.categoria,item.raridade,item.origem,item.uso].filter(Boolean).some(v => String(v).toLowerCase().includes(query));
    });
  }, [catalogo,busca,categoria]);

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:18 }}>
      <GameHeader title={t('items.eyebrow')} subtitle={t('items.subtitle_long')} />

      <GameTabs
        compact
        tabs={[{ id:'list', label:t('items.list') }, { id:'grid', label:t('items.grid') }]}
        value={modo}
        onChange={setModo}
      />

      <div className="game-filter-row" style={{ marginTop:8 }}>
        <span className="game-filter-label">{t('common.filter')}:</span>
        <select className="game-field" value={categoria} onChange={e => setCategoria(e.target.value)}>
          {categorias.map(cat => <option key={cat} value={cat}>{cat === 'all' ? t('items.all_categories') : cat}</option>)}
        </select>
      </div>
      <div className="game-filter-row" style={{ marginTop:7 }}>
        <span aria-hidden="true">⌕</span>
        <input className="game-field" value={busca} onChange={e => setBusca(e.target.value)} placeholder={t('items.search')} />
      </div>

      <div style={{ margin:'8px 2px 6px', color:'#765f3c', fontSize:'.62rem', fontWeight:900 }}>
        {t('items.count',{count:filtrados.length})}
      </div>

      {!filtrados.length ? (
        <section className="game-panel" style={{ padding:'34px 16px', textAlign:'center', color:'#745f40' }}>
          <div style={{ fontSize:'2.5rem' }}>🎒</div>
          <div style={{ marginTop:7, fontFamily:'Georgia,serif', fontWeight:700 }}>{busca ? t('items.no_results') : t('items.empty')}</div>
          <div style={{ marginTop:5, fontSize:'.7rem' }}>{busca ? t('items.no_match',{query:busca}) : t('items.empty_help')}</div>
        </section>
      ) : modo === 'list' ? (
        <section className="game-list">{filtrados.map(item => <ItemRow key={item._id || item.nome} item={item} onClick={() => setSelecionado(item)} />)}</section>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:8 }}>
          {filtrados.map(item => <ItemGridCard key={item._id || item.nome} item={item} onClick={() => setSelecionado(item)} />)}
        </div>
      )}

      {selecionado ? <ItemDetailsModal item={selecionado} onClose={() => setSelecionado(null)} t={t} /> : null}
    </div>
  );
}
