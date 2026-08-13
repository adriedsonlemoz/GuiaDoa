import React from 'react';
import { C } from '../../theme.js';
import { levelsOf } from './ilhasUtils.js';

export function Stepper({ value, onMinus, onPlus, disabled, maxed = false }) {
  return (
    <div className="island-stepper" aria-label="quantity control">
      <button type="button" onClick={onMinus} disabled={disabled || value <= 0}>−</button>
      <strong>{value}</strong>
      <button type="button" onClick={onPlus} disabled={disabled || maxed}>+</button>
    </div>
  );
}

export function LevelSelect({ dbEdificios, slug, value, onChange, disabled }) {
  const levels = levelsOf(dbEdificios, slug).filter(row => Number.isFinite(Number(row.nivel)));
  if (!levels.length) return null;
  return (
    <label className="island-level-select">
      <span>Nv.</span>
      <select value={value || levels[0].nivel} onChange={event => onChange(Number(event.target.value))} disabled={disabled}>
        {levels.map(row => <option key={row.nivel} value={row.nivel}>{row.nivel}</option>)}
      </select>
    </label>
  );
}

export function PlannerRow({ icon, title, description, effect, value, levelControl, onMinus, onPlus, disabled, maxed, optional = false, accent }) {
  return (
    <div className="island-planner-row" style={{ '--row-accent': accent || C.ACCENT_DEEP }}>
      <div className="island-planner-icon" aria-hidden="true">{icon}</div>
      <div className="island-planner-copy">
        <div className="island-planner-titleline">
          <strong>{title}</strong>
          {optional ? <span className="island-optional">opcional</span> : null}
        </div>
        {description ? <p>{description}</p> : null}
        {effect ? <span className="island-effect">{effect}</span> : null}
      </div>
      <div className="island-planner-actions">
        {levelControl}
        <Stepper value={value} onMinus={onMinus} onPlus={onPlus} disabled={disabled} maxed={maxed} />
      </div>
    </div>
  );
}

export function SlotMeter({ used, max, label }) {
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0;
  const full = max > 0 && used >= max;
  return (
    <div className="island-slot-meter">
      <div className="island-slot-meter-head">
        <span>{label}</span>
        <strong className={full ? 'is-full' : ''}>{used}/{max}</strong>
      </div>
      <div className="island-slot-track"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
