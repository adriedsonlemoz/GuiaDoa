import { useMemo, useState } from 'react';

const KEY = 'doa_troops_unlock_progress_v1';
const DEFAULT = { fabrica:0, viveiro:0 };

function load() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return DEFAULT; }
}

function sourceKey(source = '') {
  const value = String(source).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if (value.includes('fabrica')) return 'fabrica';
  if (value.includes('viveiro')) return 'viveiro';
  return null;
}

export default function useUnlockProgress(troops) {
  const [levels, setLevels] = useState(load);

  const setLevel = (key, value) => {
    const next = { ...levels, [key]:Math.max(0, Math.min(99, Number(value) || 0)) };
    setLevels(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const status = useMemo(() => {
    const known = troops.filter(t => t?.desbloqueio?.fonte && Number(t?.desbloqueio?.nivel) > 0);
    const available = [];
    const next = [];
    for (const troop of known) {
      const key = sourceKey(troop.desbloqueio.fonte);
      if (!key) continue;
      const current = Number(levels[key]) || 0;
      const required = Number(troop.desbloqueio.nivel) || 0;
      if (current >= required) available.push(troop);
      else next.push({ troop, current, required, missing:required-current, key });
    }
    next.sort((a,b) => a.missing - b.missing || a.required - b.required);
    return { known, available, next };
  }, [troops, levels]);

  return { levels, setLevel, ...status };
}
