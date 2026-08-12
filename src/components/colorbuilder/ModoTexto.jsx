import React, { useState, useRef } from 'react';
import { PRESETS, SUGGEST_PALETTES, SUGGEST_NAMES, KAOMOJI, ASCII_EM, SYM_CATS, FRASES_PRONTAS } from './data.js';
import { T, C, safeCopy } from './styles.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const ABAS = [
  { id:'texto', key:'builder.text.tab.text' },
  { id:'emoticons', key:'builder.text.tab.emoticons' },
  { id:'simbolos', key:'builder.text.tab.symbols' },
];

export default function ModoTexto({
  activeColor, setActive,
  hexInput, setHexInput,
  cpicker, setCpicker,
  savedColors, saveColor, removeColor,
  showToast,
}) {
  const { t } = useI18n();
  const [tokens,     setTokens]     = useState([]);
  const [selected,   setSelected]   = useState(new Set());
  const [paintMode,  setPaintMode]  = useState('select');
  const [inputVal,   setInputVal]   = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [aba,        setAba]        = useState('texto');
  const [symCat,     setSymCat]     = useState(0);
  const inputRef = useRef(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const insertInInput = (text, switchToTexto = false) => {
    const el = inputRef.current;
    if (!el) {
      setInputVal(v => v + text);
      if (switchToTexto) setAba('texto');
      return;
    }
    const pos = el.selectionStart ?? inputVal.length;
    const next = inputVal.slice(0, pos) + text + inputVal.slice(pos);
    setInputVal(next);
    // Muda aba DEPOIS de atualizar o valor; foca e reposiciona cursor no próximo tick
    if (switchToTexto) setAba('texto');
    setTimeout(() => {
      const target = inputRef.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(pos + text.length, pos + text.length);
    }, 0);
  };

  const parseText = () => {
    if (!inputVal.trim()) return;
    // Se já existem cores aplicadas e o texto mudou, avisa antes de sobrescrever
    const temCores = tokens.some(t => t.color);
    const textoAtual = tokens.map(t => t.char).join('');
    if (temCores && textoAtual !== inputVal) {
      if (!window.confirm(t('builder.text.remount_confirm'))) return;
    }
    setTokens([...inputVal].map(c => ({ char: c, color: null })));
    setSelected(new Set());
  };

  // Decodifica um código pronto no formato [HEX]texto[HEX2]texto2... em tokens
  const parseCodigo = (codigo) => {
    const novosTokens = [];
    const regex = /\[([0-9A-Fa-f]{6})\]([^\[]*)/g;
    let match;
    while ((match = regex.exec(codigo)) !== null) {
      const [, hex, texto] = match;
      [...texto].forEach(char => novosTokens.push({ char, color: hex.toUpperCase() }));
    }
    return novosTokens;
  };

  const aplicarFrasePronta = (frase) => {
    const temCoresManuais = tokens.some(t => t.color) && tokens.map(t => t.char).join('') !== '';
    if (temCoresManuais && !window.confirm(t('builder.text.replace_confirm'))) return;
    const novosTokens = parseCodigo(frase.codigo);
    setTokens(novosTokens);
    setInputVal(novosTokens.map(t => t.char).join(''));
    setSelected(new Set());
    showToast(t('builder.text.style_applied',{name:frase.label}));
  };

  const getCode = () => {
    if (!tokens.length) return '';
    let result = '', i = 0;
    while (i < tokens.length) {
      const tk = tokens[i];
      if (!tk.color) { result += tk.char; i++; }
      else {
        const col = tk.color; let run = '';
        while (i < tokens.length && tokens[i].color === col) { run += tokens[i].char; i++; }
        result += '[' + col + ']' + run;
      }
    }
    return result;
  };

  const toggleToken = (i) => setSelected(prev => {
    const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n;
  });
  const selectAll  = () => setSelected(new Set(tokens.map((_, i) => i)));
  const selectNone = () => setSelected(new Set());
  const invertSel  = () => setSelected(new Set(tokens.map((_, i) => i).filter(i => !selected.has(i))));
  const paintToken = (i) => setTokens(prev => prev.map((tk, j) => j === i ? { ...tk, color: activeColor } : tk));

  const applyColor = () => {
    if (!selected.size) { showToast(t('builder.text.select_one')); return; }
    setTokens(prev => prev.map((tk, i) => selected.has(i) ? { ...tk, color: activeColor } : tk));
    showToast(t('builder.text.applied',{color:activeColor,count:selected.size}));
    setSelected(new Set());
  };

  const applySuggest = (pi) => {
    const pal = SUGGEST_PALETTES[pi];
    if (!tokens.length) {
      if (!inputVal.trim()) {
        showToast(t('builder.text.enter_first'));
        inputRef.current?.focus();
        return;
      }
      setTokens([...inputVal].map((c, i) => ({ char: c, color: pal[i % pal.length] })));
    } else {
      setTokens(prev => prev.map((tk, i) => ({ ...tk, color: pal[i % pal.length] })));
    }
    setSelected(new Set());
    showToast(t('builder.text.style_applied',{name:SUGGEST_NAMES[pi]}));
  };

  const code = getCode();
  const coloredCount = tokens.filter(t => t.color).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={T.body}>

      {/* ── ABAS ─────────────────────────────────────────────────────────── */}
      <div style={{ ...T.modeTabs, marginBottom: 12 }}>
        {ABAS.map(a => (
          <button key={a.id} style={T.modeTab(aba === a.id)} onClick={() => setAba(a.id)}>
            {t(a.key)}
          </button>
        ))}
      </div>

      {/* ── PAINEL: TEXTO ────────────────────────────────────────────────── */}
      {aba === 'texto' && (
        <div style={T.card}>
          <div style={T.cardTitle}><span style={{ color: C.ACCENT }}>✏️</span> {t('builder.text.input_title')}</div>

          {/* Sugestões */}
          <div style={T.secLbl}>{t('builder.text.auto_colors')}</div>
          <p style={{ fontSize: '0.62rem', color: C.TEXT_FAINT, margin: '0 0 8px' }}>
            Digite seu texto abaixo e clique num estilo para colorir automaticamente
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {SUGGEST_PALETTES.map((pal, pi) => (
              <button key={pi}
                style={{ ...T.exBtn, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 7 }}
                onClick={() => applySuggest(pi)}
              >
                <span>{'｡♡‿♡｡'.split('').map((ch, i) => (
                  <span key={i} style={{ color: '#' + pal[i % pal.length] }}>{ch}</span>
                ))}</span>
                <span style={{ fontSize: '0.72rem' }}>{SUGGEST_NAMES[pi]}</span>
              </button>
            ))}
          </div>

          {/* Frases prontas */}
          <div style={T.secLbl}>{t('builder.text.ready_phrases')}</div>
          <p style={{ fontSize: '0.62rem', color: C.TEXT_FAINT, margin: '0 0 8px' }}>
            Textos já coloridos para comemorações e general — clique para usar
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {FRASES_PRONTAS.map(frase => {
              const tokensPreview = parseCodigo(frase.codigo);
              return (
                <button key={frase.id}
                  onClick={() => aplicarFrasePronta(frase)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    background: C.BG_SECONDARY, border: `1.5px solid rgba(200,168,74,0.2)`,
                    borderRadius: 9, padding: '8px 12px', cursor: 'pointer',
                    transition: 'all 0.13s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,168,74,0.45)'; e.currentTarget.style.background = C.BG_INPUT; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,168,74,0.2)'; e.currentTarget.style.background = C.BG_SECONDARY; }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.62rem', color: C.TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                      {frase.label}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                      {tokensPreview.map((tk, i) => (
                        <span key={i} style={{ color: '#' + tk.color }}>{tk.char}</span>
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: C.TEXT_FAINT, flexShrink: 0 }}>→</span>
                </button>
              );
            })}
          </div>

          {/* Campo */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
            <textarea ref={inputRef} value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); parseText(); } }}
              placeholder={t('builder.text.placeholder')}
              rows={2} style={T.input}
            />
            <button style={{ ...T.btnSolid, height: 44, padding: '0 16px' }} onClick={parseText}>
              → Montar
            </button>
          </div>
          <p style={{ fontSize: '0.67rem', color: C.TEXT_MUTED, marginTop: 6 }}>
            {t('builder.text.input_help')}
          </p>
        </div>
      )}

      {/* ── PAINEL: EMOTICONS ────────────────────────────────────────────── */}
      {aba === 'emoticons' && (
        <div style={T.card}>
          <div style={T.cardTitle}><span style={{ color: C.ACCENT }}>ʕ•ᴥ•ʔ</span> {t('builder.kaomoji.title')}</div>
          <p style={{ fontSize: '0.67rem', color: C.TEXT_MUTED, marginBottom: 10, lineHeight: 1.6 }}>
            Clique para inserir no campo de texto e depois monte para colorir.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
            {KAOMOJI.map((k, i) => (
              <button key={i} style={T.exBtn}
                onClick={() => { insertInInput(k, true); showToast(t('builder.inserted',{value:k})); }}
              >{k}</button>
            ))}
          </div>

          <div style={T.divider} />

          <div style={{ ...T.cardTitle, marginTop: 10 }}><span style={{ color: C.ACCENT }}>:-)</span> {t('builder.ascii.title')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {ASCII_EM.map((e, i) => (
              <button key={i} style={T.exBtn}
                onClick={() => { insertInInput(e, true); showToast(t('builder.inserted',{value:e})); }}
              >{e}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── PAINEL: SÍMBOLOS ─────────────────────────────────────────────── */}
      {aba === 'simbolos' && (
        <div style={T.card}>
          <div style={T.cardTitle}><span style={{ color: C.ACCENT }}>✦</span> {t('builder.symbols.title')}</div>
          <p style={{ fontSize: '0.67rem', color: C.TEXT_MUTED, marginBottom: 10, lineHeight: 1.6 }}>
            Clique para inserir no campo de texto e depois monte para colorir.
          </p>

          {/* Tabs de categoria */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {SYM_CATS.map((cat, i) => (
              <button key={i} style={T.catTab(symCat === i)} onClick={() => setSymCat(i)}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grade de símbolos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {SYM_CATS[symCat].s.map((s, i) => (
              <button key={i} style={T.exSym}
                onClick={() => { insertInInput(s, true); showToast(t('builder.inserted',{value:s})); }}
                title={t('builder.symbols.copy_title',{value:s})}
              >{s}</button>
            ))}
          </div>
          <p style={{ fontSize: '0.62rem', color: C.TEXT_FAINT, marginTop: 10, textAlign: 'right' }}>
            {t('builder.symbols.count',{count:SYM_CATS[symCat].s.length})}
          </p>
        </div>
      )}

      {/* ── EDITOR DE TOKENS (sempre visível após montar, em qualquer aba) ── */}
      {tokens.length > 0 && (
        <div style={T.card}>
          <div style={{ ...T.cardTitle, justifyContent: 'space-between' }}>
            <span><span style={{ color: C.ACCENT }}>🎨</span> {t('builder.text.paint_title')}</span>
            <span style={{ fontSize: '0.65rem', color: C.TEXT_MUTED, textTransform: 'none', letterSpacing: 0 }}>
              {tokens.length} chars · {coloredCount} coloridos
            </span>
          </div>

          {/* Modo pintura */}
          <div style={T.modeTabs}>
            <button style={T.modeTab(paintMode === 'select')} onClick={() => setPaintMode('select')}>{t('builder.text.select_apply')}</button>
            <button style={T.modeTab(paintMode === 'paint')}  onClick={() => setPaintMode('paint')}>{t('builder.text.paint_letter')}</button>
          </div>

          {paintMode === 'select' && (
            <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
              <button style={T.btnOutline} onClick={selectAll}>{t('builder.text.all')}</button>
              <button style={T.btnOutline} onClick={selectNone}>{t('builder.text.none')}</button>
              <button style={T.btnOutline} onClick={invertSel}>{t('builder.text.invert')}</button>
            </div>
          )}

          {paintMode === 'paint' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px',
              background: 'rgba(42,76,114,0.15)', border: '1.5px solid rgba(200,168,74,0.25)',
              borderRadius: 9, marginBottom: 10, fontSize: '0.73rem', color: C.TEXT_SECONDARY,
            }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#' + activeColor, border: '2px solid rgba(200,168,74,0.3)', flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>#{activeColor}</span>
              <span style={{ opacity: 0.7 }}>{t('builder.text.click_paint')}</span>
            </div>
          )}

          {/* Grid de tokens */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '2px 0 8px' }}>
            {tokens.map((tk, i) => {
              const isSel = selected.has(i);
              return (
                <div key={i}
                  onClick={() => paintMode === 'paint' ? paintToken(i) : toggleToken(i)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    background: isSel ? 'rgba(42,76,114,0.25)' : C.BG_SECONDARY,
                    border: isSel ? `2px solid ${C.ACCENT}` : `2px solid rgba(200,168,74,0.2)`,
                    borderRadius: 7, padding: '6px 6px 4px',
                    cursor: 'pointer', userSelect: 'none', minWidth: 32,
                    transition: 'all 0.1s', position: 'relative',
                    boxShadow: isSel ? `0 0 0 3px rgba(200,168,74,0.18)` : 'none',
                    transform: isSel ? 'translateY(-2px)' : 'none',
                  }}
                >
                  {isSel && (
                    <span style={{
                      position: 'absolute', top: -7, right: -7,
                      width: 14, height: 14, background: C.ACCENT,
                      color: '#fff', borderRadius: '50%',
                      fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                    }}>✓</span>
                  )}
                  <span style={{ fontSize: '1.1rem', lineHeight: 1, color: tk.color ? '#' + tk.color : C.TEXT_PRIMARY }}>
                    {tk.char === ' ' ? '·' : tk.char}
                  </span>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: tk.color ? '#' + tk.color : 'rgba(200,168,74,0.2)', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>

          <div style={T.divider} />

          {/* Cor ativa + aplicar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            background: C.BG_SECONDARY, border: `1.5px solid rgba(200,168,74,0.2)`,
            borderRadius: 9, marginBottom: 12, flexWrap: 'wrap',
          }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: '#' + activeColor, border: '2px solid rgba(200,168,74,0.4)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.83rem', color: C.TEXT_PRIMARY, fontWeight: 500, flex: 1 }}>#{activeColor}</span>
            {paintMode === 'select' && (
              <button style={T.btnSolid} onClick={applyColor}>{t('builder.text.apply_selected')}</button>
            )}
          </div>

          {/* Paleta de cores */}
          <div style={T.secLbl}>{t('builder.text.palette')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {PRESETS.map((hex, i) => {
              const isActive = hex.replace('#', '').toUpperCase() === activeColor;
              return (
                <div key={'preset-' + i}
                  onClick={() => { setActive(hex); showToast(t('builder.text.color_active',{color:hex.toUpperCase()})); }}
                  title={hex}
                  style={{
                    width: 24, height: 24, borderRadius: 6, background: hex,
                    flexShrink: 0, cursor: 'pointer',
                    border: isActive ? `2.5px solid ${C.ACCENT}` : '2.5px solid transparent',
                    boxShadow: isActive ? `0 0 0 2px rgba(200,168,74,0.5)` : 'none',
                    transition: 'all 0.1s',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              );
            })}
          </div>

          {savedColors.length > 0 && (
            <>
              <div style={T.secLbl}>{t('builder.text.saved_colors')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                {savedColors.map((hex, i) => {
                  const isActive = hex.replace('#', '').toUpperCase() === activeColor;
                  return (
                    <div key={'saved-' + i}
                      style={{ position: 'relative', flexShrink: 0 }}
                    >
                      <div
                        onClick={() => { setActive(hex); showToast(t('builder.text.color_active',{color:hex.toUpperCase()})); }}
                        title={hex}
                        style={{
                          width: 24, height: 24, borderRadius: 6, background: hex,
                          cursor: 'pointer',
                          border: isActive ? `2.5px solid ${C.ACCENT}` : '2.5px solid transparent',
                          boxShadow: isActive ? `0 0 0 2px rgba(200,168,74,0.5)` : 'none',
                          outline: '2px dashed rgba(200,168,74,0.4)',
                          outlineOffset: 2, transition: 'all 0.1s',
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                        }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeColor(hex); showToast(t('builder.text.color_removed')); }}
                        title={t('builder.text.remove_saved')}
                        style={{
                          position: 'absolute', top: -7, right: -7,
                          width: 15, height: 15, borderRadius: '50%',
                          background: C.ERROR, color: '#fff', border: 'none',
                          fontSize: 8, fontWeight: 900, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          lineHeight: 1, padding: 0,
                        }}
                      >✕</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Cor personalizada */}
          <div style={T.secLbl}>{t('builder.text.custom_color')}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="color" value={cpicker}
              onChange={e => setActive(e.target.value.replace('#', ''))}
              style={{ width: 38, height: 32, border: `1.5px solid rgba(200,168,74,0.3)`, borderRadius: 6, cursor: 'pointer', padding: 2, background: C.BG_INPUT }}
            />
            <input type="text" value={hexInput} maxLength={7} placeholder="C4A9FF"
              onChange={e => {
                const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
                setHexInput(v); if (v.length === 6) setActive(v);
              }}
              style={{ ...T.input, width: 100, minHeight: 32, fontSize: '0.82rem', flex: 'none' }}
            />
            <button style={T.btnOutline}
              onClick={() => { if (hexInput.length === 6) { setActive(hexInput); showToast(t('builder.text.color_active',{color:'#'+hexInput})); } else showToast(t('builder.text.invalid_hex')); }}
            >{t('builder.text.define')}</button>
            <button title={t('builder.text.save_palette')}
              onClick={() => {
                const r = saveColor('#' + activeColor);
                if (r === 'existe') showToast(t('builder.text.already_saved'));
                else if (r === 'cheio') showToast(t('builder.text.palette_full'));
                else showToast(t('builder.text.color_saved'));
              }}
              style={{ ...T.btnOutline, width: 32, padding: 0, fontSize: '1.1rem' }}
            >+</button>
          </div>
        </div>
      )}

      {/* ── RESULTADO ────────────────────────────────────────────────────── */}
      {tokens.length > 0 && (
        <div style={T.card}>
          <div style={T.cardTitle}><span style={{ color: C.ACCENT }}>③</span> {t('builder.text.result')}</div>

          {/* Preview colorido */}
          <div style={{ fontSize: '1.3rem', lineHeight: 2, wordBreak: 'break-all', padding: '2px 0 4px' }}>
            {tokens.map((tk, i) => (
              <span key={i} style={{ color: tk.color ? '#' + tk.color : C.TEXT_SECONDARY, fontWeight: tk.color ? 600 : 400 }}>
                {tk.char}
              </span>
            ))}
          </div>

          <div style={T.divider} />

          <div style={T.secLbl}>{t('builder.text.generated_code')}</div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <div style={T.codeBox}>{code}</div>
            <button
              onClick={() => safeCopy(code, () => { setCodeCopied(true); setTimeout(() => setCodeCopied(false), 1800); })}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: '#1A2E4A', border: '1.5px solid rgba(200,168,74,0.3)',
                borderRadius: 6, color: codeCopied ? '#8ee88e' : 'rgba(200,168,74,0.6)',
                fontSize: '0.9rem', width: 28, height: 28,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title={t('builder.copy_code')}
            >{codeCopied ? '✓' : '⎘'}</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            <button style={T.btnSolid} onClick={() => safeCopy(code, () => showToast(t('builder.text.code_copied')))}>{t('builder.text.copy_code')}</button>
            <button style={T.btnOutline} onClick={() => safeCopy(tokens.map(t => t.char).join(''), () => showToast(t('builder.text.plain_copied')))}>{t('builder.text.plain')}</button>
            <button style={T.btnOutline} onClick={() => {
              if (!window.confirm(t('builder.text.remove_colors_confirm'))) return;
              setTokens(prev => prev.map(tk => ({ ...tk, color: null })));
              setSelected(new Set());
              showToast(t('builder.text.colors_removed'));
            }}>{t('builder.text.clear_colors')}</button>
            <button style={T.btnOutline} onClick={() => {
              // Volta para a aba de digitação, mantendo o progresso atual intacto
              setAba('texto');
            }}>{t('builder.text.edit')}</button>
            <button style={{ ...T.btnOutline, color: C.ERROR, borderColor: 'rgba(168,60,44,0.35)' }}
              onClick={() => {
                if (!window.confirm(t('builder.text.restart_confirm'))) return;
                setTokens([]); setSelected(new Set()); setInputVal(''); showToast(t('builder.text.restarted'));
              }}>
              ✕ Recomeçar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
