import React, { useEffect, useMemo, useState } from 'react';
import { useGameData } from '../data/GameDataContext.jsx';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
import { GameSectionTitle, GameTabs } from './shared/GameChrome.jsx';
import ItemPrice from './items/ItemPrice.jsx';
import ItemContents from './items/ItemContents.jsx';
import ItemReferenceCard, { ItemThumb } from './items/ItemReferenceCard.jsx';
import { buildContainerMap, buildItemMap, normalizeCatalogItem } from './items/itemCatalogUtils.js';

function ItemVisual({ item, size = 70 }) {
  return <ItemThumb item={item} size={size} />;
}

const GROUP_TABS = [
  ['all','items.group_all','🎒'],
  ['featured','items.group_featured','★'],
  ['recursos','items.group_resources','◈'],
  ['aceleracoes','items.group_speedups','⚡'],
  ['geral','items.group_general','✦'],
  ['arcas','items.group_chests','▣'],
];

function ItemRow({ item, onClick }) {
  return (
    <button className="game-list-row item-catalog-row" onClick={onClick}>
      <ItemVisual item={item} size={70} />
      <div className="item-catalog-main">
        <div className="item-catalog-title-line">
          <div className="game-list-name">{item.nome}</div>
          {item.destaque ? <span className="item-featured-star" title="Destaque">★</span> : null}
        </div>
        <div className="game-list-meta">{item.categoria}{item.raridade ? ` • ${item.raridade}` : ''}{item.quantidade !== null ? ` • x${item.quantidade.toLocaleString()}` : ''}</div>
        {item.descricao ? <p className="game-list-copy item-catalog-description">{item.descricao}</p> : null}
        <ItemPrice preco={item.preco} compact />
      </div>
      <span aria-hidden="true" className="item-row-chevron">›</span>
    </button>
  );
}

function ItemGridCard({ item, onClick }) {
  return (
    <button onClick={onClick} className="item-grid-card">
      <div className="item-grid-visual"><ItemVisual item={item} size={68} />{item.destaque ? <span className="item-grid-star">★</span> : null}</div>
      <div className="game-list-name item-grid-name">{item.nome}</div>
      <div className="game-list-meta">{item.categoria}{item.quantidade !== null ? ` • x${item.quantidade.toLocaleString()}` : ''}</div>
      <ItemPrice preco={item.preco} compact />
    </button>
  );
}

function formatEffect(item, t) {
  const { tipo, valor, unidade } = item.efeito || {};
  if (!tipo && valor == null) return '';
  const label = t(`items.effect.${tipo}`);
  const safeLabel = label === `items.effect.${tipo}` ? tipo : label;
  const value = valor == null ? '' : String(valor).replace('.', ',');
  const unitLabel = unidade ? t(`items.unit.${unidade}`) : '';
  const safeUnit = unitLabel === `items.unit.${unidade}` ? unidade : unitLabel;
  return [safeLabel, value, safeUnit].filter(Boolean).join(' · ');
}

function ItemDetailsModal({ item, itemMap, containersMap, onOpen, onClose, t }) {
  const containers = containersMap.get(item.slug) || [];
  const effect = formatEffect(item,t);
  const rows = [
    [t('items.field_category'), item.categoria],
    [t('items.field_quantity'), item.quantidade !== null ? item.quantidade.toLocaleString() : ''],
    [t('items.field_rarity'), item.raridade],
    [t('items.field_effect'), effect],
    [t('items.field_origin'), item.origem],
    [t('items.field_usage'), item.uso],
    [t('items.field_limits'), item.limites],
  ].filter(([,value]) => value !== null && value !== undefined && value !== '');

  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <article className="game-modal-sheet item-modal-sheet" onClick={event => event.stopPropagation()}>
        <header className="game-modal-heading">
          <button className="game-modal-close" onClick={onClose}>‹</button>
          <h2>{item.nome}</h2>
          <button className="game-modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="game-detail-hero item-detail-hero">
          <ItemVisual item={item} size={92} />
          <div className="item-detail-copy-wrap">
            <div className="item-detail-title-line">
              <h3 className="game-detail-title">{item.nome}</h3>
              {item.destaque ? <span className="item-featured-star">★</span> : null}
            </div>
            <div className="game-list-meta">{item.categoria}{item.raridade ? ` • ${item.raridade}` : ''}</div>
            <ItemPrice preco={item.preco} />
            {item.descricao ? <p className="game-detail-copy">{item.descricao}</p> : null}
          </div>
        </div>
        <div className="game-modal-content item-modal-content">
          {rows.length ? <>
            <GameSectionTitle>{t('items.details')}</GameSectionTitle>
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
          </> : null}

          <ItemContents item={item} itemMap={itemMap} onOpen={onOpen} t={t} />

          {containers.length ? (
            <section className="item-detail-section">
              <h4>{t('items.found_in')}</h4>
              <div className="item-contents-grid">
                {containers.map(container => <ItemReferenceCard key={container.slug} item={container} compact onClick={() => onOpen(container)} />)}
              </div>
            </section>
          ) : null}
        </div>
      </article>
    </div>
  );
}

export default function Itens() {
  const { itens:itensOnline } = useGameData();
  const { t, content } = useI18n();
  const [busca,setBusca] = useState('');
  const [grupo,setGrupo] = useState('all');
  const [subcategoria,setSubcategoria] = useState('all');
  const [modo,setModo] = useState('list');
  const [selecionado,setSelecionado] = useState(null);

  const catalogo = useMemo(() => itensOnline
    .map(item => normalizeCatalogItem(item,content))
    .sort((a,b) => Number(b.destaque) - Number(a.destaque) || (a.ordem ?? 999) - (b.ordem ?? 999) || a.nome.localeCompare(b.nome)), [itensOnline,content]);
  const itemMap = useMemo(() => buildItemMap(catalogo), [catalogo]);
  const containersMap = useMemo(() => buildContainerMap(catalogo), [catalogo]);

  useEffect(() => {
    if (!catalogo.length) return;
    let target = '';
    try { target = sessionStorage.getItem('guiadoa_open_item') || ''; } catch { return; }
    if (!target) return;
    const normalized = target.trim().toLocaleLowerCase();
    const found = catalogo.find(item => [item.slug, item.nome]
      .filter(Boolean).some(value => String(value).trim().toLocaleLowerCase() === normalized));
    if (!found) return;
    try { sessionStorage.removeItem('guiadoa_open_item'); } catch {}
    setSelecionado(found);
  }, [catalogo]);

  const subcategorias = useMemo(() => {
    const source = grupo === 'all' || grupo === 'featured' ? catalogo : catalogo.filter(item => item.grupo === grupo);
    return ['all', ...Array.from(new Set(source.map(item => item.categoria).filter(Boolean))).sort((a,b) => a.localeCompare(b))];
  }, [catalogo,grupo]);

  const filtrados = useMemo(() => {
    const query = busca.trim().toLowerCase();
    return catalogo.filter(item => {
      if (grupo === 'featured' && !item.destaque) return false;
      if (!['all','featured'].includes(grupo) && item.grupo !== grupo) return false;
      if (subcategoria !== 'all' && item.categoria !== subcategoria) return false;
      if (!query) return true;
      const contentNames = (item.conteudo || []).map(row => itemMap.get(row.itemSlug)?.nome || row.itemSlug);
      return [item.nome,item.descricao,item.categoria,item.raridade,item.origem,item.uso,...item.tags,...contentNames]
        .filter(Boolean).some(value => String(value).toLowerCase().includes(query));
    });
  }, [catalogo,itemMap,busca,grupo,subcategoria]);

  const changeGroup = next => { setGrupo(next); setSubcategoria('all'); };

  return (
    <div className="items-page">
      <GameHeader title={t('items.eyebrow')} subtitle={t('items.subtitle_catalog')} />

      <div className="item-group-tabs" role="tablist" aria-label={t('items.categories')}>
        {GROUP_TABS.map(([id,label,icon]) => (
          <button key={id} type="button" role="tab" aria-selected={grupo === id} className={grupo === id ? 'is-active' : ''} onClick={() => changeGroup(id)}>
            <span aria-hidden="true">{icon}</span>{t(label)}
          </button>
        ))}
      </div>

      <div className="items-toolbar">
        <div className="game-filter-row item-search-row">
          <span aria-hidden="true">⌕</span>
          <input className="game-field" value={busca} onChange={event => setBusca(event.target.value)} placeholder={t('items.search')} />
        </div>
        <GameTabs compact tabs={[{ id:'list', label:t('items.list') },{ id:'grid', label:t('items.grid') }]} value={modo} onChange={setModo} />
      </div>

      {subcategorias.length > 2 ? (
        <div className="game-filter-row item-subcategory-row">
          <span className="game-filter-label">{t('items.subcategory')}:</span>
          <select className="game-field" value={subcategoria} onChange={event => setSubcategoria(event.target.value)}>
            {subcategorias.map(category => <option key={category} value={category}>{category === 'all' ? t('items.all_categories') : category}</option>)}
          </select>
        </div>
      ) : null}

      <div className="item-result-count">{t('items.count',{ count:filtrados.length })}</div>

      {!filtrados.length ? (
        <section className="game-panel item-empty-state">
          <div>🎒</div>
          <strong>{busca ? t('items.no_results') : t('items.empty')}</strong>
          <span>{busca ? t('items.no_match',{ query:busca }) : t('items.empty_help')}</span>
        </section>
      ) : modo === 'list' ? (
        <section className="game-list">{filtrados.map(item => <ItemRow key={item._id || item.slug} item={item} onClick={() => setSelecionado(item)} />)}</section>
      ) : (
        <div className="item-grid">{filtrados.map(item => <ItemGridCard key={item._id || item.slug} item={item} onClick={() => setSelecionado(item)} />)}</div>
      )}

      {selecionado ? <ItemDetailsModal item={selecionado} itemMap={itemMap} containersMap={containersMap} onOpen={setSelecionado} onClose={() => setSelecionado(null)} t={t} /> : null}
    </div>
  );
}
