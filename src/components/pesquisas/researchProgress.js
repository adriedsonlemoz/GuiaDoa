const STORAGE_KEY = 'doa_research_progress_v1';

function readAll() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

function clampLevel(value, max) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(Number(max) || 0, n));
}

export function getResearchProgress(slug, max = 0) {
  const saved = readAll()[slug] || {};
  const current = clampLevel(saved.current, max);
  const targetBase = clampLevel(saved.target, max);
  const target = Math.max(current, targetBase || Math.min(max, Math.max(1, current + 1)));
  return { current, target };
}

export function saveResearchProgress(slug, progress, max = 0) {
  const all = readAll();
  const current = clampLevel(progress?.current, max);
  const target = Math.max(current, clampLevel(progress?.target, max));
  all[slug] = { current, target };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[slug];
}

export function getAllResearchProgress() {
  return readAll();
}

export { STORAGE_KEY as RESEARCH_PROGRESS_KEY };
