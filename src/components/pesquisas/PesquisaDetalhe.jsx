import React, { useEffect, useMemo, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { GameInfoTable, GamePanel, GameSectionTitle } from '../shared/GameChrome.jsx';
import { getResearchProgress, saveResearchProgress } from './researchProgress.js';
import { summarizeResearchRange } from './researchTime.js';

function LevelSelect({ label, value, max, min = 0, onChange }) {
  const options = [];
  for (let level = min; level <= max; level += 1) options.push(level);
  return (
    <label style={{ display:'grid', gap:4, flex:1 }}>
      <span style={{ color:'#6d7468', fontSize:'.72rem', fontWeight:850, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</span>
      <select className="game-field" value={value} onChange={event => onChange(Number(event.target.value))}>
        {options.map(level => <option key={level} value={level}>{level === 0 ? '—' : `Nv. ${level}`}</option>)}
      </select>
    </label>
  );
}

export default function PesquisaDetalhe({ slug }) {
  const { t, content } = useI18n();
  const { pesquisas } = useGameData();
  const pesquisa = pesquisas.find(p => p.slug === slug) || null;
  const initial = useMemo(() => pesquisa ? getResearchProgress(slug, pesquisa.nivelMax) : { current:0, target:0 }, [slug, pesquisa]);
  const [current, setCurrent] = useState(initial.current);
  const [target, setTarget] = useState(initial.target);

  useEffect(() => {
    setCurrent(initial.current);
    setTarget(initial.target);
  }, [slug, initial.current, initial.target]);

  if (!pesquisa) return <div style={{ padding:24, textAlign:'center', color:'#a5231b' }}>⚠️ {t('research.not_found')}</div>;

  const updateProgress = (nextCurrent, nextTarget) => {
    const safeCurrent = Math.max(0, Math.min(pesquisa.nivelMax, nextCurrent));
    const safeTarget = Math.max(safeCurrent, Math.min(pesquisa.nivelMax, nextTarget));
    setCurrent(safeCurrent);
    setTarget(safeTarget);
    saveResearchProgress(slug, { current:safeCurrent, target:safeTarget }, pesquisa.nivelMax);
  };

  const range = summarizeResearchRange(pesquisa.niveis, current, target);
  const filledTimes = pesquisa.niveis.filter(nv => String(nv.tempo || '').trim()).length;
  const rows = pesquisa.niveis.map(nv => ({
    key: nv.nivel,
    label: `${nv.nivel <= current ? '✓ ' : ''}${t('common.level')} ${nv.nivel}`,
    value: nv.tempo?.trim() || '—',
  }));

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:20 }}>
      <GamePanel>
        <div className="game-detail-hero" style={{ gridTemplateColumns:'minmax(0,1fr) 92px' }}>
          <div style={{ minWidth:0 }}>
            <h1 className="game-detail-title">{content(pesquisa,'nome')}</h1>
            <div className="game-list-meta" style={{ marginTop:4 }}>
              {pesquisa.categoria} • {t('research.max_level')} {pesquisa.nivelMax}
            </div>
            <p className="game-detail-copy">{content(pesquisa,'descricao') || t('research.no_description')}</p>
          </div>
          <div>
            <div className="game-thumb" style={{ width:92, height:92, fontSize:'2.6rem' }}>{pesquisa.icone || '🔬'}</div>
            <div style={{ marginTop:4, textAlign:'center', fontWeight:750, color:'#48564e', fontSize:'.76rem' }}>
              {current > 0 ? `${t('common.level')} ${current}` : t('research.not_set')}
            </div>
          </div>
        </div>
      </GamePanel>

      <GamePanel style={{ marginTop:9 }}>
        <GameSectionTitle>{t('research.planner')}</GameSectionTitle>
        <div style={{ padding:'11px 12px' }}>
          <div style={{ display:'flex', gap:9 }}>
            <LevelSelect label={t('research.my_level')} value={current} max={pesquisa.nivelMax} onChange={value => updateProgress(value, Math.max(value, target))} />
            <LevelSelect label={t('research.target_level')} value={target} min={current} max={pesquisa.nivelMax} onChange={value => updateProgress(current, value)} />
          </div>

          <div style={{ marginTop:10, padding:'10px 11px', border:'1px solid rgba(76,100,88,.22)', background:'rgba(235,231,205,.72)', borderRadius:4 }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:10 }}>
              <span style={{ color:'#5f6a60', fontSize:'.74rem', fontWeight:800 }}>{t('research.known_time')}</span>
              <strong style={{ color:'#315d57', fontSize:'.9rem' }}>{range.formatted || '—'}</strong>
            </div>
            <div style={{ marginTop:4, color:range.missing ? '#8a6d3a' : '#657467', fontSize:'.72rem', fontWeight:700 }}>
              {range.total === 0
                ? t('research.choose_target')
                : range.missing
                  ? t('research.partial_time',{known:range.known,total:range.total,missing:range.missing})
                  : t('research.complete_time',{count:range.total})}
            </div>
          </div>
        </div>
      </GamePanel>

      <div style={{ marginTop:9 }}>
        <GameSectionTitle aside={t('research.levels_with_time',{shown:filledTimes,total:pesquisa.niveis.length})}>{t('research.level_times')}</GameSectionTitle>
        <GameInfoTable rows={rows} />
      </div>

      {filledTimes < pesquisa.niveis.length ? (
        <div style={{ marginTop:8, color:'#757866', fontSize:'.74rem', lineHeight:1.45, textAlign:'center' }}>
          {t('research.missing_times_note')}
        </div>
      ) : null}
    </div>
  );
}
