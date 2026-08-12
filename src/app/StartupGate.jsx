import React, { useEffect, useMemo, useState } from 'react';
import { C } from '../theme.js';
import { limparCachesDeDadosLegados } from '../data/syncService.js';
import AppErrorState from '../ui/AppErrorState.jsx';
import { buildDiagnostic, classifyConnectionError } from '../errors/appErrors.js';

import { API_URL as API } from '../config/api.js';

const Tela = ({ children }) => (
  <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', padding:20, background:C.BG_PRIMARY }}>
    <div style={{ width:'100%', maxWidth:420, background:C.BG_CARD, border:`1.5px solid ${C.BORDER}`, borderRadius:16, padding:22, boxShadow:'0 12px 40px rgba(62,47,28,.18)' }}>
      {children}
    </div>
  </div>
);

export default function StartupGate({ children }) {
  const [status, setStatus] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ usuario:'', senha:'', confirmar:'', setupKey:'' });
  const [salvando, setSalvando] = useState(false);

  const verificar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      limparCachesDeDadosLegados();
      const r = await fetch(`${API}/api/setup/bootstrap-status`, { signal:AbortSignal.timeout(12000), cache:'no-store' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.mensagem || d.erro || `HTTP ${r.status}`);
      setStatus(d);
      if (d.migracao?.estado === 'erro') {
        setErro({
          code:'GD-START-002',
          title:'Não foi possível concluir a configuração',
          message:'Os dados essenciais não puderam ser preparados. Tente novamente em instantes.',
          raw:new Error(d.migracao.erro || 'Falha na preparação inicial'),
        });
      }
    } catch (e) {
      const info = classifyConnectionError(e, 'GD-START-001');
      setErro({ ...info, raw:e });
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { verificar(); }, []);

  useEffect(() => {
    if (!status || status.migracao?.estado === 'pronto' || status.migracao?.estado === 'erro') return undefined;
    const id = setTimeout(() => verificar(), 1500);
    return () => clearTimeout(id);
  }, [status]);

  const criarAdmin = async (e) => {
    e.preventDefault();
    if (form.usuario.trim().length < 3) return setErro({ code:'GD-SETUP-001', title:'Revise o usuário', message:'O usuário precisa ter pelo menos 3 caracteres.', raw:new Error('Usuário com menos de 3 caracteres') });
    if (form.senha.length < 6) return setErro({ code:'GD-SETUP-002', title:'Escolha uma senha mais segura', message:'A senha precisa ter pelo menos 6 caracteres.', raw:new Error('Senha com menos de 6 caracteres') });
    if (form.senha !== form.confirmar) return setErro({ code:'GD-SETUP-003', title:'As senhas não coincidem', message:'Digite a mesma senha nos dois campos.', raw:new Error('Confirmação de senha divergente') });
    setSalvando(true);
    setErro(null);
    try {
      const headers = { 'Content-Type':'application/json' };
      if (status?.usuario?.setupKeyObrigatoria && form.setupKey) headers['X-Setup-Key'] = form.setupKey;
      const r = await fetch(`${API}/api/setup/usuario`, {
        method:'POST', headers, body:JSON.stringify({ usuario:form.usuario.trim(), senha:form.senha }), signal:AbortSignal.timeout(12000),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.mensagem || d.erro || `HTTP ${r.status}`);
      await verificar();
    } catch (e) {
      const info = classifyConnectionError(e, 'GD-SETUP-004');
      setErro({ ...info, title:info.code.startsWith('GD-NET') ? info.title : 'Não foi possível criar o administrador', raw:e });
    } finally {
      setSalvando(false);
    }
  };

  const diagnostic = useMemo(() => erro ? buildDiagnostic({ code:erro.code, error:erro.raw, context:'Inicialização' }) : '', [erro]);

  if (carregando && !status) return (
    <Tela>
      <div style={{ textAlign:'center', padding:'8px 0' }}>
        <div style={{ fontSize:42 }}>🛡️</div>
        <h1 className="font-cinzel" style={{ color:C.TEXT_PRIMARY, margin:'10px 0 6px', fontSize:'1.08rem' }}>Preparando o GUIA DOA</h1>
        <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.8rem', margin:0 }}>Sincronizando dados online…</p>
      </div>
    </Tela>
  );

  if (erro && (!status || status.migracao?.estado === 'erro')) return (
    <Tela>
      <AppErrorState title={erro.title} message={erro.message} code={erro.code} diagnostic={diagnostic} onRetry={verificar} compact />
    </Tela>
  );

  if (status?.migracao?.estado !== 'pronto') return (
    <Tela>
      <div style={{ textAlign:'center', padding:'8px 0' }}>
        <div style={{ fontSize:40 }}>🔄</div>
        <h2 className="font-cinzel" style={{ color:C.TEXT_PRIMARY, margin:'9px 0 5px', fontSize:'1rem' }}>Preparando conteúdo</h2>
        <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.78rem', lineHeight:1.5, margin:0 }}>Sincronizando os dados essenciais para o primeiro uso.</p>
        <div className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.65rem', marginTop:9 }}>Esta etapa é automática.</div>
      </div>
    </Tela>
  );

  if (status?.dados?.necessario) {
    const faltantes = status.dados?.modulos?.filter(m => m.essencial && m.vazio).map(m => m.label).join(', ') || 'conteúdo essencial';
    const raw = new Error(`Conteúdo essencial ausente: ${faltantes}`);
    return (
      <Tela>
        <AppErrorState
          title="Conteúdo temporariamente indisponível"
          message="Algumas informações essenciais ainda não estão prontas. Tente novamente em instantes."
          code="GD-START-003"
          diagnostic={buildDiagnostic({ code:'GD-START-003', error:raw, context:'Inicialização', extra:{ faltantes } })}
          onRetry={verificar}
          compact
        />
      </Tela>
    );
  }

  if (status?.usuario?.necessario) return (
    <Tela>
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:42 }}>🔐</div>
        <div className="font-nunito" style={{ color:C.ACCENT, fontWeight:900, fontSize:'.62rem', letterSpacing:2 }}>CONFIGURAÇÃO INICIAL</div>
        <h1 className="font-cinzel" style={{ color:C.TEXT_PRIMARY, fontSize:'1.08rem', margin:'6px 0' }}>Acesso administrativo</h1>
        <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.76rem', lineHeight:1.5, margin:0 }}>
          Defina as credenciais que serão usadas para gerenciar o conteúdo do aplicativo.
        </p>
      </div>
      <form onSubmit={criarAdmin} style={{ display:'grid', gap:10 }}>
        <input className="tw-input" placeholder="Usuário" autoComplete="username" value={form.usuario} onChange={e=>setForm(f=>({...f,usuario:e.target.value}))} />
        <input className="tw-input" type="password" placeholder="Senha" autoComplete="new-password" value={form.senha} onChange={e=>setForm(f=>({...f,senha:e.target.value}))} />
        <input className="tw-input" type="password" placeholder="Confirmar senha" autoComplete="new-password" value={form.confirmar} onChange={e=>setForm(f=>({...f,confirmar:e.target.value}))} />
        {status.usuario?.setupKeyObrigatoria && (
          <>
            <input className="tw-input" type="password" placeholder="Código de segurança" value={form.setupKey} onChange={e=>setForm(f=>({...f,setupKey:e.target.value}))} />
            <div className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.62rem', lineHeight:1.4 }}>Este código é solicitado apenas quando a instalação foi protegida pelo administrador do servidor.</div>
          </>
        )}
        {erro && <div style={{ padding:'8px 10px', borderRadius:8, background:'rgba(168,60,44,.07)', border:'1px solid rgba(168,60,44,.18)' }}>
          <div className="font-nunito" style={{ color:C.ERROR, fontSize:'.72rem', fontWeight:800 }}>{erro.message}</div>
          <div className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.58rem', marginTop:2 }}>Código: {erro.code}</div>
        </div>}
        <button className="btn-gold" type="submit" disabled={salvando}>{salvando ? 'Configurando…' : 'Criar acesso e continuar'}</button>
      </form>
      <div className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.62rem', marginTop:14, textAlign:'center' }}>Os dados do aplicativo são sincronizados com segurança pela internet.</div>
    </Tela>
  );

  return children;
}
