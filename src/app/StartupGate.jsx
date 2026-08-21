import React, { useEffect, useMemo, useState } from 'react';
import { C } from '../theme.js';
import { limparCachesDeDadosLegados } from '../data/syncService.js';
import AppErrorState from '../ui/AppErrorState.jsx';
import { buildDiagnostic, classifyConnectionError } from '../errors/appErrors.js';
import { useI18n } from '../hooks/useI18n.jsx';
import DataSyncScene from './DataSyncScene.jsx';

import { API_URL as API, API_CONFIGURED, API_CONFIGURATION_SOURCE } from '../config/api.js';
import { DISPLAY_VERSION } from '../version.js';

const RETRYABLE_CONNECTION_CODES = new Set(['GD-NET-001', 'GD-NET-002', 'GD-SRV-001']);
const AUTO_RETRY_MS = 5000;
const MAX_AUTO_RETRIES = 3;
const CONNECTION_TIMEOUT_MS = 20000;

const Tela = ({ children }) => (
  <div style={{ minHeight:'100dvh', display:'grid', placeItems:'center', padding:20, background:C.BG_PRIMARY, overflow:'hidden' }}>
    <div style={{ width:'100%', maxWidth:420, background:C.BG_CARD, border:`1.5px solid ${C.BORDER}`, borderRadius:16, padding:22, boxShadow:'0 12px 40px rgba(62,47,28,.18)' }}>
      {children}
    </div>
  </div>
);

export default function StartupGate({ children }) {
  const { t } = useI18n();
  const [status, setStatus] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ usuario:'', senha:'', confirmar:'', setupKey:'' });
  const [salvando, setSalvando] = useState(false);
  const [autoRetries, setAutoRetries] = useState(0);

  const verificar = async ({ resetRetries = false } = {}) => {
    if (resetRetries) setAutoRetries(0);
    setCarregando(true);
    setErro(null);
    try {
      limparCachesDeDadosLegados();
      if (!API_CONFIGURED) {
        const err=new Error('VITE_API_URL não foi configurada para este build.'); err.name='ApiConfigurationError'; throw err;
      }
      const r = await fetch(`${API}/api/setup/bootstrap-status`, { signal:AbortSignal.timeout(CONNECTION_TIMEOUT_MS), cache:'no-store' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.mensagem || d.erro || `HTTP ${r.status}`);
      setStatus(d);
      if (d.migracao?.estado === 'erro') {
        setErro({
          code:'GD-START-002',
          title:t('app.setup.migration_error_title'),
          message:t('app.setup.migration_error_message'),
          raw:new Error(d.migracao.erro || 'Falha na preparação inicial'),
        });
      }
    } catch (e) {
      if (e?.name === 'ApiConfigurationError') {
        setErro({ code:'GD-CONFIG-001', title:t('app.setup.api_missing_title'), message:t('app.setup.api_missing_message'), raw:e });
      } else {
        const info = classifyConnectionError(e, 'GD-START-001');
        setErro({ ...info, raw:e });
        if (RETRYABLE_CONNECTION_CODES.has(info.code)) setAutoRetries(n=>n+1);
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { verificar({ resetRetries:true }); }, []);

  useEffect(() => {
    if (!status || status.migracao?.estado === 'pronto' || status.migracao?.estado === 'erro') return undefined;
    const id = setTimeout(() => verificar(), 1500);
    return () => clearTimeout(id);
  }, [status]);

  useEffect(() => {
    if (!erro || !RETRYABLE_CONNECTION_CODES.has(erro.code) || status || autoRetries >= MAX_AUTO_RETRIES) return undefined;
    const id = setTimeout(() => verificar(), AUTO_RETRY_MS);
    return () => clearTimeout(id);
  }, [erro, status, autoRetries]);

  const criarAdmin = async (e) => {
    e.preventDefault();
    if (form.usuario.trim().length < 3) return setErro({ code:'GD-SETUP-001', title:t('app.setup.user_review_title'), message:t('app.setup.user_review_message'), raw:new Error('Usuário com menos de 3 caracteres') });
    if (form.senha.length < 6) return setErro({ code:'GD-SETUP-002', title:t('app.setup.password_review_title'), message:t('app.setup.password_review_message'), raw:new Error('Senha com menos de 6 caracteres') });
    if (form.senha !== form.confirmar) return setErro({ code:'GD-SETUP-003', title:t('app.setup.password_mismatch_title'), message:t('app.setup.password_mismatch_message'), raw:new Error('Confirmação de senha divergente') });
    setSalvando(true);
    setErro(null);
    try {
      const headers = { 'Content-Type':'application/json' };
      if (status?.usuario?.setupKeyObrigatoria && form.setupKey) headers['X-Setup-Key'] = form.setupKey;
      const r = await fetch(`${API}/api/setup/usuario`, {
        method:'POST', headers, body:JSON.stringify({ usuario:form.usuario.trim(), senha:form.senha }), signal:AbortSignal.timeout(CONNECTION_TIMEOUT_MS),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.mensagem || d.erro || `HTTP ${r.status}`);
      await verificar();
    } catch (e) {
      const info = classifyConnectionError(e, 'GD-SETUP-004');
      setErro({ ...info, title:info.code.startsWith('GD-NET') ? info.title : t('app.setup.admin_create_error'), raw:e });
    } finally {
      setSalvando(false);
    }
  };

  const diagnostic = useMemo(() => erro ? buildDiagnostic({ code:erro.code, error:erro.raw, context:'Inicialização', extra:{ versao:DISPLAY_VERSION, api:API || 'não configurada', apiSource:API_CONFIGURATION_SOURCE, tentativas:autoRetries, origem:typeof window!=='undefined'?window.location.origin:'' } }) : '', [erro, autoRetries]);

  if (carregando && !status) return (
    <DataSyncScene
      title={t('app.setup.preparing')}
      subtitle={t('app.setup.syncing')}
      phase="connect"
    />
  );

  if (erro && !status && RETRYABLE_CONNECTION_CODES.has(erro.code) && autoRetries < MAX_AUTO_RETRIES) return (
    <DataSyncScene title={t('app.sync.waiting_connection')} subtitle={t('app.sync.retry_progress',{current:autoRetries,total:MAX_AUTO_RETRIES})} phase="connect" />
  );

  if (erro && (!status || status.migracao?.estado === 'erro')) return (
    <Tela>
      <AppErrorState title={erro.title} message={erro.message} code={erro.code} diagnostic={diagnostic} onRetry={()=>verificar({resetRetries:true})} compact />
    </Tela>
  );

  if (status?.migracao?.estado !== 'pronto') return (
    <DataSyncScene
      title={t('app.setup.content_title')}
      subtitle={t('app.setup.content_text')}
      phase="catalog"
    />
  );

  if (status?.dados?.necessario) {
    const faltantes = status.dados?.modulos?.filter(m => m.essencial && m.vazio).map(m => m.label).join(', ') || 'conteúdo essencial';
    const raw = new Error(`Conteúdo essencial ausente: ${faltantes}`);
    return (
      <Tela>
        <AppErrorState
          title={t('app.setup.content_unavailable_title')}
          message={t('app.setup.content_unavailable_message')}
          code="GD-START-003"
          diagnostic={buildDiagnostic({ code:'GD-START-003', error:raw, context:'Inicialização', extra:{ faltantes } })}
          onRetry={()=>verificar({resetRetries:true})}
          compact
        />
      </Tela>
    );
  }

  if (status?.usuario?.necessario) return (
    <Tela>
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:42 }}>🔐</div>
        <div className="font-nunito" style={{ color:C.ACCENT, fontWeight:900, fontSize:'.62rem', letterSpacing:2 }}>{t('app.setup.admin_eyebrow')}</div>
        <h1 className="font-cinzel" style={{ color:C.TEXT_PRIMARY, fontSize:'1.08rem', margin:'6px 0' }}>{t('app.setup.admin_title')}</h1>
        <p className="font-nunito" style={{ color:C.TEXT_MUTED, fontSize:'.76rem', lineHeight:1.5, margin:0 }}>
          {t('app.setup.admin_text')}
        </p>
      </div>
      <form onSubmit={criarAdmin} style={{ display:'grid', gap:10 }}>
        <input className="tw-input" placeholder={t('app.setup.user')} autoComplete="username" value={form.usuario} onChange={e=>setForm(f=>({...f,usuario:e.target.value}))} />
        <input className="tw-input" type="password" placeholder={t('app.setup.password')} autoComplete="new-password" value={form.senha} onChange={e=>setForm(f=>({...f,senha:e.target.value}))} />
        <input className="tw-input" type="password" placeholder={t('app.setup.confirm_password')} autoComplete="new-password" value={form.confirmar} onChange={e=>setForm(f=>({...f,confirmar:e.target.value}))} />
        {status.usuario?.setupKeyObrigatoria && (
          <>
            <input className="tw-input" type="password" placeholder={t('app.setup.security_code')} value={form.setupKey} onChange={e=>setForm(f=>({...f,setupKey:e.target.value}))} />
            <div className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.62rem', lineHeight:1.4 }}>{t('app.setup.security_help')}</div>
          </>
        )}
        {erro && <div style={{ padding:'8px 10px', borderRadius:8, background:'rgba(168,60,44,.07)', border:'1px solid rgba(168,60,44,.18)' }}>
          <div className="font-nunito" style={{ color:C.ERROR, fontSize:'.72rem', fontWeight:800 }}>{erro.message}</div>
          <div className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.58rem', marginTop:2 }}>Código: {erro.code}</div>
        </div>}
        <button className="btn-gold" type="submit" disabled={salvando}>{salvando ? t('app.setup.creating') : t('app.setup.create')}</button>
      </form>
      <div className="font-nunito" style={{ color:C.TEXT_FAINT, fontSize:'.62rem', marginTop:14, textAlign:'center' }}>{t('app.setup.online_note')}</div>
    </Tela>
  );

  return children;
}
