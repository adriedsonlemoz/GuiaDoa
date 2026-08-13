import React, { useMemo, useState } from 'react';
import { C } from '../theme.js';
import GameHeader from './shared/GameHeader.jsx';
import { useGameData } from '../data/GameDataContext.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

const RARIDADE_CORES = {
  comum: '#9A8E7A',
  raro: '#4F7DA7',
  épico: '#8A5DA8',
  epico: '#8A5DA8',
  lendário: '#B7872E',
  lendario: '#B7872E',
};

function normalizarItem(item, content) {
  const nome = content(item, 'nome') || item.nome || 'Item';
  const descricao = content(item, 'descricao') || item.descricao || '';
  const origem = content(item, 'origem') || item.origem || content(item, 'onde') || item.onde || '';
  const categoria = content(item, 'categoria') || item.categoria || 'Geral';
  const raridade = content(item, 'raridade') || item.raridade || '';
  const uso = content(item, 'uso') || item.uso || descricao;
  const limites = content(item, 'limites') || item.limites || '';
  const quantidade = item.quantidade === null || item.quantidade === undefined || item.quantidade === ''
    ? null
    : (Number.isFinite(Number(item.quantidade)) ? Number(item.quantidade) : null);
  return {
    ...item,
    nome,
    descricao,
    origem,
    categoria,
    quantidade,
    raridade,
    uso,
    limites,
  };
}

function getCatalogo(itensOnline, content) {
  return itensOnline.map(item => normalizarItem(item, content)).sort((a, b) => {
    const oa = a.ordem ?? 999;
    const ob = b.ordem ?? 999;
    return oa !== ob ? oa - ob : a.nome.localeCompare(b.nome);
  });
}

function ToggleButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        borderRadius: 999,
        padding: '7px 11px',
        border: `1px solid ${active ? C.BORDER_STRONG : 'rgba(184,149,77,0.22)'}`,
        background: active ? `linear-gradient(180deg, ${C.ACCENT} 0%, ${C.ACCENT_HOVER} 100%)` : 'rgba(244,235,221,0.96)',
        color: active ? '#FFF8EE' : C.TEXT_SECONDARY,
        fontSize: '.68rem',
        fontWeight: 900,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function ItemBadge({ label, tone = 'default' }) {
  const accent = tone === 'rarity'
    ? (RARIDADE_CORES[String(label || '').toLowerCase()] || C.ACCENT_HOVER)
    : C.BORDER;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 8px',
      borderRadius: 999,
      fontSize: '.58rem',
      fontWeight: 900,
      letterSpacing: '.03em',
      color: tone === 'rarity' ? accent : C.TEXT_SECONDARY,
      background: tone === 'rarity' ? `${accent}12` : 'rgba(184,149,77,0.09)',
      border: `1px solid ${tone === 'rarity' ? `${accent}40` : 'rgba(184,149,77,0.25)'}`,
    }}>
      {label}
    </span>
  );
}

function ItemTile({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        textAlign: 'left',
        width: '100%',
        background: 'linear-gradient(180deg, rgba(244,236,223,1) 0%, rgba(238,227,208,1) 100%)',
        border: '1px solid rgba(184,149,77,0.22)',
        borderRadius: 14,
        padding: '12px',
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(68,51,33,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: 'linear-gradient(145deg,#FFF8EE,#E8DABD)',
          border: '1px solid rgba(184,149,77,0.34)',
          display: 'grid', placeItems: 'center', fontSize: '1.9rem', flexShrink: 0,
        }>{item.imagem ? <img src={item.imagem} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:11 }} /> : (item.icone || '🎒')}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="font-cinzel" style={{ fontSize: '.77rem', color: C.TEXT_PRIMARY, fontWeight: 700, lineHeight: 1.25 }}>{item.nome}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
            <ItemBadge label={item.categoria} />
            {item.raridade ? <ItemBadge label={item.raridade} tone="rarity" /> : null}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 10, alignItems: 'center' }}>
        <div className="font-nunito" style={{ color: C.TEXT_MUTED, fontSize: '.64rem', fontWeight: 700, lineHeight: 1.35 }}>
          {item.descricao || item.uso || '—'}
        </div>
        {item.quantidade !== null ? (
          <div style={{
            minWidth: 54,
            textAlign: 'center',
            padding: '6px 8px',
            borderRadius: 10,
            background: 'rgba(49,72,74,0.06)',
            border: '1px solid rgba(49,72,74,0.12)',
          }}>
            <div className="font-nunito" style={{ color: C.TEXT_MUTED, fontSize: '.52rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>Qtd.</div>
            <div className="font-nunito" style={{ color: C.BLUE_DARK, fontSize: '.84rem', fontWeight: 1000 }}>{item.quantidade}</div>
          </div>
        ) : null}
      </div>
    </button>
  );
}

function ItemRow({ item, onClick }) {
  return (
    <button
      key={item._id}
      onClick={onClick}
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 12px',
        background: 'linear-gradient(180deg, rgba(244,236,223,1) 0%, rgba(238,227,208,1) 100%)',
        border: '1px solid rgba(184,149,77,0.22)',
        borderRadius: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{
        width: '44px', height: '44px', flexShrink: 0,
        borderRadius: '12px',
        background: 'linear-gradient(145deg,#FFF8EE,#E8DABD)',
        border: '1px solid rgba(184,149,77,0.34)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.45rem',
      }}>
        {item.imagem ? <img src={item.imagem} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:11 }} /> : (item.icone || '🎒')}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-cinzel" style={{ fontSize: '0.8rem', fontWeight: 700, color: C.TEXT_PRIMARY }}>
          {item.nome}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 5 }}>
          <ItemBadge label={item.categoria} />
          {item.raridade ? <ItemBadge label={item.raridade} tone="rarity" /> : null}
        </div>
      </div>

      {item.quantidade !== null ? (
        <div style={{ textAlign: 'right', minWidth: 44 }}>
          <div className="font-nunito" style={{ color: C.TEXT_MUTED, fontSize: '.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Qtd.</div>
          <div className="font-nunito" style={{ color: C.BLUE_DARK, fontSize: '.82rem', fontWeight: 1000 }}>{item.quantidade}</div>
        </div>
      ) : null}

      <span style={{ color: C.TEXT_FAINT, fontSize: '0.8rem' }}>›</span>
    </button>
  );
}

function ItemDetailsModal({ item, onClose, t }) {
  const campos = [
    ['items.field_category', item.categoria],
    ['items.field_quantity', item.quantidade !== null ? item.quantidade : null],
    ['items.field_rarity', item.raridade],
    ['items.field_origin', item.origem || item.onde],
    ['items.field_usage', item.uso],
    ['items.field_limits', item.limites],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(24,20,13,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 18,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420,
        background: 'linear-gradient(180deg, rgba(244,236,223,1) 0%, rgba(235,225,207,1) 100%)',
        border: `1.5px solid ${C.BORDER}`, borderRadius: 18,
        boxShadow: '0 18px 50px rgba(24,20,13,0.28)',
        padding: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 62, height: 62, borderRadius: 14,
              background: 'linear-gradient(145deg,#FFF8EE,#E8DABD)',
              border: '1px solid rgba(184,149,77,0.36)',
              display: 'grid', placeItems: 'center', fontSize: '2rem',
            }>{item.imagem ? <img src={item.imagem} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:11 }} /> : (item.icone || '🎒')}</div>
            <div>
              <h2 className="font-cinzel" style={{ margin: 0, fontSize: '0.96rem', color: C.TEXT_PRIMARY }}>{item.nome}</h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                <ItemBadge label={item.categoria} />
                {item.raridade ? <ItemBadge label={item.raridade} tone="rarity" /> : null}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, color: C.TEXT_MUTED, cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>

        {item.descricao ? (
          <p className="font-nunito" style={{ color: C.TEXT_SECONDARY, fontSize: '.78rem', lineHeight: 1.6, margin: '14px 0 0' }}>
            {item.descricao}
          </p>
        ) : null}

        <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
          {campos.map(([key, value]) => (
            <div key={key} style={{
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(250,245,236,0.92)',
              border: '1px solid rgba(184,149,77,0.16)',
            }}>
              <div className="font-nunito" style={{ color: C.TEXT_MUTED, fontSize: '.54rem', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase' }}>{t(key)}</div>
              <div className="font-nunito" style={{ color: C.TEXT_PRIMARY, fontSize: '.77rem', fontWeight: 800, marginTop: 4, lineHeight: 1.45 }}>{value}</div>
            </div>
          ))}
        </div>

        <button className="btn-gold" style={{ width: '100%', marginTop: 16 }} onClick={onClose}>{t('common.close')}</button>
      </div>
    </div>
  );
}

const Itens = () => {
  const { itens: itensOnline } = useGameData();
  const { t, content } = useI18n();
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('all');
  const [modo, setModo] = useState('grid');

  const catalogo = useMemo(() => getCatalogo(itensOnline, content), [itensOnline, content]);
  const categorias = useMemo(() => ['all', ...Array.from(new Set(catalogo.map(item => item.categoria).filter(Boolean)))], [catalogo]);

  const itens = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return catalogo.filter(item => {
      const matchCategoria = filtroCategoria === 'all' || item.categoria === filtroCategoria;
      if (!matchCategoria) return false;
      if (!termo) return true;
      return [item.nome, item.categoria, item.descricao, item.origem, item.uso, item.raridade]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(termo));
    });
  }, [catalogo, busca, filtroCategoria]);


  return (
    <div className="max-w-3xl mx-auto pb-4">
      <GameHeader title={t('items.title')} subtitle={t('items.subtitle')} />

      <section style={{
        marginTop: 12,
        padding: '16px 14px',
        borderRadius: 16,
        background: 'linear-gradient(145deg, rgba(235,225,207,1) 0%, rgba(244,236,223,1) 78%, rgba(239,225,185,0.9) 100%)',
        border: `1px solid ${C.BORDER}`,
        boxShadow: '0 8px 22px rgba(68,51,33,.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
          <div>
            <div className="font-nunito" style={{ color: C.ACCENT_DEEP, fontSize: '.64rem', fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase' }}>{t('items.eyebrow')}</div>
            <h1 className="font-cinzel" style={{ color: C.TEXT_PRIMARY, fontSize: '1.18rem', margin: '5px 0 0' }}>{t('items.title')}</h1>
            <p className="font-nunito" style={{ color: C.TEXT_SECONDARY, fontSize: '.76rem', lineHeight: 1.5, margin: '6px 0 0', maxWidth: 470 }}>{t('items.subtitle_long')}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <ToggleButton active={modo === 'grid'} onClick={() => setModo('grid')}>{t('items.grid')}</ToggleButton>
            <ToggleButton active={modo === 'list'} onClick={() => setModo('list')}>{t('items.list')}</ToggleButton>
          </div>
        </div>

        <div style={{ marginTop: 13, display: 'flex', gap: 8, alignItems: 'center', background: C.BG_INPUT, border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 11, padding: '9px 11px' }}>
          <span style={{ opacity: .72 }}>⌕</span>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder={t('items.search')}
            aria-label={t('items.search')}
            style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', color: C.TEXT_PRIMARY, fontFamily: 'Nunito, sans-serif', fontSize: '.76rem' }}
          />
          {busca ? <button onClick={() => setBusca('')} style={{ border: 0, background: 'transparent', color: C.ACCENT_DEEP, cursor: 'pointer' }}>✕</button> : null}
        </div>

        <div style={{ display: 'flex', gap: 7, marginTop: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {categorias.map(cat => (
            <ToggleButton key={cat} active={filtroCategoria === cat} onClick={() => setFiltroCategoria(cat)}>
              {cat === 'all' ? t('items.all_categories') : cat}
            </ToggleButton>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <div className="font-nunito" style={{ fontSize: '.64rem', color: C.TEXT_MUTED, fontWeight: 800 }}>
            {t('items.count', { count: itens.length })}
          </div>
          <div className="font-nunito" style={{ fontSize: '.62rem', color: C.SUCCESS, fontWeight: 900 }}>
            {t('items.catalog_source_live')}
          </div>
        </div>
      </section>

      {itens.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', padding: '40px 16px', borderRadius: '14px',
          border: `2px dashed ${C.BORDER}`, background: C.BG_CARD,
          marginTop: '12px',
        }}>
          <p style={{ fontSize: '3rem', marginBottom: '10px' }}>🎒</p>
          <p className="font-cinzel font-bold text-base uppercase tracking-wider" style={{ color: C.TEXT_PRIMARY, marginBottom: '6px' }}>
            {busca ? t('items.no_results') : t('items.empty')}
          </p>
          <p className="font-nunito font-semibold text-sm leading-relaxed" style={{ color: C.TEXT_SECONDARY, maxWidth: '300px' }}>
            {busca ? t('items.no_match',{query:busca}) : t('items.empty_help')}
          </p>
        </div>
      ) : modo === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
          {itens.map(item => <ItemTile key={item._id || item.nome} item={item} onClick={() => setSelecionado(item)} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {itens.map(item => <ItemRow key={item._id || item.nome} item={item} onClick={() => setSelecionado(item)} />)}
        </div>
      )}

      {selecionado ? <ItemDetailsModal item={selecionado} onClose={() => setSelecionado(null)} t={t} /> : null}
    </div>
  );
};

export default Itens;
