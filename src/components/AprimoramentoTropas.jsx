import React, { useState } from 'react';
import { C } from '../theme.js';
import { useI18n } from '../hooks/useI18n.jsx';

const RARIDADES = ['Incomum', 'Raro', 'Épico', 'Lendário', 'Mitológico'];
const RARITY_COLORS = { 'Incomum': '#5A8A5C', 'Raro': '#5C7FA3', 'Épico': '#8B6BAE', 'Lendário': '#C87A2C', 'Mitológico': '#A83C2C' };
const CUSTO_BASE_FOSSEIS = [5, 8, 12, 18, 30];
const MULT_F = { 'Incomum': 1, 'Raro': 2, 'Épico': 4, 'Lendário': 8, 'Mitológico': 15 };
const MULT_P = { 'Incomum': 0, 'Raro': 1, 'Épico': 2, 'Lendário': 4, 'Mitológico': 8 };
const MULT_R = { 'Incomum': 0, 'Raro': 0, 'Épico': 1, 'Lendário': 2, 'Mitológico': 4 };

const getCusto = (r, n) => {
  const idx = (n - 1) % 5;
  return { foss: CUSTO_BASE_FOSSEIS[idx] * MULT_F[r], poc: CUSTO_BASE_FOSSEIS[idx] * MULT_P[r], rel: CUSTO_BASE_FOSSEIS[idx] * MULT_R[r] };
};

const ATRIBUTOS = [
  { key:'life', icon:'❤️', cor:'#C85C5C', tipo:'ofensivo' },
  { key:'elemental_attack', icon:'⚡', cor:'#C87A2C', tipo:'ofensivo' },
  { key:'boost', icon:'🔥', cor:'#D08A3C', tipo:'ofensivo', contra:'barrier' },
  { key:'barrier', icon:'🛡️', cor:'#5C7FA3', tipo:'defensivo', contra:'boost' },
  { key:'bombard', icon:'💥', cor:'#8B6BAE', tipo:'ofensivo', contra:'clash', critico:'250%' },
  { key:'clash', icon:'🔰', cor:'#5A8A5C', tipo:'defensivo', contra:'bombard' },
  { key:'block', icon:'🪬', cor:'#5C7FA3', tipo:'defensivo', contra:'break', bloqueio:'60%' },
  { key:'break', icon:'⚔️', cor:'#A83C2C', tipo:'ofensivo', contra:'block' },
];

const CATEGORIAS = Array.from({ length:9 }, (_, index) => ({ cat:index + 1, key:`upgrade.cat.${index + 1}` }));

const REGRAS = [
  { icon:'⚗️', key:'1' }, { icon:'💾', key:'2' }, { icon:'⬆️', key:'3' }, { icon:'⭐', key:'4' }, { icon:'💡', key:'5' },
];

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 my-3">
    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.BORDER})` }} />
    <span style={{ color: C.ACCENT, fontSize: '.72rem' }}>◆</span>
    {label && <span className="font-nunito font-bold text-[0.72rem] tracking-widest whitespace-nowrap" style={{ color: C.TEXT_MUTED }}>{label}</span>}
    {label && <span style={{ color: C.ACCENT, fontSize: '.72rem' }}>◆</span>}
    <div className="flex-1 h-px" style={{ background: `linear-gradient(270deg, transparent, ${C.BORDER})` }} />
  </div>
);

// ── Calculadora ─────────────────────────────────────────────────────────────
const Calculadora = () => {
  const { t, locale } = useI18n();
  const [raridade,  setRaridade]  = useState('Épico');
  const [nivelDe,   setNivelDe]   = useState('1');
  const [nivelAte,  setNivelAte]  = useState('5');
  const [resultado, setResultado] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const calcular = () => {
    const de  = Math.max(1, parseInt(nivelDe)  || 1);
    const ate = Math.max(de, parseInt(nivelAte) || de);
    let totalF = 0, totalP = 0, totalR = 0;
    const detalhe = [];
    for (let n = de; n <= ate; n++) {
      const c = getCusto(raridade, n);
      totalF += c.foss; totalP += c.poc; totalR += c.rel;
      detalhe.push({ nivel: n, ...c });
    }
    setResultado({ totalF, totalP, totalR, detalhe, de, ate, raridade });
    setShowDetail(false);
  };

  const cor = RARITY_COLORS[raridade];

  return (
    <div className="tw-card mb-3" style={{ borderLeft: `5px solid ${cor}` }}>
      <div className="p-3">
        <p className="font-nunito font-black text-sm m-0 mb-3 pb-2" style={{ color: C.TEXT_PRIMARY, borderBottom: `1.5px solid ${C.BORDER_SOFT}` }}>
          {t('upgrade.calc.title')}
        </p>

        {/* Raridade */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {RARIDADES.map(r => (
            <button
              key={r}
              onClick={() => setRaridade(r)}
              className="font-nunito font-bold text-[0.72rem] rounded-full px-2.5 py-1 transition-all border-none cursor-pointer"
              style={{
                border: `1.5px solid ${raridade === r ? RARITY_COLORS[r] : C.BORDER_SOFT}`,
                background: raridade === r ? `${RARITY_COLORS[r]}22` : C.BG_INPUT,
                color: raridade === r ? RARITY_COLORS[r] : C.TEXT_MUTED,
              }}
            >
              {t(`upgrade.rarity.${({ Incomum:'uncommon', Raro:'rare', 'Épico':'epic', 'Lendário':'legendary', 'Mitológico':'mythic' })[r]}`)}
            </button>
          ))}
        </div>

        {/* Inputs nível */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="font-nunito font-bold text-[0.72rem] tracking-wide block mb-1" style={{ color: C.TEXT_MUTED }}>{t('upgrade.calc.current')}</label>
            <input type="number" min={1} max={25} className="tw-input text-center" value={nivelDe} onChange={e => setNivelDe(e.target.value)} />
          </div>
          <div>
            <label className="font-nunito font-bold text-[0.72rem] tracking-wide block mb-1" style={{ color: C.TEXT_MUTED }}>{t('upgrade.calc.target')}</label>
            <input type="number" min={1} max={25} className="tw-input text-center" value={nivelAte} onChange={e => setNivelAte(e.target.value)} />
          </div>
        </div>

        <button className="btn-navy btn-lg w-full mb-3" onClick={calcular}>{t('upgrade.calc.button')}</button>

        {resultado && (
          <div style={{ animation: 'reveal-up 0.3s ease both' }}>
            {/* Totais */}
            <div className="flex gap-2 mb-2.5 flex-wrap">
              {[
                { label: t('upgrade.fossils'),   value: resultado.totalF, cor: C.ATTACK,  icon: '🦴' },
                { label: t('upgrade.potions'),    value: resultado.totalP, cor: C.DEFENSE, icon: '🧪' },
                { label: t('upgrade.relics'), value: resultado.totalR, cor: C.POWER,   icon: '💎' },
              ].map(item => (
                <div key={item.label} className="flex-1 p-2.5 rounded-lg text-center"
                  style={{ background: C.BG_CARD, border: `1.5px solid ${item.cor}55`, borderBottom: `3px solid ${item.cor}`, minWidth: 72 }}>
                  <p className="text-xl leading-none m-0">{item.icon}</p>
                  <p className="font-nunito font-black text-lg leading-tight m-0" style={{ color: item.cor }}>{item.value.toLocaleString(locale)}</p>
                  <p className="font-nunito font-bold text-[0.72rem] uppercase m-0" style={{ color: C.TEXT_MUTED }}>{item.label}</p>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="py-1.5 px-3 mb-2.5 rounded-lg text-center"
              style={{ background: `${cor}15`, border: `1px solid ${cor}44` }}>
              <p className="font-nunito font-black text-[0.78rem] m-0" style={{ color: cor }}>
                {t(`upgrade.rarity.${({ Incomum:'uncommon', Raro:'rare', 'Épico':'epic', 'Lendário':'legendary', 'Mitológico':'mythic' })[resultado.raridade]}`)} · {t('upgrade.level')} {resultado.de} → {resultado.ate} ({resultado.ate - resultado.de + 1})
              </p>
            </div>

            {/* Detalhes accordion */}
            <button
              className="w-full font-nunito font-bold text-[0.72rem] tracking-wider py-2 rounded-lg transition-all border-none cursor-pointer"
              style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}`, color: C.TEXT_MUTED }}
              onClick={() => setShowDetail(v => !v)}
            >
              {showDetail ? '▾' : '▸'} {t('upgrade.details')}
            </button>

            {showDetail && (
              <div className="overflow-x-auto mt-2">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: C.BG_SECONDARY }}>
                      {[t('upgrade.level'), `🦴 ${t('upgrade.fossils')}`, `🧪 ${t('upgrade.potions')}`, `💎 ${t('upgrade.relics')}`].map(h => (
                        <th key={h} className="tw-th text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.detalhe.map((row, i) => (
                      <tr key={row.nivel} style={{ background: i % 2 === 0 ? C.BG_CARD : C.BG_SECONDARY }}>
                        <td className="tw-td text-center font-bold" style={{ color: cor }}>{row.nivel}</td>
                        <td className="tw-td text-center">{row.foss.toLocaleString(locale)}</td>
                        <td className="tw-td text-center">{row.poc.toLocaleString(locale)}</td>
                        <td className="tw-td text-center">{row.rel.toLocaleString(locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────
const AprimoramentoTropas = () => {
  const { t } = useI18n();
  return (
  <div className="max-w-2xl mx-auto pb-4" style={{ animation: 'reveal-up 0.4s ease both' }}>

    {/* Header */}
    <div className="tw-card text-center px-4 py-3 mb-3 relative">
      <span className="absolute top-1.5 left-2" style={{ color: C.ACCENT, fontSize: 11, opacity: 0.7 }}>◆</span>
      <span className="absolute top-1.5 right-2" style={{ color: C.ACCENT, fontSize: 11, opacity: 0.7 }}>◆</span>
      <p className="font-nunito font-bold text-xs tracking-widest uppercase m-0" style={{ color: C.TEXT_PRIMARY }}>{t('upgrade.title')}</p>
      <p className="font-nunito italic text-[0.72rem] m-0 mt-0.5" style={{ color: C.TEXT_MUTED }}>{t('upgrade.subtitle')}</p>
    </div>

    <SectionDivider label={t('upgrade.calculator')} />
    <Calculadora />

    <SectionDivider label={t('upgrade.how')} />
    <div className="grid grid-cols-1 gap-2 mb-3">
      {REGRAS.map((r, i) => (
        <div key={i} className="flex gap-2.5 items-start p-3 rounded-lg"
          style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}`, borderLeft: `4px solid ${C.ACCENT}` }}>
          <span className="text-xl leading-none shrink-0 mt-0.5">{r.icon}</span>
          <div>
            <p className="font-nunito font-black text-[0.82rem] m-0 mb-0.5" style={{ color: C.TEXT_PRIMARY }}>{t(`upgrade.rule.${r.key}.title`)}</p>
            <p className="font-nunito text-[0.75rem] font-semibold leading-snug m-0" style={{ color: C.TEXT_SECONDARY }}>{t(`upgrade.rule.${r.key}.text`)}</p>
          </div>
        </div>
      ))}
    </div>

    <SectionDivider label={t('upgrade.attributes')} />
    <div className="mb-3 space-y-2">
      {ATRIBUTOS.map(attr => (
        <div key={attr.key} className="p-3 rounded-lg" style={{ border: `1.5px solid ${attr.cor}44`, borderLeft: `4px solid ${attr.cor}`, background: C.BG_CARD }}>
          <div className="flex items-start gap-2">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center text-lg rounded-lg"
              style={{ background: `${attr.cor}18`, border: `1.5px solid ${attr.cor}44` }}>
              {attr.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="font-nunito font-black text-[0.85rem]" style={{ color: attr.cor }}>{t(`upgrade.attr.${attr.key}.name`)}</span>
                <span className="font-nunito font-bold text-[0.72rem] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: attr.tipo === 'ofensivo' ? '#A83C2C22' : '#5C7FA322',
                    color: attr.tipo === 'ofensivo' ? '#A83C2C' : '#5C7FA3',
                    border: `1px solid ${attr.tipo === 'ofensivo' ? '#A83C2C44' : '#5C7FA344'}`,
                  }}>
                  {t(attr.tipo === 'ofensivo' ? 'upgrade.offensive' : 'upgrade.defensive')}
                </span>
                {attr.critico && <span className="font-nunito font-bold text-[0.72rem] px-1.5 py-0.5 rounded-full" style={{ background: '#8B6BAE22', color: '#8B6BAE', border: '1px solid #8B6BAE44' }}>{t('upgrade.critical',{value:attr.critico})}</span>}
                {attr.bloqueio && <span className="font-nunito font-bold text-[0.72rem] px-1.5 py-0.5 rounded-full" style={{ background: '#5C7FA322', color: '#5C7FA3', border: '1px solid #5C7FA344' }}>{t('upgrade.blocks',{value:attr.bloqueio})}</span>}
              </div>
              <p className="font-nunito font-semibold text-[0.75rem] leading-snug m-0 mb-1" style={{ color: C.TEXT_SECONDARY }}>{t(`upgrade.attr.${attr.key}.desc`)}</p>
              {attr.contra && (
                <p className="font-nunito text-[0.72rem] m-0">
                  <span style={{ color: C.TEXT_MUTED }}>{t('upgrade.countered_by')} </span>
                  <span className="font-black" style={{ color: C.ACCENT_DEEP }}>{t(`upgrade.attr.${attr.contra}.name`)}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    <SectionDivider label={t('upgrade.categories')} />
    <div className="grid grid-cols-1 gap-2 mb-3">
      {CATEGORIAS.map(cat => (
        <div key={cat.cat} className="p-3 rounded-lg" style={{ border: `1px solid ${C.BORDER_SOFT}`, background: C.BG_SECONDARY }}>
          <span className="inline-block font-nunito font-black text-[0.72rem] px-2 py-0.5 rounded mb-1.5"
            style={{ background: C.ACCENT, color: '#FFF8EE' }}>
            {t('upgrade.category',{value:cat.cat})}
          </span>
          <p className="font-nunito font-semibold text-[0.78rem] leading-snug m-0" style={{ color: C.TEXT_SECONDARY }}>{t(cat.key)}</p>
        </div>
      ))}
    </div>

    {/* Aviso */}
    <div className="p-3 rounded-xl" style={{ border: `1.5px dashed ${C.WARNING}`, background: `${C.WARNING}10` }}>
      <div className="flex gap-2.5 items-start">
        <span className="text-2xl shrink-0">⚠️</span>
        <div>
          <p className="font-nunito font-black text-[0.82rem] m-0 mb-0.5" style={{ color: C.WARNING }}>{t('upgrade.warning_title')}</p>
          <p className="font-nunito font-semibold text-[0.75rem] leading-snug m-0" style={{ color: C.TEXT_SECONDARY }}>
            {t('upgrade.warning_text')}
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AprimoramentoTropas;
