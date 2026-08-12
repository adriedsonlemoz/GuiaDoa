import React, { useEffect, useState } from 'react';
import { C } from '../theme.js';
import { COR, COR_DRK } from './assistente/config.js';
import AssistenteModal from './assistente/AssistenteModal.jsx';
import useAssistente from './assistente/useAssistente.js';

const AssistenteTatico = () => {
  const [aberto, setAberto] = useState(false);
  const assistente = useAssistente();

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [aberto]);

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        style={{
          width:'100%', display:'flex', alignItems:'center', gap:12,
          padding:'12px 14px', borderRadius:14, cursor:'pointer',
          background: C.BG_CARD,
          border:'1.5px solid rgba(200,168,74,0.22)',
          borderLeft:`4px solid ${COR}`,
          transition:'all 0.2s',
          boxShadow:'0 1px 4px rgba(62,47,28,0.06)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = COR;
          e.currentTarget.style.boxShadow = `0 4px 18px ${COR}30`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(200,168,74,0.22)';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(62,47,28,0.06)';
          e.currentTarget.style.borderLeftColor = COR;
        }}
      >
        <div style={{
          width:44, height:44, borderRadius:'50%', flexShrink:0,
          background:`linear-gradient(135deg,${COR},${COR_DRK})`,
          border:`2px solid ${COR}55`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1.3rem', boxShadow:`0 2px 10px ${COR}30`, position:'relative',
        }}>
          🤖
          <span style={{
            position:'absolute', bottom:0, right:0,
            width:11, height:11, borderRadius:'50%',
            background:'#5AB45A', border:`2px solid ${C.BG_MAIN}`,
            animation:'online-pulse 3s ease-in-out infinite',
          }}/>
        </div>

        <div style={{ flex:1, textAlign:'left', minWidth:0 }}>
          <p style={{
            fontFamily:'"Cinzel",serif', fontWeight:700,
            fontSize:'0.8rem', color:C.TEXT_PRIMARY, margin:0, lineHeight:1.2,
          }}>Conselheiro Tático</p>
          <p style={{
            fontFamily:'"Nunito",sans-serif', fontWeight:600,
            fontSize:'0.64rem', color:C.TEXT_MUTED, margin:'3px 0 0',
          }}>
            {assistente.mensagens.length > 0
              ? `${assistente.mensagens.length} mensagem${assistente.mensagens.length > 1 ? 's' : ''} · Toque para continuar`
              : 'Tire dúvidas sobre o jogo com IA'}
          </p>
        </div>

        <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
          <span style={{
            fontFamily:'"Nunito",sans-serif', fontWeight:900,
            fontSize:'0.6rem', padding:'4px 9px', borderRadius:6,
            background:`linear-gradient(135deg,${COR},#3A5A8A)`,
            color:'#fff', letterSpacing:'0.5px', boxShadow:`0 2px 8px ${COR}40`,
          }}>
            {assistente.mensagens.length > 0 ? 'CONTINUAR ▸' : 'CONSULTAR ▸'}
          </span>
          {assistente.mensagens.length > 0 && (
            <span style={{
              fontFamily:'"Nunito",sans-serif', fontWeight:700,
              fontSize:'0.55rem', color: COR,
            }}>● ativo</span>
          )}
        </div>
      </button>

      {aberto && (
        <AssistenteModal
          onClose={() => setAberto(false)}
          mensagens={assistente.mensagens}
          loading={assistente.loading}
          pensando={assistente.pensando}
          intencao={assistente.intencao}
          sugestoes={assistente.sugestoes}
          erro={assistente.erro}
          onEnviar={assistente.enviar}
          onLimpar={assistente.limpar}
          onReenviar={assistente.reenviar}
        />
      )}
    </>
  );
};

export default AssistenteTatico;
