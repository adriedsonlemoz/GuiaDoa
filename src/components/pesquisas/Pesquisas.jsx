import React from 'react';
import { C } from '../../theme.js';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const CATEGORIAS = [
  { id: 'Corpo a Corpo', key:'research.category.melee', icone: '⚔️', cor: '#C85C5C' },
  { id: 'Ataque à Distância', key:'research.category.ranged', icone: '🏹', cor: '#5C7FA3' },
  { id: 'Produção', key:'research.category.production', icone: '🌾', cor: '#5A8A5C' },
  { id: 'Movimento e Construção', key:'research.category.movement', icone: '🏃', cor: '#8B6BAE' },
];

const CatHeader = ({ cat }) => {
  const { t } = useI18n();
  return (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 0 6px',
  }}>
    <div style={{
      flex: 1, height: 1,
      background: `linear-gradient(90deg,transparent,${cat.cor}60)`,
    }} />
    <span style={{
      fontFamily: '"Nunito",sans-serif', fontWeight: 900,
      fontSize: '0.6rem', letterSpacing: '2.5px',
      color: cat.cor, textTransform: 'uppercase',
    }}>
      {cat.icone} {t(cat.key)}
    </span>
    <div style={{
      flex: 1, height: 1,
      background: `linear-gradient(270deg,transparent,${cat.cor}60)`,
    }} />
  </div>
  );
};

const PesquisaCard = ({ pesquisa, cor, onClick }) => {
  const { t, content } = useI18n();
  return (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: C.BG_CARD,
      border: `1.5px solid rgba(200,168,74,0.2)`,
      borderLeft: `3px solid ${cor}`,
      borderRadius: 10,
      padding: '10px 12px',
      cursor: 'pointer', textAlign: 'left', width: '100%',
      transition: 'transform 0.12s, box-shadow 0.12s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = `0 4px 12px ${cor}25`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'none';
    }}
    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
    onTouchEnd={e => { e.currentTarget.style.transform = 'none'; }}
  >
    {/* Ícone */}
    <div style={{
      width: 38, height: 38, borderRadius: 8, flexShrink: 0,
      background: `${cor}14`,
      border: `1.5px solid ${cor}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem',
    }}>
      {pesquisa.icone}
    </div>

    {/* Nome + nível */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: '"Nunito",sans-serif', fontWeight: 800,
        fontSize: '0.82rem', color: C.TEXT_PRIMARY,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {content(pesquisa, 'nome')}
      </div>
      <div style={{
        fontFamily: '"Nunito",sans-serif', fontWeight: 600,
        fontSize: '0.62rem', color: C.TEXT_MUTED, marginTop: 2,
      }}>
        {pesquisa.nivelMax === 1 ? t('research.single_level') : t('research.up_to_level',{level:pesquisa.nivelMax})}
      </div>
    </div>

    {/* Seta */}
    <span style={{ color: C.TEXT_FAINT, fontSize: '0.8rem' }}>›</span>
  </button>
  );
};

const Pesquisas = ({ setRoute }) => {
  const { pesquisas } = useGameData();
  const { t } = useI18n();

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 16 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#1C3A5E,#3B5C8C,#1C3A5E)',
        borderRadius: '12px 12px 0 0', padding: '12px 16px',
        textAlign: 'center', marginBottom: 0,
      }}>
        <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🔬</div>
        <p style={{
          fontFamily: '"Cinzel",serif', fontWeight: 700, fontSize: '0.85rem',
          letterSpacing: '3px', color: '#F8F2E0', margin: 0,
        }}>
          {t('research.subtitle').toUpperCase()}
        </p>
        <p style={{
          fontFamily: '"Nunito",sans-serif', fontWeight: 600,
          fontSize: '0.62rem', color: 'rgba(200,168,74,0.7)',
          letterSpacing: '1.5px', margin: '4px 0 0',
        }}>
          {t('research.available',{count:pesquisas.length})}
        </p>
      </div>

      <div style={{
        background: C.BG_SECONDARY,
        border: `1.5px solid ${C.BORDER}`, borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        padding: '8px 10px 10px',
      }}>
        {CATEGORIAS.map(cat => {
          const lista = pesquisas.filter(p => p.categoria === cat.id);
          if (lista.length === 0) return null;
          return (
            <div key={cat.id}>
              <CatHeader cat={cat} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lista.map(p => (
                  <PesquisaCard
                    key={p.slug}
                    pesquisa={p}
                    cor={cat.cor}
                    onClick={() => setRoute(`pesquisa_${p.slug}`)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pesquisas;
