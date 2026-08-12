import React, { useEffect, useState } from 'react';
import { C } from '../theme.js';
import { limparCachesDeDadosLegados } from '../data/syncService.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Tela = ({ children }) => (
  <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', padding:20, background:C.BG_PRIMARY }}>
    <div style={{ width:'100%', maxWidth:420, background:C.BG_CARD, border:`1.5px solid ${C.BORDER}`, borderRadius:16, padding:22, boxShadow:'0 12px 40px rgba(62,47,28,.18)' }}>
      {children}
    </div>
  </div>
);

export default function StartupGate({ children }) {
  const [status, setStatus] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ usuario:'', senha:'', confirmar:'', setupKey:'' });
  const [salvando, setSalvando] = useState(false);

  const verificar = async () => {
    setCarregando(true); setErro('');
    try {
      limparCachesDeDadosLegados();
      const r = await fetch(`${API}/api/setup/bootstrap-status`, { signal: AbortSignal.timeout(12000), cache:'no-store' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.mensagem || d.erro || 'Não foi possível verificar o MongoDB.');
      setStatus(d);
      if (d.migracao?.estado === 'erro') setErro(`A migração automática falhou: ${d.migracao.erro || 'erro desconhecido'}`);
    } catch (e) {
      setErro(e.message || 'Servidor indisponível.');
    } finally { setCarregando(false); }
  };

  useEffect(() => { verificar(); }, []);

  // Normalmente a migração termina antes da API começar a aceitar conexões.
  // Se o status ainda estiver pendente, o primeiro acesso acompanha sozinho — sem botão de importação.
  useEffect(() => {
    if (!status || status.migracao?.estado === 'pronto' || status.migracao?.estado === 'erro') return undefined;
    const id = setTimeout(() => verificar(), 1500);
    return () => clearTimeout(id);
  }, [status]);

  const criarAdmin = async (e) => {
    e.preventDefault();
    if (form.usuario.trim().length < 3) return setErro('O usuário precisa ter pelo menos 3 caracteres.');
    if (form.senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.');
    if (form.senha !== form.confirmar) return setErro('As senhas não coincidem.');
    setSalvando(true); setErro('');
    try {
      const headers = { 'Content-Type':'application/json' };
      if (status?.usuario?.setupKeyObrigatoria && form.setupKey) headers['X-Setup-Key'] = form.setupKey;
      const r = await fetch(`${API}/api/setup/usuario`, {
        method:'POST', headers, body:JSON.stringify({ usuario:form.usuario.trim(), senha:form.senha }), signal:AbortSignal.timeout(12000),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.mensagem || d.erro || 'Não foi possível criar o administrador.');
      await verificar();
    } catch (e) { setErro(e.message); }
    finally { setSalvando(false); }
  };

  if (carregando || !status) return (
    <Tela>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:42 }}>{erro ? '🔴' : '🛡️'}</div>
        <h1 className="font-cinzel" style={{ color:erro ? C.ERROR : C.TEXT_PRIMARY, margin:'10px 0 6px', fontSize:'1.1rem' }}>{erro ? 'Não foi possível acessar o MongoDB' : 'Preparando o GUIA DOA'}</h1>
        <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.82rem', margin:0 }}>{erro || 'Verificando API e MongoDB…'}</p>
        {erro && <button className="btn-gold" style={{ marginTop:16 }} onClick={verificar}>Tentar novamente</button>}
      </div>
    </Tela>
  );

  if (erro && status?.migracao?.estado === 'erro') return (
    <Tela>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40 }}>⚠️</div>
        <h2 className="font-cinzel" style={{ color:C.ERROR }}>Migração não concluída</h2>
        <p className="font-nunito" style={{ color:C.TEXT_SECONDARY, fontSize:'.82rem' }}>{erro}</p>
        <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.72rem' }}>Nenhum cache offline será usado. Corrija/reinicie a API e tente novamente.</p>
        <button className="btn-gold" onClick={verificar}>Verificar novamente</button>
      </div>
    </Tela>
  );

  if (status.usuario?.necessario) return (
    <Tela>
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:42 }}>👤</div>
        <div className="font-nunito" style={{ color:C.ACCENT, fontWeight:900, fontSize:'.65rem', letterSpacing:2 }}>PRIMEIRO ACESSO</div>
        <h1 className="font-cinzel" style={{ color:C.TEXT_PRIMARY, fontSize:'1.08rem', margin:'6px 0' }}>Crie o administrador</h1>
        <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.78rem', lineHeight:1.5, margin:0 }}>
          Os dados padrão já foram migrados automaticamente para o MongoDB. Defina agora o usuário e a senha do painel administrativo.
        </p>
      </div>
      <form onSubmit={criarAdmin} style={{ display:'grid', gap:10 }}>
        <input className="tw-input" placeholder="Usuário" autoComplete="username" value={form.usuario} onChange={e=>setForm(f=>({...f,usuario:e.target.value}))} />
        <input className="tw-input" type="password" placeholder="Senha" autoComplete="new-password" value={form.senha} onChange={e=>setForm(f=>({...f,senha:e.target.value}))} />
        <input className="tw-input" type="password" placeholder="Confirmar senha" autoComplete="new-password" value={form.confirmar} onChange={e=>setForm(f=>({...f,confirmar:e.target.value}))} />
        {status.usuario?.setupKeyObrigatoria && (
          <input className="tw-input" type="password" placeholder="Chave de instalação" value={form.setupKey} onChange={e=>setForm(f=>({...f,setupKey:e.target.value}))} />
        )}
        {erro && <div className="font-nunito" style={{ color:C.ERROR, fontSize:'.75rem' }}>{erro}</div>}
        <button className="btn-gold" type="submit" disabled={salvando}>{salvando ? 'Criando…' : 'Criar administrador e abrir aplicativo'}</button>
      </form>
      <div className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.65rem', marginTop:14, textAlign:'center' }}>Fonte de dados: MongoDB · cache de dados offline desativado</div>
    </Tela>
  );

  if (status.migracao?.estado === 'pronto' && status.dados?.necessario) {
    const faltantes = status.dados?.modulos?.filter(m => m.essencial && m.vazio).map(m => m.label).join(', ') || 'dados essenciais';
    return (
      <Tela>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:40 }}>🗄️</div>
          <h2 className="font-cinzel" style={{ color:C.ERROR }}>MongoDB incompleto</h2>
          <p className="font-nunito" style={{ color:C.TEXT_SECONDARY, fontSize:'.82rem', lineHeight:1.5 }}>
            A migração desta versão já terminou, mas faltam: <strong>{faltantes}</strong>. O aplicativo não vai usar dados locais como substituto.
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap', marginTop:14 }}>
            <button className="btn-gold" onClick={verificar}>Verificar novamente</button>
            <button className="btn-gold" onClick={()=>window.open(`${API}/admin`, '_blank', 'noopener,noreferrer')}>Abrir Admin</button>
          </div>
        </div>
      </Tela>
    );
  }

  if (status.migracao?.estado !== 'pronto') return (
    <Tela>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40 }}>📦</div>
        <h2 className="font-cinzel" style={{ color:C.TEXT_PRIMARY }}>Preparando dados</h2>
        <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.8rem' }}>A API ainda está concluindo a migração automática para o MongoDB.</p>
        <div className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.68rem', marginTop:10 }}>A verificação será refeita automaticamente.</div>
      </div>
    </Tela>
  );

  return children;
}
