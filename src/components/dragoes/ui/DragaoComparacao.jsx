import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../../hooks/useI18n.jsx';
import { ATTRS_BASE, ATTRS_ELEM, fmtDragaoValor } from '../dragaoCompareConfig.js';
import DragonLevelNavigator from './DragonLevelNavigator.jsx';

const DragaoComparacao = ({ ids, todosDragoes, onRemover }) => {
  const { t, content, locale } = useI18n();
  const dragoes = ids.map(id=>todosDragoes.find(d=>d.id===id)).filter(Boolean);

  const levels = useMemo(() => {
    if (dragoes.length !== 2) return [];
    const [a,b] = dragoes.map(d => new Set((d.niveis || []).map(n=>Number(n.nivel))));
    return [...a].filter(level => b.has(level)).sort((x,y)=>x-y);
  }, [dragoes]);

  const [nivel, setNivel] = useState(null);
  useEffect(() => {
    if (!levels.length) {
      setNivel(null);
      return;
    }
    if (!levels.includes(Number(nivel))) setNivel(levels[0]);
  }, [levels, nivel]);

  if (dragoes.length !== 2) return null;

  const snap = d => (d.niveis || []).find(n=>Number(n.nivel)===Number(nivel)) || null;
  const rows = Number(nivel) >= 51 ? [...ATTRS_BASE,...ATTRS_ELEM] : ATTRS_BASE;
  const snapshots = dragoes.map(snap);

  const comparisons = rows.map(attr => {
    const values = snapshots.map(snapshot => snapshot?.[attr.key] == null ? null : Number(snapshot[attr.key]));
    if (values.some(value => value == null)) return { attr, values, winner:null, diff:null, tie:false };
    if (values[0] === values[1]) return { attr, values, winner:null, diff:0, tie:true };
    const winner = values[0] > values[1] ? 0 : 1;
    return { attr, values, winner, diff:Math.abs(values[0]-values[1]), tie:false };
  });

  const wins = dragoes.map((_, index) => comparisons.filter(item => item.winner === index));
  const ties = comparisons.filter(item => item.tie);

  return (
    <section className="game-panel dragon-compare-panel" style={{ marginTop:8 }}>
      <div className="dragon-compare-head">
        {dragoes.map(d => (
          <div key={d.id} className="dragon-compare-card">
            <button
              type="button"
              className="dragon-compare-remove"
              onClick={()=>onRemover(d.id)}
              aria-label={`${t('dragons.remove_compare')}: ${content(d,'nome')}`}
              title={t('dragons.remove_compare')}
            >✕</button>
            <div className="dragon-compare-portrait-wrap">
              {d.imagem ? <img className="dragon-compare-portrait" src={d.imagem} alt={content(d,'nome')} /> : <div className="dragon-compare-portrait dragon-detail-portrait-fallback">🐉</div>}
            </div>
            <div className="dragon-compare-name">{content(d,'nome')}</div>
          </div>
        ))}
      </div>

      {levels.length ? (
        <>
          <div className="dragon-compare-level-block">
            <DragonLevelNavigator levels={levels} value={nivel} onChange={setNivel} compact label={t('dragons.compare_at_level')} />
            <p>{t('dragons.compare_shared_level_help')}</p>
          </div>

          <div className="dragon-compare-table">
            {comparisons.map(({ attr, values, winner, diff, tie }) => (
              <div className="dragon-compare-row" key={attr.key}>
                <span className="dragon-compare-attr">{attr.icon} {t(attr.labelKey)}</span>
                {dragoes.map((d,index) => {
                  const isWinner = winner === index;
                  return (
                    <div key={d.id} className={`dragon-compare-value${isWinner ? ' is-best' : ''}${tie ? ' is-tie' : ''}`}>
                      <strong>{values[index] == null ? '—' : fmtDragaoValor(values[index], locale)}</strong>
                      {isWinner && diff > 0 ? <small>▲ +{fmtDragaoValor(diff, locale)}</small> : tie ? <small>{t('dragons.tie')}</small> : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="dragon-compare-summary">
            <strong className="dragon-compare-summary-title">{t('dragons.comparison_summary')}</strong>
            {dragoes.map((d,index) => (
              <div className="dragon-compare-summary-row" key={d.id}>
                <span>{content(d,'nome')}</span>
                <b>{wins[index].length ? wins[index].map(item=>t(item.attr.labelKey)).join(' • ') : t('dragons.no_attribute_advantage')}</b>
              </div>
            ))}
            {ties.length ? (
              <div className="dragon-compare-summary-row is-tie">
                <span>{t('dragons.ties')}</span>
                <b>{ties.map(item=>t(item.attr.labelKey)).join(' • ')}</b>
              </div>
            ) : null}
          </div>

          {Number(nivel) >= 51 ? <p className="game-list-copy" style={{ margin:'0 12px 12px' }}>{t('dragons.elemental_from_51')}</p> : null}
        </>
      ) : (
        <div className="dragon-compare-no-level">{t('dragons.no_shared_confirmed_level')}</div>
      )}
    </section>
  );
};

export default DragaoComparacao;
