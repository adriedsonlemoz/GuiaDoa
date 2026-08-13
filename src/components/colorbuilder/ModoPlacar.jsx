import React, { useMemo, useRef, useState } from 'react';
import { T, C, safeCopy } from './styles.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { PLACAR_CORES_PADRAO } from './data.js';
import CharacterTools from './CharacterTools.jsx';

const CORES_RAPIDAS = [
  'FFD700','FFA500','FF4500','FF1493','FF0000','8A2BE2',
  '1E90FF','00CED1','00FF7F','39FF14','FFFFFF','C0C0C0',
  '000000','8B4513','009639','FEDF00',
];

function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: '0.62rem', color: C.TEXT_MUTED, marginBottom: 5, fontWeight: 700 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        {CORES_RAPIDAS.map(hex => (
          <button key={hex} type="button" onClick={() => onChange(hex)} title={hex} style={{
            width: 23, height: 23, padding: 0, borderRadius: 5, background: `#${hex}`,
            border: value === hex ? `2px solid ${C.BG_HEADER}` : '2px solid rgba(0,0,0,0.08)',
            cursor: 'pointer',
          }} />
        ))}
        <input type="color" value={`#${value}`} onChange={event => onChange(event.target.value.slice(1).toUpperCase())}
          style={{ width: 28, height: 25, padding: 1, borderRadius: 5, border: `1px solid ${C.BORDER_SOFT}`, background: C.BG_INPUT }} />
      </div>
    </div>
  );
}

export default function ModoPlacar({ showToast }) {
  const { t } = useI18n();
  const [timeA, setTimeA] = useState('MID');
  const [timeB, setTimeB] = useState('LEG');
  const [placarA, setPlacarA] = useState('3');
  const [placarB, setPlacarB] = useState('1');
  const [destaque, setDestaque] = useState('none');
  const [showColors, setShowColors] = useState(false);
  const [activeTeam, setActiveTeam] = useState('A');
  const refA = useRef(null);
  const refB = useRef(null);

  const [corTimeA, setCorTimeA] = useState(PLACAR_CORES_PADRAO.timeA);
  const [corTimeB, setCorTimeB] = useState(PLACAR_CORES_PADRAO.timeB);
  const [corPlacar, setCorPlacar] = useState(PLACAR_CORES_PADRAO.placar);
  const [corSeparador, setCorSeparador] = useState(PLACAR_CORES_PADRAO.separador);
  const [corDestaque, setCorDestaque] = useState(PLACAR_CORES_PADRAO.destaque);

  const corA = destaque === 'A' ? corDestaque : corPlacar;
  const corB = destaque === 'B' ? corDestaque : corPlacar;

  const codigo = useMemo(() => (
    `[${corTimeA}]${timeA} ` +
    `[${corA}]${placarA || '0'}` +
    `[${corSeparador}]-` +
    `[${corB}]${placarB || '0'} ` +
    `[${corTimeB}]${timeB}`
  ), [corTimeA, corTimeB, corA, corB, corSeparador, timeA, timeB, placarA, placarB]);

  const insertCharacter = value => {
    const isA = activeTeam === 'A';
    const ref = isA ? refA : refB;
    const current = isA ? timeA : timeB;
    const setter = isA ? setTimeA : setTimeB;
    const el = ref.current;
    const pos = el?.selectionStart ?? current.length;
    setter(current.slice(0, pos) + value + current.slice(pos));
    setTimeout(() => {
      const target = ref.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(pos + value.length, pos + value.length);
    }, 0);
  };

  return (
    <div style={{ ...T.body, paddingBottom: 12 }}>
      <div style={T.card}>
        <div style={T.cardTitle}>1 · {t('builder.score.teams')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 18px 64px 1fr', gap: 5, alignItems: 'center' }}>
          <input ref={refA} value={timeA} onFocus={() => setActiveTeam('A')} onChange={e => setTimeA(e.target.value)}
            aria-label={t('builder.score.team_a')} style={{ ...T.input, minWidth: 0, minHeight: 40, textAlign: 'center', padding: '7px 6px' }} />
          <input value={placarA} onChange={e => setPlacarA(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric"
            aria-label={`${t('builder.score.team_a')} score`} style={{ ...T.input, minWidth: 0, minHeight: 40, textAlign: 'center', fontWeight: 800, padding: '7px 4px' }} />
          <span style={{ textAlign: 'center', fontWeight: 900, color: C.TEXT_MUTED }}>–</span>
          <input value={placarB} onChange={e => setPlacarB(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric"
            aria-label={`${t('builder.score.team_b')} score`} style={{ ...T.input, minWidth: 0, minHeight: 40, textAlign: 'center', fontWeight: 800, padding: '7px 4px' }} />
          <input ref={refB} value={timeB} onFocus={() => setActiveTeam('B')} onChange={e => setTimeB(e.target.value)}
            aria-label={t('builder.score.team_b')} style={{ ...T.input, minWidth: 0, minHeight: 40, textAlign: 'center', padding: '7px 6px' }} />
        </div>

        <div style={{ marginTop: 9, fontSize: '0.63rem', color: C.TEXT_MUTED }}>
          {t('builder.score.inserting_into', { team: activeTeam === 'A' ? (timeA || t('builder.score.team_a')) : (timeB || t('builder.score.team_b')) })}
        </div>
        <CharacterTools onInsert={insertCharacter} compact />
      </div>

      <div style={T.card}>
        <div style={T.cardTitle}>2 · {t('builder.score.highlight')}</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[
            ['none', t('builder.score.highlight_none')],
            ['A', timeA || t('builder.score.team_a')],
            ['B', timeB || t('builder.score.team_b')],
          ].map(([id, label]) => (
            <button key={id} type="button" style={{ ...T.modeTab(destaque === id), minHeight: 36 }} onClick={() => setDestaque(id)}>{label}</button>
          ))}
        </div>

        <button type="button" style={{ ...T.btnOutline, marginTop: 10, height: 32, textTransform: 'none', letterSpacing: 0 }} onClick={() => setShowColors(value => !value)}>
          {showColors ? '−' : '+'} {t('builder.score.customize_colors')}
        </button>

        {showColors && (
          <div style={{ marginTop: 11 }}>
            <ColorPicker label={t('builder.score.team_color',{slot:t('builder.score.team_a'),team:timeA || t('builder.score.team_a')})} value={corTimeA} onChange={setCorTimeA} />
            <ColorPicker label={t('builder.score.team_color',{slot:t('builder.score.team_b'),team:timeB || t('builder.score.team_b')})} value={corTimeB} onChange={setCorTimeB} />
            <ColorPicker label={t('builder.score.number_color')} value={corPlacar} onChange={setCorPlacar} />
            <ColorPicker label={t('builder.score.separator_color')} value={corSeparador} onChange={setCorSeparador} />
            <ColorPicker label={t('builder.score.highlight_color')} value={corDestaque} onChange={setCorDestaque} />
          </div>
        )}
      </div>

      <div style={T.card}>
        <div style={T.cardTitle}>3 · {t('builder.score.result')}</div>
        <div style={{ background: '#1D302E', border: '1px solid #47615D', borderRadius: 7, padding: '17px 10px', textAlign: 'center', fontSize: '1.15rem', fontWeight: 800, overflowWrap: 'anywhere' }}>
          <span style={{ color: `#${corTimeA}` }}>{timeA}</span>{' '}
          <span style={{ color: `#${corA}` }}>{placarA || '0'}</span>
          <span style={{ color: `#${corSeparador}` }}>-</span>
          <span style={{ color: `#${corB}` }}>{placarB || '0'}</span>{' '}
          <span style={{ color: `#${corTimeB}` }}>{timeB}</span>
        </div>
      </div>

      <div style={{
        position: 'sticky', bottom: 0, zIndex: 5,
        margin: '0 -14px -12px', padding: '10px 14px calc(10px + env(safe-area-inset-bottom))',
        background: 'rgba(228,216,180,0.97)', borderTop: `1px solid ${C.BORDER_SOFT}`,
        boxShadow: '0 -5px 14px rgba(47,56,48,0.12)',
      }}>
        <button type="button" style={{ ...T.btnSolid, width: '100%', height: 44 }} onClick={() => safeCopy(codigo, () => showToast(t('builder.score.copied')))}>
          ⎘ {t('builder.score.copy')}
        </button>
      </div>
    </div>
  );
}
