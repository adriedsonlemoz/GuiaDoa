import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { COR, COR_DRK, SUGESTOES } from './config.js';
import { MessageBubble as Bolha, TypingBubble as Digitando } from './MessageBubble.jsx';

const AssistenteModal = ({ onClose, mensagens, loading, pensando, sugestoes, erro, onEnviar, onLimpar, onReenviar }) => {
  const { t } = useI18n();
  const [input, setInput]   = useState('');
  const bottomRef           = useRef(null);
  const inputRef            = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [mensagens, loading]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 150); }, []);

  const enviar = useCallback((texto) => {
    const q = (texto || input).trim();
    if (!q || loading) return;
    setInput('');
    onEnviar(q);
  }, [input, loading, onEnviar]);

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:100,
        background:'rgba(0,0,0,0.75)',
        backdropFilter:'blur(4px)',
        display:'flex', alignItems:'flex-end', justifyContent:'center',
        padding:'0',
        animation:'fade-in 0.2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%', maxWidth:520,
          height:'92dvh',
          display:'flex', flexDirection:'column',
          borderRadius:'20px 20px 0 0',
          overflow:'hidden',
          background: C.BG_MAIN,
          border:`1.5px solid ${COR}55`,
          borderBottom:'none',
          boxShadow:`0 -8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${COR}20`,
          animation:'slideUp 0.3s cubic-bezier(0.32,0.72,0,1) both',
        }}
      >

        {/* ── Cabeçalho ──────────────────────────────────────────────────── */}
        <div style={{
          background:`linear-gradient(135deg, #0A1826 0%, ${COR_DRK} 100%)`,
          padding:'14px 16px 12px',
          borderBottom:`1px solid ${COR}44`,
          flexShrink:0,
        }}>
          {/* Pill de arrastar */}
          <div style={{
            width:36, height:4, borderRadius:2,
            background:'rgba(255,255,255,0.18)', margin:'0 auto 12px',
          }}/>

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Avatar */}
            <div style={{
              width:44, height:44, borderRadius:'50%', flexShrink:0,
              background:`linear-gradient(135deg,${COR},${COR_DRK})`,
              border:`2px solid ${COR}66`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.4rem',
              boxShadow:`0 4px 14px ${COR}40`,
            }}>🤖</div>

            <div style={{ flex:1, minWidth:0 }}>
              <p style={{
                fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:700,
                fontSize:'0.9rem', color:'#C0D8F0', margin:0, lineHeight:1.2,
              }}>{t('assistant.title')}</p>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
                <span style={{
                  width:7, height:7, borderRadius:'50%',
                  background:'#5AB45A',
                  animation:'online-pulse 3s ease-in-out infinite',
                  flexShrink:0,
                }}/>
                <p style={{
                  fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:600,
                  fontSize:'.72rem', color:'rgba(140,180,210,0.7)', margin:0,
                }}>{t('assistant.online_data')}</p>
              </div>
            </div>

            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              {mensagens.length > 0 && (
                <button onClick={onLimpar}
                  style={{
                    width:32, height:32, borderRadius:8,
                    background:'rgba(168,60,44,0.2)',
                    border:'1px solid rgba(168,60,44,0.4)',
                    color:'#E08878', cursor:'pointer', fontSize:'0.85rem',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }} title={t('assistant.clear')}>🗑</button>
              )}
              <button onClick={onClose}
                style={{
                  width:32, height:32, borderRadius:8,
                  background:'rgba(255,255,255,0.08)',
                  border:'1px solid rgba(255,255,255,0.15)',
                  color:'rgba(200,220,240,0.7)', cursor:'pointer', fontSize:'1rem',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>✕</button>
            </div>
          </div>
        </div>

        {/* ── Área de mensagens ───────────────────────────────────────────── */}
        <div style={{
          flex:1, overflowY:'auto',
          padding:'14px 14px 6px',
          background: C.BG_CARD,
        }}>
          {/* Estado vazio */}
          {mensagens.length === 0 && !loading && (
            <div>
              <div style={{ textAlign:'center', padding:'16px 0 20px' }}>
                <div style={{ fontSize:'2.8rem', marginBottom:8 }}>🛡️</div>
                <p style={{
                  fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:700,
                  fontSize:'0.85rem', color:C.TEXT_PRIMARY, margin:0, marginBottom:4,
                }}>{t('assistant.headquarters')}</p>
                <p style={{
                  fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:600,
                  fontSize:'0.72rem', color:C.TEXT_MUTED, margin:0, lineHeight:1.5,
                }}>
                  {t('assistant.welcome_line1')}<br/>
                  {t('assistant.welcome_line2')}
                </p>
              </div>

              {/* Divisor */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${C.BORDER})` }}/>
                <span style={{ fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:700, fontSize:'.72rem', color:C.TEXT_FAINT, letterSpacing:'2px', textTransform:'uppercase' }}>{t('assistant.suggestions')}</span>
                <div style={{ flex:1, height:1, background:`linear-gradient(270deg,transparent,${C.BORDER})` }}/>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                {(sugestoes || SUGESTOES.slice(0, 8)).map(s => (
                  <button key={s.texto} onClick={() => enviar(s.texto)}
                    style={{
                      display:'flex', alignItems:'center', gap:7,
                      padding:'9px 10px', borderRadius:10, cursor:'pointer',
                      background: C.BG_SECONDARY,
                      border:`1px solid ${C.BORDER_SOFT}`,
                      textAlign:'left', transition:'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COR; e.currentTarget.style.background = `${COR}12`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.BORDER_SOFT; e.currentTarget.style.background = C.BG_SECONDARY; }}
                  >
                    <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{s.emoji}</span>
                    <span style={{
                      fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:700,
                      fontSize:'.72rem', color:C.TEXT_SECONDARY, lineHeight:1.3,
                    }}>{s.texto}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensagens */}
          {mensagens.map((m, i) => <Bolha key={i} msg={m} />)}
          {loading && <Digitando mensagem={pensando} />}

          {/* Erro com botão reenviar */}
          {erro && (
            <div style={{
              background:'rgba(168,60,44,0.1)',
              border:'1px solid rgba(168,60,44,0.3)',
              borderRadius:10, padding:'10px 12px', margin:'4px 0',
            }}>
              <p style={{
                fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:600,
                fontSize:'0.72rem', color:'#E07060', margin:0, marginBottom:8,
              }}>⚠️ {erro}</p>
              <button onClick={onReenviar} disabled={loading}
                style={{
                  width:'100%', padding:'7px 0', borderRadius:8, cursor:'pointer',
                  background:'linear-gradient(135deg,#C04030,#8A1A10)',
                  border:'1px solid rgba(168,60,44,0.5)',
                  color:'#FFF4F0',
                  fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:800,
                  fontSize:'0.72rem', letterSpacing:'0.5px',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                }}>
                {t('assistant.retry_last')}
              </button>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* ── Input ───────────────────────────────────────────────────────── */}
        <div style={{
          padding:'10px 12px 14px',
          background: C.BG_CARD,
          borderTop:`1px solid ${C.BORDER_SOFT}`,
          flexShrink:0,
        }}>
          <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={t('assistant.input_placeholder')}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
              }}
              onKeyDown={handleKey}
              disabled={loading}
              style={{
                flex:1, resize:'none', overflow:'hidden',
                fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:600,
                fontSize:'0.8rem', lineHeight:1.4,
                padding:'9px 12px', borderRadius:12,
                background: C.BG_SECONDARY,
                border:`1.5px solid ${C.BORDER_SOFT}`,
                color: C.TEXT_PRIMARY, outline:'none',
                transition:'border-color 0.15s',
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = COR; }}
              onBlur={e   => { e.currentTarget.style.borderColor = C.BORDER_SOFT; }}
            />
            <button
              onClick={() => enviar()}
              disabled={loading || !input.trim()}
              style={{
                width:42, height:42, borderRadius:12, flexShrink:0,
                background: loading || !input.trim()
                  ? C.BG_SECONDARY
                  : `linear-gradient(135deg,${COR},#3A5A8A)`,
                border:`1.5px solid ${loading || !input.trim() ? C.BORDER_SOFT : COR}`,
                color: loading || !input.trim() ? C.TEXT_FAINT : '#fff',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.1rem', transition:'all 0.15s',
                boxShadow: loading || !input.trim() ? 'none' : `0 2px 10px ${COR}40`,
              }}
            >{loading ? '…' : '➤'}</button>
          </div>
          <p style={{
            fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:600,
            fontSize:'.72rem', color:C.TEXT_FAINT,
            textAlign:'center', margin:'6px 0 0',
          }}>
            {t('assistant.input_hint')}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssistenteModal;
