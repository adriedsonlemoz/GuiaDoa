import React, { useMemo, useState } from 'react';

export function calculateDefensePlan(daysInput) {
  const days = Math.max(0.5, Math.min(365, Number(daysInput) || 1));
  const hours = days * 24;
  const treaties = Math.ceil(hours / 12);
  const dragonProtections = treaties * 2;
  return {
    days,
    hours,
    treaties,
    dragonProtections,
    dailyMissionDays:Math.ceil(dragonProtections / 2),
    stone:treaties * 100000,
    gold:treaties * 100000,
    craftHours:treaties * 4,
    astraxShards:treaties * 25,
    astraxEyes:treaties,
    aetherionFeathers:treaties * 20,
    aetherionClaws:treaties,
    dragonPeaceItems:Math.ceil(hours / 72),
    dragonPeaceRubies:Math.ceil(hours / 72) * 40,
  };
}

function Stat({ label, value, note }) {
  return <div className="defcalc-stat"><small>{label}</small><strong>{value}</strong>{note ? <span>{note}</span> : null}</div>;
}

export default function DefenseProtectionCalculator() {
  const [days, setDays] = useState(7);
  const plan = useMemo(() => calculateDefensePlan(days), [days]);
  const fmt = useMemo(() => new Intl.NumberFormat('pt-BR'), []);
  return (
    <section className="defcalc-card">
      <div className="defcalc-head"><span>🧮</span><div><small>PLANEJADOR</small><h2>Quanto preciso para ficar protegido?</h2><p>O cálculo considera proteções usadas em sequência, sem sobreposição.</p></div></div>
      <div className="defcalc-controls">
        <label>Quero me proteger por <input type="number" min="0.5" max="365" step="0.5" value={days} onChange={e => setDays(e.target.value)} /> dias</label>
        <div>{[1,3,7,14].map(value => <button type="button" key={value} className={Number(days)===value?'is-active':''} onClick={() => setDays(value)}>{value}d</button>)}</div>
      </div>

      <div className="defcalc-section-title">⏳ Tratado de Cessar-fogo — 12h</div>
      <div className="defcalc-grid">
        <Stat label="Tratados" value={fmt.format(plan.treaties)} note={`${fmt.format(plan.hours)}h de cobertura`} />
        <Stat label="Proteções do Dragão" value={fmt.format(plan.dragonProtections)} note="2 por Tratado" />
        <Stat label="Dias de missões" value={fmt.format(plan.dailyMissionDays)} note="2 materiais/dia" />
        <Stat label="Pedra" value={fmt.format(plan.stone)} />
        <Stat label="Ouro" value={fmt.format(plan.gold)} />
        <Stat label="Produção sequencial" value={`${fmt.format(plan.craftHours)}h`} note="4h por Tratado" />
      </div>

      <div className="defcalc-z-grid">
        <article><b>🐲 Com Astrax</b><span>{fmt.format(plan.astraxShards)} Estilhaços</span><span>{fmt.format(plan.astraxEyes)} Olhos do Vazio</span></article>
        <article><b>⚡ Com Aetherion</b><span>{fmt.format(plan.aetherionFeathers)} Penas</span><span>{fmt.format(plan.aetherionClaws)} Garras</span></article>
      </div>

      <div className="defcalc-section-title">🐉 Paz do Dragão — 3 dias</div>
      <div className="defcalc-grid defcalc-grid-short">
        <Stat label="Paz do Dragão" value={fmt.format(plan.dragonPeaceItems)} note="72h cada" />
        <Stat label="Se comprar" value={`${fmt.format(plan.dragonPeaceRubies)} Rubis`} note="40 Rubis cada" />
      </div>
      <p className="defcalc-note">A Paz do Dragão também pode ser obtida em arcas/recompensas de torneios, portanto o custo em Rubis só se aplica quando todas as unidades forem compradas.</p>
    </section>
  );
}
