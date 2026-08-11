import { C } from '../../theme.js';

export { C };

export const T = {
  // ── Layout ────────────────────────────────────────────────────────────────
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(15,25,45,0.82)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    overflowY: 'auto',
  },
  modal: {
    width: '100%', maxWidth: 520,
    background: C.BG_CARD,
    minHeight: '100dvh',
    display: 'flex', flexDirection: 'column',
    position: 'relative',
  },
  header: {
    background: 'linear-gradient(135deg,#1C3A5E,#2A4C72)',
    borderBottom: `1px solid rgba(200,168,74,0.4)`,
    padding: '10px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 10,
  },
  headerTitle: {
    fontFamily: "'Cinzel', serif", fontWeight: 700,
    fontSize: '0.82rem', color: 'rgba(200,168,74,0.9)',
    letterSpacing: '2px', textTransform: 'uppercase',
  },
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  closeBtn: {
    width: 30, height: 30, background: 'transparent',
    border: '1px solid rgba(200,168,74,0.3)', borderRadius: 6,
    color: 'rgba(248,242,224,0.5)', fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  backBtn: {
    width: 30, height: 30, background: 'transparent',
    border: '1px solid rgba(200,168,74,0.3)', borderRadius: 6,
    color: 'rgba(200,168,74,0.7)', fontSize: '0.85rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  goldLine: {
    height: 2,
    background: 'linear-gradient(90deg,transparent,rgba(200,168,74,0.6),transparent)',
  },
  body: {
    flex: 1, padding: '14px 14px 80px', overflowY: 'auto',
  },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: {
    background: C.BG_CARD,
    border: `1.5px solid rgba(200,168,74,0.25)`,
    borderRadius: 12, padding: '12px 14px', marginBottom: 10,
  },
  cardTitle: {
    fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.14em',
    color: C.TEXT_MUTED, marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 6,
  },

  // ── Tipografia ────────────────────────────────────────────────────────────
  secLbl: {
    fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.13em',
    color: C.TEXT_MUTED, marginBottom: 6, marginTop: 4,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  input: {
    flex: 1, background: C.BG_INPUT,
    border: `1.5px solid rgba(200,168,74,0.3)`,
    borderRadius: 8, color: C.TEXT_PRIMARY,
    fontFamily: 'inherit', fontSize: '0.9rem',
    padding: '10px 12px', outline: 'none',
    resize: 'none', minHeight: 44, maxHeight: 110,
    transition: 'border-color 0.2s',
  },

  // ── Botões ────────────────────────────────────────────────────────────────
  btnSolid: {
    background: 'linear-gradient(135deg,#2A4C72,#1C3A5E)',
    color: 'rgba(200,168,74,0.95)',
    border: '1.5px solid rgba(200,168,74,0.45)',
    borderRadius: 8, cursor: 'pointer',
    fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase',
    padding: '0 14px', height: 36,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    fontFamily: 'inherit', transition: 'all 0.14s',
  },
  btnOutline: {
    background: C.BG_INPUT, color: C.TEXT_SECONDARY,
    border: `1.5px solid rgba(200,168,74,0.3)`,
    borderRadius: 8, cursor: 'pointer',
    fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase',
    padding: '0 12px', height: 34,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    fontFamily: 'inherit', transition: 'all 0.14s',
  },

  // ── Tabs ──────────────────────────────────────────────────────────────────
  catTab: (active) => ({
    background: active ? 'linear-gradient(135deg,#2A4C72,#1C3A5E)' : 'transparent',
    border: active ? '1.5px solid rgba(200,168,74,0.5)' : `1.5px solid rgba(200,168,74,0.2)`,
    borderRadius: 5, color: active ? 'rgba(200,168,74,0.95)' : C.TEXT_MUTED,
    fontSize: '0.6rem', padding: '3px 9px', cursor: 'pointer',
    letterSpacing: '0.07em', textTransform: 'uppercase',
    fontFamily: 'inherit', transition: 'all 0.12s',
  }),
  modeTabs: {
    display: 'flex', gap: 4, marginBottom: 12,
    background: C.BG_SECONDARY, borderRadius: 8, padding: 3,
    border: `1.5px solid rgba(200,168,74,0.2)`,
  },
  modeTab: (active) => ({
    flex: 1, background: active ? 'linear-gradient(135deg,#2A4C72,#1C3A5E)' : 'none',
    border: 'none', borderRadius: 6,
    color: active ? 'rgba(200,168,74,0.9)' : C.TEXT_MUTED,
    fontFamily: 'inherit', fontSize: '0.7rem', padding: '8px 6px',
    cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase',
    transition: 'all 0.14s',
  }),

  // ── Elementos inline ──────────────────────────────────────────────────────
  exBtn: {
    background: C.BG_INPUT, border: `1.5px solid rgba(200,168,74,0.25)`,
    borderRadius: 6, color: C.TEXT_SECONDARY,
    fontFamily: 'inherit', fontSize: '0.78rem',
    padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
    transition: 'all 0.12s',
  },
  exSym: {
    width: 30, height: 30, padding: 0, fontSize: '1rem',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: C.BG_INPUT, border: `1.5px solid rgba(200,168,74,0.25)`,
    borderRadius: 6, color: C.TEXT_PRIMARY, cursor: 'pointer', userSelect: 'none',
    flexShrink: 0, transition: 'all 0.12s',
  },
  codeBox: {
    background: '#0F1E35', border: '1.5px solid rgba(200,168,74,0.2)',
    borderRadius: 9, color: '#8ee88e',
    fontFamily: 'monospace', fontSize: '0.79rem',
    padding: '12px 42px 12px 13px',
    wordBreak: 'break-all', lineHeight: 1.8, minHeight: 44, whiteSpace: 'pre-wrap',
  },
  divider: {
    height: 1,
    background: `linear-gradient(90deg,transparent,rgba(200,168,74,0.25),transparent)`,
    margin: '12px 0',
  },
};

// ─── Clipboard helper ─────────────────────────────────────────────────────────
export function safeCopy(text, onSuccess) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
  } else { fallbackCopy(text, onSuccess); }
}
function fallbackCopy(text, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { if (document.execCommand('copy') && onSuccess) onSuccess(); } catch {}
  document.body.removeChild(ta);
}
