import React, { useState } from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';
import { COR, COR_DRK, INTENCAO_LABEL } from './config.js';
import { parseMarkdown } from './markdown.jsx';

const BotaoCopiar = ({ texto }) => {
  const { t } = useI18n();
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    navigator.clipboard?.writeText(texto).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };
  return (
    <button onClick={copiar}
      style={{
        marginTop: 4, padding: '3px 8px', borderRadius: 6, cursor: 'pointer',
        background: copiado ? 'rgba(90,180,90,0.15)' : 'rgba(92,127,163,0.12)',
        border: `1px solid ${copiado ? 'rgba(90,180,90,0.4)' : 'rgba(92,127,163,0.3)'}`,
        color: copiado ? '#5AB45A' : COR,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight: 700, fontSize: '0.6rem',
        letterSpacing: '0.3px', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
      {copiado ? t('assistant.copied') : t('assistant.copy')}
    </button>
  );
};

export function MessageBubble({ msg }) {
  const { t } = useI18n();
  const isUser = msg.role === 'user';
  return (
    <div style={{ display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${COR}, ${COR_DRK})`,
          border: `1.5px solid ${COR}55`, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: '0.9rem', marginRight: 7, marginTop: 2,
        }}>🤖</div>
      )}
      <div style={{ maxWidth: '78%' }}>
        <div style={{
          padding: '9px 13px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
          background: isUser ? `linear-gradient(135deg, ${COR} 0%, #3A5A8A 100%)` : C.BG_SECONDARY,
          border: isUser ? 'none' : `1px solid ${C.BORDER_SOFT}`,
          boxShadow: isUser ? `0 2px 10px ${COR}40` : '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          {!isUser && (
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <p style={{
                fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:900, fontSize:'0.6rem', letterSpacing:'2px',
                textTransform:'uppercase', color: COR, margin:0,
              }}>{t('assistant.advisor')}</p>
              {msg.intencao && INTENCAO_LABEL[msg.intencao] && (
                <span style={{
                  fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:700, fontSize:'0.55rem', padding:'1px 6px',
                  borderRadius:4, background:`${COR}20`, border:`1px solid ${COR}40`, color: COR,
                  letterSpacing:'0.3px',
                }}>
                  {INTENCAO_LABEL[msg.intencao].emoji} {t(INTENCAO_LABEL[msg.intencao].key)}
                </span>
              )}
            </div>
          )}
          <div style={{
            fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:600, fontSize:'0.76rem', lineHeight:1.55,
            color: isUser ? '#fff' : C.TEXT_PRIMARY, wordBreak:'break-word',
          }}>{parseMarkdown(msg.content, isUser)}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 8, marginTop: 2 }}>
          <p style={{
            fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:600, fontSize:'0.55rem', color:C.TEXT_FAINT, margin:0,
          }}>{msg.hora}</p>
          {!isUser && <BotaoCopiar texto={msg.content} />}
        </div>
      </div>
      {isUser && (
        <div style={{
          width:28, height:28, borderRadius:'50%', flexShrink:0,
          background: C.BG_SECONDARY, border:`1.5px solid ${C.BORDER_SOFT}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'0.9rem', marginLeft:7, marginTop:2,
        }}>🎖️</div>
      )}
    </div>
  );
}

export function TypingBubble({ mensagem }) {
  return (
    <div style={{ display:'flex', justifyContent:'flex-start', marginBottom:10 }}>
      <div style={{
        width:28, height:28, borderRadius:'50%', flexShrink:0,
        background: `linear-gradient(135deg,${COR},${COR_DRK})`, border:`1.5px solid ${COR}55`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', marginRight:7,
      }}>🤖</div>
      <div style={{
        padding:'10px 14px', borderRadius:'4px 16px 16px 16px', background: C.BG_SECONDARY,
        border:`1px solid ${C.BORDER_SOFT}`, display:'flex', alignItems:'center', gap:8,
      }}>
        <div style={{ display:'flex', gap:4 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width:6, height:6, borderRadius:'50%', background:COR, display:'inline-block',
              animation:`typing-dot 1.2s ${i*0.2}s ease-in-out infinite`,
            }}/>
          ))}
        </div>
        {mensagem && (
          <span style={{ fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight:600, fontSize:'0.65rem', color:C.TEXT_MUTED }}>
            {mensagem}
          </span>
        )}
      </div>
    </div>
  );
}
