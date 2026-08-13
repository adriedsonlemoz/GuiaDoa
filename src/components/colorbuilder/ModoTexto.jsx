import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PRESETS, SUGGEST_PALETTES, SUGGEST_NAMES, FRASES_PRONTAS } from './data.js';
import CharacterTools from './CharacterTools.jsx';
import { T, C, safeCopy } from './styles.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const QUICK_COLORS = [
  '#FFFFFF', '#FF3333', '#FF8C00', '#FFD700', '#39FF14', '#00FA9A',
  '#00BFFF', '#4169E1', '#8A2BE2', '#FF1493', '#A9A9A9', '#1C1C1C',
];

const QUICK_STYLES = [
  { name: 'Arco-íris', index: 5 },
  { name: 'Oceano', index: 4 },
  { name: 'Roxo', index: 3 },
  { name: 'Brasil', index: 12 },
];

function normalizeHex(value, fallback = 'FFFFFF') {
  const hex = String(value || '').replace('#', '').replace(/[^0-9a-f]/gi, '').slice(0, 6).toUpperCase();
  return hex.length === 6 ? hex : fallback;
}

function hexToRgb(hex) {
  const clean = normalizeHex(hex);
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return [r, g, b]
    .map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function mixHex(a, b, amount) {
  const start = hexToRgb(a);
  const end = hexToRgb(b);
  return rgbToHex({
    r: start.r + (end.r - start.r) * amount,
    g: start.g + (end.g - start.g) * amount,
    b: start.b + (end.b - start.b) * amount,
  });
}

function colorAcrossPalette(index, total, palette) {
  const colors = (palette || []).map(normalizeHex).filter(Boolean);
  if (!colors.length) return null;
  if (colors.length === 1 || total <= 1) return colors[0];
  const progress = index / Math.max(1, total - 1);
  const scaled = progress * (colors.length - 1);
  const left = Math.floor(scaled);
  const right = Math.min(colors.length - 1, left + 1);
  return mixHex(colors[left], colors[right], scaled - left);
}

function buildStyledTokens(text, mode, color, gradientPalette) {
  const chars = [...text];
  if (mode === 'single') return chars.map(char => ({ char, color: normalizeHex(color) }));
  if (mode === 'gradient') {
    return chars.map((char, index) => ({ char, color: colorAcrossPalette(index, chars.length, gradientPalette) }));
  }
  return chars.map(char => ({ char, color: null }));
}

function parseCode(codigo) {
  if (!codigo) return [];
  const tokens = [];
  const regex = /\[([0-9A-Fa-f]{6})\]([^\[]*)/g;
  let match;
  let lastIndex = 0;
  while ((match = regex.exec(codigo)) !== null) {
    if (match.index > lastIndex) {
      [...codigo.slice(lastIndex, match.index)].forEach(char => tokens.push({ char, color: null }));
    }
    const [, hex, text] = match;
    [...text].forEach(char => tokens.push({ char, color: hex.toUpperCase() }));
    lastIndex = regex.lastIndex;
  }
  if (!tokens.length) return [...codigo].map(char => ({ char, color: null }));
  if (lastIndex < codigo.length) {
    [...codigo.slice(lastIndex)].forEach(char => tokens.push({ char, color: null }));
  }
  return tokens;
}

function makeCode(tokens) {
  if (!tokens.length) return '';
  let result = '';
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];
    if (!token.color) {
      result += token.char;
      index += 1;
      continue;
    }
    const color = token.color;
    let run = '';
    while (index < tokens.length && tokens[index].color === color) {
      run += tokens[index].char;
      index += 1;
    }
    result += `[${color}]${run}`;
  }
  return result;
}

function loadRecent() {
  try {
    const parsed = JSON.parse(localStorage.getItem('ctb_recent_v2') || '[]');
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function ColorDot({ hex, active, onClick, title, size = 30 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || hex}
      aria-label={title || hex}
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: hex,
        border: active ? `3px solid ${C.BORDER_STRONG}` : '2px solid rgba(74,65,44,0.18)',
        boxShadow: active ? `0 0 0 2px ${C.BG_INPUT}` : 'none',
        cursor: 'pointer',
        padding: 0,
        flex: '0 0 auto',
      }}
    />
  );
}

function TinyButton({ active = false, children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      style={{
        ...T.btnOutline,
        height: 32,
        padding: '0 10px',
        textTransform: 'none',
        letterSpacing: 0,
        fontSize: '0.72rem',
        background: active ? C.BG_HEADER : C.BG_INPUT,
        color: active ? C.TEXT_HEADER : C.TEXT_SECONDARY,
        borderColor: active ? C.BG_HEADER : C.BORDER_SOFT,
      }}
    >
      {children}
    </button>
  );
}

export default function ModoTexto({
  activeColor, setActive,
  hexInput, setHexInput,
  cpicker,
  savedColors, saveColor, removeColor,
  showToast,
}) {
  const { t } = useI18n();
  const inputRef = useRef(null);
  const [inputVal, setInputVal] = useState('');
  const [tokens, setTokens] = useState([]);
  const [styleMode, setStyleMode] = useState('single');
  const [gradientStart, setGradientStart] = useState('00BFFF');
  const [gradientEnd, setGradientEnd] = useState('8A2BE2');
  const [gradientPalette, setGradientPalette] = useState(['00BFFF', '8A2BE2']);
  const [selected, setSelected] = useState(new Set());
  const [paintMode, setPaintMode] = useState('select');
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [previewDark, setPreviewDark] = useState(true);
  const [recent, setRecent] = useState(loadRecent);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    if (styleMode === 'single') {
      setTokens(buildStyledTokens(inputVal, 'single', activeColor, null));
      setSelected(new Set());
    } else if (styleMode === 'gradient') {
      setTokens(buildStyledTokens(inputVal, 'gradient', null, gradientPalette));
      setSelected(new Set());
    }
  }, [inputVal, styleMode, activeColor, gradientPalette]);

  const code = useMemo(() => makeCode(tokens), [tokens]);
  const coloredCount = useMemo(() => tokens.filter(token => token.color).length, [tokens]);

  const setGradient = (start, end) => {
    const a = normalizeHex(start, gradientStart);
    const b = normalizeHex(end, gradientEnd);
    setGradientStart(a);
    setGradientEnd(b);
    setGradientPalette([a, b]);
    setStyleMode('gradient');
  };

  const setGradientPreset = (index) => {
    const palette = SUGGEST_PALETTES[index] || [];
    if (!palette.length) return;
    setGradientStart(normalizeHex(palette[0]));
    setGradientEnd(normalizeHex(palette[palette.length - 1]));
    setGradientPalette(palette.map(normalizeHex));
    setStyleMode('gradient');
    showToast(t('builder.text.style_applied', { name: SUGGEST_NAMES[index] }));
  };

  const handleInput = (next) => {
    setInputVal(next);
    if (styleMode === 'manual') {
      setTokens(previous => [...next].map((char, index) => ({
        char,
        color: previous[index]?.char === char ? previous[index]?.color || null : null,
      })));
      setSelected(new Set());
    }
  };

  const insertInInput = (text) => {
    const el = inputRef.current;
    const pos = el?.selectionStart ?? inputVal.length;
    const next = inputVal.slice(0, pos) + text + inputVal.slice(pos);
    handleInput(next);
    setTimeout(() => {
      const target = inputRef.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(pos + text.length, pos + text.length);
    }, 0);
  };

  const applyModel = (model) => {
    const parsed = parseCode(model.codigo);
    const text = parsed.map(token => token.char).join('');
    setStyleMode('manual');
    setInputVal(text);
    setTokens(parsed);
    setSelected(new Set());
    setShowModels(false);
    showToast(t('builder.text.style_applied', { name: model.label }));
  };

  const rememberCopied = () => {
    if (!code) return;
    const item = { text: inputVal, code, at: Date.now() };
    const next = [item, ...recent.filter(entry => entry.code !== code)].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem('ctb_recent_v2', JSON.stringify(next)); } catch {}
  };

  const copyColored = () => {
    if (!code) {
      showToast(t('builder.text.enter_first'));
      inputRef.current?.focus();
      return;
    }
    safeCopy(code, () => {
      rememberCopied();
      showToast(t('builder.text.code_copied'));
    });
  };

  const loadRecentItem = (item) => {
    const parsed = parseCode(item.code);
    setStyleMode('manual');
    setInputVal(item.text || parsed.map(token => token.char).join(''));
    setTokens(parsed);
    setSelected(new Set());
    setShowRecent(false);
  };

  const applyManualColor = () => {
    if (!selected.size) {
      showToast(t('builder.text.select_one'));
      return;
    }
    setTokens(previous => previous.map((token, index) => (
      selected.has(index) ? { ...token, color: activeColor } : token
    )));
    setSelected(new Set());
    showToast(t('builder.text.applied', { color: activeColor, count: selected.size }));
  };

  const chooseManualColor = (hex) => {
    setActive(hex);
    if (paintMode === 'paint') showToast(t('builder.text.color_active', { color: hex.toUpperCase() }));
  };

  const palette = showMoreColors ? PRESETS : QUICK_COLORS;

  return (
    <div style={{ ...T.body, paddingBottom: 12 }}>
      <div style={{ ...T.card, padding: 12 }}>
        <textarea
          ref={inputRef}
          value={inputVal}
          onChange={event => handleInput(event.target.value)}
          placeholder={t('builder.text.quick_placeholder')}
          rows={3}
          style={{ ...T.input, width: '100%', minHeight: 82, boxSizing: 'border-box' }}
        />

        <CharacterTools onInsert={insertInInput} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          <TinyButton active={showModels} onClick={() => setShowModels(value => !value)}>
            ◇ {t('builder.text.models')}
          </TinyButton>
          {recent.length > 0 && (
            <TinyButton active={showRecent} onClick={() => setShowRecent(value => !value)}>
              ↶ {t('builder.text.recents')}
            </TinyButton>
          )}
        </div>
      </div>

      {showModels && (
        <div style={T.card}>
          <div style={T.cardTitle}>{t('builder.text.ready_phrases')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FRASES_PRONTAS.map(model => {
              const preview = parseCode(model.codigo);
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => applyModel(model)}
                  style={{
                    background: C.BG_INPUT,
                    border: `1px solid ${C.BORDER_SOFT}`,
                    borderRadius: 7,
                    padding: '9px 10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ color: C.TEXT_MUTED, fontSize: '0.67rem', marginBottom: 4 }}>{model.label}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                    {preview.map((token, index) => (
                      <span key={index} style={{ color: token.color ? `#${token.color}` : C.TEXT_PRIMARY }}>{token.char}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showRecent && recent.length > 0 && (
        <div style={T.card}>
          <div style={T.cardTitle}>{t('builder.text.recents')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {recent.map((item, index) => (
              <button
                key={`${item.code}-${index}`}
                type="button"
                onClick={() => loadRecentItem(item)}
                style={{
                  ...T.btnOutline,
                  height: 'auto',
                  minHeight: 36,
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  letterSpacing: 0,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.text || item.code}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={T.card}>
        <div style={{ ...T.cardTitle, marginBottom: 8 }}>{t('builder.text.color_mode')}</div>
        <div style={{ ...T.modeTabs, marginBottom: 10 }}>
          <button type="button" style={T.modeTab(styleMode === 'single')} onClick={() => setStyleMode('single')}>{t('builder.text.mode_single')}</button>
          <button type="button" style={T.modeTab(styleMode === 'gradient')} onClick={() => setStyleMode('gradient')}>{t('builder.text.mode_gradient')}</button>
          <button type="button" style={T.modeTab(styleMode === 'manual')} onClick={() => setStyleMode('manual')}>{t('builder.text.mode_manual')}</button>
        </div>

        {styleMode === 'single' && (
          <>
            {savedColors.length > 0 && (
              <>
                <div style={T.secLbl}>{t('builder.text.saved_colors_short')}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
                  {savedColors.map(hex => (
                    <div key={hex} style={{ position: 'relative' }}>
                      <ColorDot hex={hex} active={normalizeHex(hex) === activeColor} onClick={() => setActive(hex)} />
                      <button
                        type="button"
                        onClick={() => removeColor(hex)}
                        aria-label={t('builder.text.remove_saved')}
                        style={{
                          position: 'absolute', top: -6, right: -6, width: 15, height: 15,
                          border: 0, borderRadius: 8, padding: 0, background: C.ERROR, color: '#fff',
                          fontSize: 8, lineHeight: '15px', cursor: 'pointer',
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {palette.map(hex => (
                <ColorDot key={hex} hex={hex} active={normalizeHex(hex) === activeColor} onClick={() => setActive(hex)} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
              <TinyButton onClick={() => setShowMoreColors(value => !value)}>{showMoreColors ? t('builder.text.less_colors') : t('builder.text.more_colors')}</TinyButton>
              <input
                type="color"
                value={`#${activeColor.toLowerCase()}`}
                onChange={event => setActive(event.target.value)}
                style={{ width: 34, height: 32, border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 6, padding: 2, background: C.BG_INPUT }}
              />
              <input
                type="text"
                value={hexInput}
                maxLength={6}
                onChange={event => {
                  const value = event.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase();
                  setHexInput(value);
                  if (value.length === 6) setActive(value);
                }}
                style={{ ...T.input, minHeight: 32, height: 32, width: 92, flex: '0 0 92px', padding: '5px 8px', boxSizing: 'border-box' }}
                aria-label={t('builder.text.custom_color')}
              />
              <TinyButton onClick={() => {
                const result = saveColor(`#${activeColor}`);
                showToast(result === 'existe' ? t('builder.text.already_saved') : result === 'cheio' ? t('builder.text.palette_full') : t('builder.text.color_saved'));
              }}>＋ {t('builder.text.save_short')}</TinyButton>
            </div>
          </>
        )}

        {styleMode === 'gradient' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <label style={{ fontSize: '0.68rem', color: C.TEXT_MUTED }}>
                {t('builder.text.gradient_start')}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
                  <input
                    type="color"
                    value={`#${gradientStart.toLowerCase()}`}
                    onChange={event => setGradient(event.target.value, gradientEnd)}
                    style={{ width: 42, height: 34, border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 6, padding: 2, background: C.BG_INPUT }}
                  />
                  <span style={{ color: C.TEXT_SECONDARY }}>#{gradientStart}</span>
                </div>
              </label>
              <label style={{ fontSize: '0.68rem', color: C.TEXT_MUTED }}>
                {t('builder.text.gradient_end')}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
                  <input
                    type="color"
                    value={`#${gradientEnd.toLowerCase()}`}
                    onChange={event => setGradient(gradientStart, event.target.value)}
                    style={{ width: 42, height: 34, border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 6, padding: 2, background: C.BG_INPUT }}
                  />
                  <span style={{ color: C.TEXT_SECONDARY }}>#{gradientEnd}</span>
                </div>
              </label>
            </div>
            <div style={T.secLbl}>{t('builder.text.quick_styles')}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {QUICK_STYLES.map(style => (
                <TinyButton key={style.name} onClick={() => setGradientPreset(style.index)}>{style.name}</TinyButton>
              ))}
            </div>
          </>
        )}

        {styleMode === 'manual' && (
          <>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 9 }}>
              <TinyButton active={paintMode === 'select'} onClick={() => setPaintMode('select')}>{t('builder.text.manual_select')}</TinyButton>
              <TinyButton active={paintMode === 'paint'} onClick={() => setPaintMode('paint')}>{t('builder.text.manual_brush')}</TinyButton>
              {paintMode === 'select' && <TinyButton onClick={() => setSelected(new Set(tokens.map((_, index) => index)))}>{t('builder.text.all')}</TinyButton>}
              {paintMode === 'select' && <TinyButton onClick={() => setSelected(new Set())}>{t('builder.text.none')}</TinyButton>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
              {tokens.length === 0 && <span style={{ color: C.TEXT_MUTED, fontSize: '0.72rem' }}>{t('builder.text.enter_first')}</span>}
              {tokens.map((token, index) => {
                const isSelected = selected.has(index);
                return (
                  <button
                    key={`${index}-${token.char}`}
                    type="button"
                    onClick={() => {
                      if (paintMode === 'paint') {
                        setTokens(previous => previous.map((item, itemIndex) => itemIndex === index ? { ...item, color: activeColor } : item));
                      } else {
                        setSelected(previous => {
                          const next = new Set(previous);
                          next.has(index) ? next.delete(index) : next.add(index);
                          return next;
                        });
                      }
                    }}
                    style={{
                      minWidth: 31,
                      minHeight: 34,
                      padding: '4px 6px',
                      borderRadius: 6,
                      border: isSelected ? `2px solid ${C.BG_HEADER}` : `1px solid ${C.BORDER_SOFT}`,
                      background: isSelected ? '#C6D5CC' : C.BG_INPUT,
                      color: token.color ? `#${token.color}` : C.TEXT_PRIMARY,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {token.char === ' ' ? '·' : token.char}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
              {QUICK_COLORS.map(hex => (
                <ColorDot key={hex} hex={hex} active={normalizeHex(hex) === activeColor} onClick={() => chooseManualColor(hex)} size={27} />
              ))}
              <input
                type="color"
                value={`#${activeColor.toLowerCase()}`}
                onChange={event => chooseManualColor(event.target.value)}
                style={{ width: 31, height: 29, border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 6, padding: 2, background: C.BG_INPUT }}
              />
              {paintMode === 'select' && <TinyButton onClick={applyManualColor}>{t('builder.text.apply_selected')}</TinyButton>}
            </div>
          </>
        )}
      </div>

      <div style={T.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ ...T.cardTitle, margin: 0 }}>{t('builder.text.preview')}</div>
          <button
            type="button"
            onClick={() => setPreviewDark(value => !value)}
            style={{ ...T.btnOutline, height: 28, padding: '0 8px', textTransform: 'none', letterSpacing: 0 }}
          >
            {previewDark ? t('builder.text.preview_dark') : t('builder.text.preview_light')}
          </button>
        </div>
        <div style={{
          minHeight: 76,
          borderRadius: 7,
          padding: '14px 12px',
          background: previewDark ? '#1D302E' : '#F4EACB',
          border: previewDark ? '1px solid #47615D' : `1px solid ${C.BORDER_SOFT}`,
          fontSize: '1.05rem',
          lineHeight: 1.6,
          overflowWrap: 'anywhere',
        }}>
          {tokens.length ? tokens.map((token, index) => (
            <span key={index} style={{ color: token.color ? `#${token.color}` : previewDark ? '#F8F2E0' : C.TEXT_PRIMARY }}>
              {token.char}
            </span>
          )) : <span style={{ color: previewDark ? '#A9B8B3' : C.TEXT_FAINT }}>{t('builder.text.preview_empty')}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8, color: C.TEXT_MUTED, fontSize: '0.68rem' }}>
          <span>{t('builder.text.text_count', { count: [...inputVal].length })}</span>
          <span>{t('builder.text.code_count', { count: code.length })}</span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 9 }}>
          <TinyButton active={showCode} onClick={() => setShowCode(value => !value)}>{showCode ? t('builder.text.hide_code') : t('builder.text.show_code')}</TinyButton>
          {coloredCount > 0 && (
            <TinyButton onClick={() => {
              setStyleMode('manual');
              setTokens(previous => previous.map(token => ({ ...token, color: null })));
              setSelected(new Set());
            }}>{t('builder.text.clear_colors')}</TinyButton>
          )}
          {inputVal && (
            <TinyButton onClick={() => {
              setInputVal('');
              setTokens([]);
              setSelected(new Set());
            }}>{t('builder.text.clear_text')}</TinyButton>
          )}
        </div>

        {showCode && (
          <div style={{ ...T.codeBox, marginTop: 9, padding: 10, minHeight: 38 }}>{code || '—'}</div>
        )}
      </div>

      <div style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 5,
        margin: '0 -14px -12px',
        padding: '10px 14px calc(10px + env(safe-area-inset-bottom))',
        background: 'rgba(228,216,180,0.97)',
        borderTop: `1px solid ${C.BORDER_SOFT}`,
        boxShadow: '0 -5px 14px rgba(47,56,48,0.12)',
      }}>
        <button
          type="button"
          onClick={copyColored}
          disabled={!inputVal}
          style={{
            ...T.btnSolid,
            width: '100%',
            height: 44,
            fontSize: '0.78rem',
            opacity: inputVal ? 1 : 0.55,
          }}
        >
          ⎘ {t('builder.text.copy_colored')}
        </button>
      </div>
    </div>
  );
}
