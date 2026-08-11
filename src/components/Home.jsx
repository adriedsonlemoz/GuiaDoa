import React, { useState, useEffect } from 'react';
import { getProfile, clearProfile, getTermoAceito } from '../utils/storage.js';
import { useToast } from '../hooks/useToast.js';
import TermosDialog from './ProfileLogin/TermosDialog.jsx';
import ProfileForm  from './ProfileLogin/ProfileForm.jsx';
import AlertaModal  from './shared/AlertaModal.jsx';
import Toast        from '../ui/Toast.jsx';
import { C } from '../theme.js';
import AssistenteTatico  from './AssistenteTatico.jsx';
import ColorTextBuilder  from './colorbuilder/index.jsx';
import { useI18n, LocaleSwitcher } from '../hooks/useI18n.jsx';
import ConfiguracoesIdioma from './ProfileLogin/ConfiguracoesIdioma.jsx';

const useServerClock = () => {
  const [hora, setHora] = useState(() => {
    const n = new Date();
    return [n.getUTCHours(), n.getUTCMinutes(), n.getUTCSeconds()]
      .map(x => String(x).padStart(2, '0')).join(':');
  });
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setHora([n.getUTCHours(), n.getUTCMinutes(), n.getUTCSeconds()]
        .map(x => String(x).padStart(2, '0')).join(':'));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return hora;
};

// id prefixado com 'modal:' → abre modal interno (não muda de rota)
const FERRAMENTAS_DEF = [
  { id: 'torneios',            icon: '🏆', tKey: 'home.botao.torneios',      subKey: 'home.botao.torneios.sub',      cor: '#C87A2C' },
  { id: 'tropas',              icon: '⚔️',  tKey: 'home.botao.tropas',        subKey: 'home.botao.tropas.sub',        cor: '#5C7FA3' },
  { id: 'dragoes',             icon: '🐉',  tKey: 'home.botao.dragoes',       subKey: 'home.botao.dragoes.sub',       cor: '#5A8A5C' },
  { id: 'edificios',           icon: '🏗️',  tKey: 'home.botao.edificios',     subKey: 'home.botao.edificios.sub',     cor: '#8B6BAE' },
  { id: 'itens',               icon: '🎒',  tKey: 'home.botao.itens',         subKey: 'home.botao.itens.sub',         cor: '#A07040' },
  { id: 'niveis',              icon: '🏰',  tKey: 'home.botao.niveis',        subKey: 'home.botao.niveis.sub',        cor: '#3B7A8C' },
  { id: 'ilhas',               icon: '🏝️',  tKey: 'home.botao.ilhas',         subKey: 'home.botao.ilhas.sub',         cor: '#4A8A6A' },
  { id: 'pesquisas',           icon: '🔬',  tKey: 'home.botao.pesquisas',     subKey: 'home.botao.pesquisas.sub',     cor: '#5A8A7A' },
  { id: 'sobre',               icon: 'ℹ️',  tKey: 'home.botao.sobre',         subKey: 'home.botao.sobre.sub',         cor: '#7A6A5A' },
  { id: 'dicas',               icon: '💡',  tKey: 'home.botao.dicas',         subKey: 'home.botao.dicas.sub',         cor: '#D4A017' },
  { id: 'modal:color_builder', icon: '🎨',  tKey: 'home.botao.texto_colorido', subKey: 'home.botao.texto_colorido.sub', cor: '#9B59B6' },
];

const Divider = ({ label, extra }) => (
  <div className="flex items-center gap-1.5" style={{ padding: '8px 0 5px' }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.BORDER})`, opacity: 0.3 }} />
    <span style={{ color: C.ACCENT, fontSize: '0.72rem' }}>◆</span>
    <span className="font-nunito font-black uppercase tracking-widest" style={{ fontSize: '0.62rem', color: C.TEXT_MUTED }}>
      {label}
    </span>
    <span style={{ color: C.ACCENT, fontSize: '0.72rem' }}>◆</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg,transparent,${C.BORDER})`, opacity: 0.3 }} />
    {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
  </div>
);

const Home = ({ setRoute }) => {
  const [profile,     setProfile]     = useState(() => getProfile());
  const [termoAceito, setTermoAceito] = useState(() => getTermoAceito());
  const [alertaModal, setAlertaModal] = useState({ open: false, msg: '' });
  const { toast, closeToast }         = useToast();
  const horaServidor                  = useServerClock();
  const [modalExtra,  setModalExtra]  = useState(null);
  const [verIdioma,   setVerIdioma]   = useState(false);
  const { t }                         = useI18n();

  const playerId = profile?.playerId || null;
  const [idCopiado, setIdCopiado] = useState(false);

  const copiarId = () => {
    if (!playerId) return;
    const texto = `ID: ${playerId} | Reino: ${profile.reino}`;
    navigator.clipboard?.writeText(texto).catch(() => {
      // fallback para APK sem clipboard API
      const el = document.createElement('textarea');
      el.value = texto;
      el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setIdCopiado(true);
    setTimeout(() => setIdCopiado(false), 2000);
  };

  if (!profile) {
    return (
      <>
        <TermosDialog open={!termoAceito} onAceitar={() => setTermoAceito(true)} />
        {termoAceito && <ProfileForm onSave={p => setProfile(p)} />}
      </>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 16 }}>
      <Toast {...toast} onClose={closeToast} />
      <AlertaModal open={alertaModal.open} message={alertaModal.msg}
        onClose={() => setAlertaModal({ open: false, msg: '' })} />

      {/* ── CARD PERFIL + RELÓGIO ─────────────────────────────────────────── */}
      <div className="tw-card mb-3" style={{ animation: 'reveal-up 0.4s 0.08s ease both' }}>

        {/* Faixa de topo azul (como GameHeader do Sobre) */}
        <div
          className="flex items-center justify-between px-4"
          style={{
            background: 'linear-gradient(135deg,#1C3A5E,#2A4C72)',
            borderBottom: '1px solid rgba(200,168,74,0.3)',
            minHeight: 36,
          }}
        >
          <span
            className="font-cinzel font-bold uppercase"
            style={{ fontSize: '0.58rem', color: 'rgba(200,168,74,0.7)', letterSpacing: '3px' }}
          >
            ◆ Quartel-General ◆
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Botão de idioma */}
            <button
              onClick={() => setVerIdioma(true)}
              className="flex items-center justify-center rounded-md"
              style={{
                width: 28, height: 28,
                background: 'transparent', cursor: 'pointer',
                border: '1px solid rgba(200,168,74,0.28)',
                color: 'rgba(248,242,224,0.55)', fontSize: '0.85rem',
              }}
              title="Idioma / Language"
            >🌐</button>
            <button
              onClick={() => { clearProfile(); setProfile(null); }}
              className="flex items-center justify-center rounded-md"
              style={{
                width: 28, height: 28,
                background: 'transparent', cursor: 'pointer',
                border: '1px solid rgba(200,168,74,0.28)',
                color: 'rgba(248,242,224,0.45)', fontSize: '0.9rem',
              }}
              title="Sair"
            >⎋</button>
          </div>
        </div>

        {/* Corpo: avatar + nome/tags + divider + relógio */}
        <div
          className="flex items-center gap-4"
          style={{ background: C.BG_CARD_TOP, padding: '14px 16px' }}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 54, height: 54, borderRadius: 12,
              background: C.BG_SECONDARY,
              border: `1.5px solid rgba(200,168,74,0.4)`,
              fontSize: '1.75rem',
              position: 'relative',
              boxShadow: '0 2px 10px rgba(62,47,28,0.15)',
            }}
          >
            🎖️
            <span style={{
              position: 'absolute', bottom: -3, right: -3,
              width: 11, height: 11, borderRadius: '50%',
              background: C.ENERGY,
              border: `2px solid ${C.BG_MAIN}`,
              animation: 'online-pulse 3s ease-in-out infinite',
            }} />
          </div>

          {/* Nome + tags */}
          <div className="flex-1 min-w-0">
            <p
              className="font-nunito font-black m-0 leading-tight truncate"
              style={{ fontSize: '1.15rem', color: C.TEXT_PRIMARY }}
            >
              {profile.nome}
            </p>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {/* Tag Reino — estática */}
              <span
                className="font-nunito font-bold"
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px', borderRadius: 5,
                  border: '1px solid rgba(200,168,74,0.35)',
                  color: C.TEXT_SECONDARY,
                  background: 'rgba(184,150,90,0.1)',
                }}
              >
                Reino: {profile.reino}
              </span>

              {/* Tag ID — clicável, só aparece se tiver ID */}
              {playerId && (
                <button
                  onClick={copiarId}
                  className="font-nunito font-bold"
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px', borderRadius: 5,
                    border: `1px solid ${idCopiado ? 'rgba(90,180,90,0.6)' : 'rgba(200,168,74,0.35)'}`,
                    color: idCopiado ? '#5AB45A' : C.TEXT_SECONDARY,
                    background: idCopiado ? 'rgba(90,180,90,0.12)' : 'rgba(184,150,90,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    lineHeight: 1,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                  title="Clique para copiar ID e Reino"
                >
                  {idCopiado ? (
                    <>✓ ID copiado</>
                  ) : (
                    <>📋 ID: {playerId}</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Divisor vertical */}
          <div style={{
            width: 1, height: 44, flexShrink: 0,
            background: `linear-gradient(180deg,transparent,${C.BORDER},transparent)`,
            opacity: 0.4,
          }} />

          {/* Relógio — fonte grande como o Beta 1 no Sobre */}
          <div className="text-right shrink-0">
            <p
              className="font-nunito font-black m-0 leading-none"
              style={{
                fontSize: '1.55rem',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.04em',
                color: C.TEXT_PRIMARY,
              }}
            >
              {horaServidor}
            </p>
            <p
              className="font-nunito font-black uppercase tracking-widest m-0"
              style={{ fontSize: '0.52rem', color: C.TEXT_MUTED, marginTop: 5 }}
            >
              SERVIDOR UTC+0
            </p>
          </div>
        </div>
      </div>

      {/* ── ARSENAL ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 8px', animation: 'reveal-up 0.4s 0.14s ease both' }}>
        <Divider label={t('home.arsenal.titulo')} extra={<LocaleSwitcher />} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {FERRAMENTAS_DEF.map((tool, i) => (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.id.startsWith('modal:')) setModalExtra(tool.id.replace('modal:', ''));
                else setRoute(tool.id);
              }}
              style={{
                background: C.BG_CARD,
                border: '1.5px solid rgba(200,168,74,0.22)',
                borderRadius: 13,
                padding: 0,
                textAlign: 'center', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
                position: 'relative',
                animation: `tool-in 0.3s ${0.16 + i * 0.04}s ease both`,
                transition: 'transform 0.12s, box-shadow 0.12s',
              }}
              onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = 'none'; }}
              onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = `0 4px 18px ${tool.cor}30`; }}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.boxShadow = 'none'; }}
              onTouchEnd={e   => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = `0 4px 18px ${tool.cor}30`; }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 18px ${tool.cor}30`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Borda colorida no topo */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg,transparent,${tool.cor},transparent)`,
                opacity: 0.75,
              }} />

              {/* Círculo do ícone */}
              <div style={{
                width: 56, height: 56,
                borderRadius: '50%',
                background: `${tool.cor}16`,
                border: `2px solid ${tool.cor}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 8,
                boxShadow: `0 2px 10px ${tool.cor}25`,
              }}>
                <span style={{ fontSize: '2rem', lineHeight: 1, filter: `drop-shadow(0 1px 4px ${tool.cor}55)` }}>
                  {tool.icon}
                </span>
              </div>

              <span className="font-cinzel font-bold"
                style={{ fontSize: '0.75rem', color: C.TEXT_PRIMARY, lineHeight: 1.2, letterSpacing: '0.3px' }}>
                {t(tool.tKey)}
              </span>
              <span className="font-nunito font-semibold"
                style={{ fontSize: '0.62rem', color: C.TEXT_MUTED, marginTop: 3 }}>
                {t(tool.subKey)}
              </span>
            </button>
          ))}
        </div>

        {/* ── CONSELHEIRO TÁTICO ─────────────────────────────────────── */}
        <div style={{ marginTop: 12 }}>
          <Divider label={t('home.conselheiro.titulo')} />
          <AssistenteTatico />
        </div>

      </div>

      {/* ── MODAL EXTRAS ─────────────────────────────────────────────── */}
      {modalExtra === 'color_builder' && (
        <ColorTextBuilder onClose={() => setModalExtra(null)} />
      )}

      {/* ── TELA DE IDIOMA ───────────────────────────────────────────────── */}
      {verIdioma && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }}>
          <ConfiguracoesIdioma onVoltar={() => setVerIdioma(false)} />
        </div>
      )}
    </div>
  );
};

export default Home;
