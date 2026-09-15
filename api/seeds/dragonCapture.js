import { SAVANA_SEED } from './campos/savana.js';
import { LAGO_SEED } from './campos/lago.js';
import { FLORESTA_SEED } from './campos/floresta.js';
import { MONTANHA_SEED } from './campos/montanha.js';
import { MORRO_SEED } from './campos/morro.js';

export const DRAGON_CAPTURE_ITEM_COUNT = 100;

const FIELD_NAMES = Object.freeze({
  savana:{ pt:'Savana', en:'Savannah' },
  lago:{ pt:'Lago', en:'Lake' },
  floresta:{ pt:'Floresta', en:'Forest' },
  montanha:{ pt:'Montanha', en:'Mountain' },
  morro:{ pt:'Morro', en:'Hill' },
});

const ALL_FIELDS = [SAVANA_SEED, LAGO_SEED, FLORESTA_SEED, MONTANHA_SEED, MORRO_SEED].flat();
const normalizeDragonId = value => String(value || '').trim().replace(/-/g, '_');

function buildCaptureMap() {
  const map = new Map();
  for (const entry of ALL_FIELDS) {
    for (const reward of entry.recompensas || []) {
      if (reward?.finalidade !== 'obtencao-dragao' || !reward?.relacionadoA) continue;
      const dragonId = normalizeDragonId(reward.relacionadoA);
      const key = `${dragonId}:${reward.codigo}:${entry.subtipo}`;
      if (!map.has(key)) {
        map.set(key, {
          dragonId,
          item:{
            codigo:reward.codigo,
            nome:reward.nome,
            imagem:reward.imagem,
            i18n:reward.i18n || {},
          },
          quantidade:DRAGON_CAPTURE_ITEM_COUNT,
          campo:{
            subtipo:entry.subtipo,
            nome:FIELD_NAMES[entry.subtipo]?.pt || entry.subtipo,
            i18n:{ 'en-US': { nome:FIELD_NAMES[entry.subtipo]?.en || entry.subtipo } },
          },
          niveis:[],
        });
      }
      map.get(key).niveis.push(Number(entry.nivel));
    }
  }

  const out = {};
  for (const capture of map.values()) {
    capture.niveis = [...new Set(capture.niveis)].sort((a,b) => a-b);
    capture.nivelMin = Math.min(...capture.niveis);
    capture.nivelMax = Math.max(...capture.niveis);
    out[capture.dragonId] = capture;
  }
  return Object.freeze(out);
}

export const DRAGON_CAPTURE_MAP = buildCaptureMap();

export const getDragonCapture = dragonId => DRAGON_CAPTURE_MAP[normalizeDragonId(dragonId)] || null;

export function captureSource(capture) {
  if (!capture) return null;
  return {
    modulo:'campos',
    slug:`campo-${capture.campo.subtipo}`,
    nome:`Campo de ${capture.campo.nome}`,
    nivelMin:capture.nivelMin,
    nivelMax:capture.nivelMax,
  };
}
