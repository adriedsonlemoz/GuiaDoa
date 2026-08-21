// Regras canônicas conhecidas no cliente para proteger também o modo offline/cache.
// Número do realm nunca é usado para inferir idade: somente esta lista explícita possui data.
export const CONFIRMED_REALM_OPENINGS = Object.freeze({
  348:'2026-08-12T00:00:00.000Z',
  347:'2026-08-12T00:00:00.000Z',
  346:'2026-08-12T00:00:00.000Z',
  345:'2026-08-12T00:00:00.000Z',
  334:'2025-08-12T00:00:00.000Z',
  333:'2025-08-12T00:00:00.000Z',
  332:'2025-08-12T00:00:00.000Z',
  331:'2025-08-12T00:00:00.000Z',
  330:'2024-08-12T00:00:00.000Z',
  329:'2024-08-12T00:00:00.000Z',
  328:'2024-08-12T00:00:00.000Z',
  327:'2024-08-12T00:00:00.000Z',
});

export function sanitizeRealmCatalog(reinos = []) {
  return (Array.isArray(reinos) ? reinos : []).map(reino => {
    const id = Number(reino?.id);
    const opening = CONFIRMED_REALM_OPENINGS[id] || null;
    const horarios = reino?.horarios && typeof reino.horarios === 'object' ? reino.horarios : {};
    return {
      ...reino,
      aberturaEm:opening,
      horarios:{
        ...horarios,
        zyrvorthian:id === 345 ? '19:00' : '',
      },
    };
  });
}
