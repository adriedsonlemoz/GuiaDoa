import React, { useState, useRef, useEffect } from 'react';
import { saveProfile } from '../../utils/storage.js';
import Toast from '../../ui/Toast.jsx';
import { useTorneioTimer } from '../../hooks/useTorneioTimer.js';
import { C } from '../../theme.js';
import { useI18n, LOCALES_DISPONIVEIS } from '../../hooks/useI18n.jsx';
import { dbReinos as DB_REINOS_FALLBACK } from '../../data/reinos.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* ─── helpers ───────────────────────────────────────────────────────────────── */
// REGIOES agora é calculado dinamicamente dentro do ReinoSelector, a partir dos reinos carregados da API.

const ReinoCard = ({ reino, selecionado, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(reino)}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', textAlign: 'left',
      padding: '9px 12px',
      background: selecionado
        ? 'linear-gradient(90deg,rgba(28,58,94,0.18),rgba(200,168,74,0.10))'
        : 'transparent',
      border: 'none',
      borderBottom: `1px solid rgba(200,168,74,0.12)`,
      borderLeft: selecionado ? '3px solid #C8A84A' : '3px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }}
  >
    {/* ID */}
    <span style={{
      fontFamily: 'monospace', fontWeight: 900, fontSize: '0.68rem',
      color: selecionado ? C.ACCENT : C.TEXT_FAINT,
      minWidth: 26, textAlign: 'right', flexShrink: 0,
    }}>
      {reino.id}
    </span>

    {/* Nome + Região */}
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{
        display: 'block',
        fontFamily: '"Nunito",sans-serif', fontWeight: 900,
        fontSize: '0.82rem',
        color: selecionado ? C.TEXT_PRIMARY : C.TEXT_SECONDARY,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {reino.nome}
      </span>
      <span style={{
        fontFamily: '"Nunito",sans-serif', fontWeight: 600,
        fontSize: '0.62rem', color: C.TEXT_FAINT,
      }}>
        {reino.regiao} · {reino.idioma}
      </span>
    </span>

    {/* Fuso */}
    <span style={{
      fontFamily: 'monospace', fontWeight: 800, fontSize: '0.7rem',
      color: selecionado ? C.ACCENT : C.TEXT_MUTED,
      background: selecionado ? 'rgba(200,168,74,0.15)' : 'rgba(200,168,74,0.06)',
      border: `1px solid ${selecionado ? 'rgba(200,168,74,0.5)' : 'rgba(200,168,74,0.2)'}`,
      borderRadius: 5, padding: '2px 6px', flexShrink: 0,
    }}>
      {reino.fuso}
    </span>
  </button>
);

/* ─── Seletor customizado ───────────────────────────────────────────────────── */
const ReinoSelector = ({ value, onChange }) => {
  const [aberto,   setAberto]   = useState(false);
  const [regiao,   setRegiao]   = useState('');
  const [reinos,   setReinos]   = useState(DB_REINOS_FALLBACK); // fallback estático enquanto carrega
  const [carregando, setCarregando] = useState(true);
  const painelRef = useRef(null);

  const selecionado = reinos.find(r => r.nome === value) || null;
  const REGIOES = [...new Set(reinos.map(r => r.regiao).filter(Boolean))].sort();

  // Busca reinos cadastrados no admin (api/routes/reinos.js)
  useEffect(() => {
    fetch(`${API}/api/reinos`)
      .then(r => r.json())
      .then(data => {
        const lista = Array.isArray(data?.reinos) ? data.reinos : [];
        if (lista.length > 0) setReinos(lista);
        // Se a API não retornar nada, mantém o fallback estático já carregado
        setCarregando(false);
      })
      .catch(() => setCarregando(false)); // erro de rede → mantém fallback
  }, []);

  // Fecha ao clicar fora — sem foco automático em nenhum input (evita abrir teclado)
  useEffect(() => {
    if (!aberto) return;
    const fn = e => {
      if (painelRef.current && !painelRef.current.contains(e.target)) setAberto(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [aberto]);

  const filtrados = reinos
    .filter(r => !regiao || r.regiao === regiao)
    .sort((a, b) => b.id - a.id); // maior ID primeiro

  const selecionar = reino => {
    onChange(reino);
    setAberto(false);
  };

  return (
    <div ref={painelRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setAberto(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px',
          background: '#F8F4E8',
          border: `1.5px solid ${aberto ? C.ACCENT_DEEP : C.BORDER}`,
          borderRadius: aberto ? '8px 8px 0 0' : 8,
          cursor: 'pointer', textAlign: 'left',
          boxShadow: aberto ? `0 0 0 3px rgba(200,168,74,0.15)` : 'none',
          transition: 'all 0.15s',
        }}
      >
        {selecionado ? (
          <>
            <span style={{
              fontFamily: 'monospace', fontWeight: 900, fontSize: '0.68rem',
              color: C.TEXT_FAINT, minWidth: 26, textAlign: 'right', flexShrink: 0,
            }}>{selecionado.id}</span>
            <span style={{ flex: 1 }}>
              <span style={{
                display: 'block', fontFamily: '"Nunito",sans-serif',
                fontWeight: 900, fontSize: '0.85rem', color: C.TEXT_PRIMARY,
              }}>
                {selecionado.nome}
              </span>
              <span style={{
                fontFamily: '"Nunito",sans-serif', fontWeight: 600,
                fontSize: '0.62rem', color: C.TEXT_FAINT,
              }}>
                {selecionado.regiao} · {selecionado.idioma}
              </span>
            </span>
            <span style={{
              fontFamily: 'monospace', fontWeight: 800, fontSize: '0.7rem',
              color: C.ACCENT, background: 'rgba(200,168,74,0.12)',
              border: '1px solid rgba(200,168,74,0.35)',
              borderRadius: 5, padding: '2px 6px', flexShrink: 0,
            }}>{selecionado.fuso}</span>
          </>
        ) : (
          <span style={{
            fontFamily: '"Nunito",sans-serif', fontWeight: 700,
            fontSize: '0.82rem', color: C.TEXT_FAINT, flex: 1,
          }}>
            — Selecionar Reino —
          </span>
        )}
        <span style={{
          color: C.TEXT_FAINT, fontSize: '0.75rem',
          transform: aberto ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s', flexShrink: 0,
        }}>▾</span>
      </button>

      {/* Dropdown */}
      {aberto && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
          background: '#F2EADA',
          border: `1.5px solid ${C.BORDER}`,
          borderTop: `1px solid rgba(200,168,74,0.3)`,
          borderRadius: '0 0 10px 10px',
          boxShadow: '0 8px 24px rgba(62,47,28,0.20)',
          overflow: 'hidden',
        }}>
          {/* Filtro de região — select não abre teclado virtual */}
          <div style={{
            padding: '8px 10px', borderBottom: `1px solid rgba(200,168,74,0.2)`,
            background: '#EAE0C8', display: 'flex', gap: 6, alignItems: 'center',
          }}>
            <span style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 700,
              fontSize: '0.7rem', color: C.TEXT_SECONDARY, flexShrink: 0,
            }}>Filtrar:</span>
            <select
              value={regiao}
              onChange={e => setRegiao(e.target.value)}
              style={{
                flex: 1, fontFamily: '"Nunito",sans-serif', fontWeight: 700,
                fontSize: '0.74rem', background: '#F8F4E8',
                border: `1.5px solid ${C.BORDER}`, borderRadius: 6,
                padding: '6px 8px', color: C.TEXT_SECONDARY, cursor: 'pointer',
              }}
            >
              <option value="">Todas as regiões</option>
              {REGIOES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Lista rolável — sem input de texto, sem teclado */}
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {carregando ? (
              <div style={{
                padding: '18px', textAlign: 'center',
                fontFamily: '"Nunito",sans-serif', fontWeight: 700,
                fontSize: '0.78rem', color: C.TEXT_FAINT,
              }}>
                Carregando reinos…
              </div>
            ) : filtrados.length === 0 ? (
              <div style={{
                padding: '18px', textAlign: 'center',
                fontFamily: '"Nunito",sans-serif', fontWeight: 700,
                fontSize: '0.78rem', color: C.TEXT_FAINT,
              }}>
                Nenhum reino nessa região
              </div>
            ) : filtrados.map(r => (
              <ReinoCard
                key={r.id}
                reino={r}
                selecionado={value === r.nome}
                onClick={selecionar}
              />
            ))}
          </div>

          {/* Rodapé contagem */}
          <div style={{
            padding: '5px 12px', background: '#EAE0C8',
            borderTop: `1px solid rgba(200,168,74,0.2)`,
            fontFamily: '"Nunito",sans-serif', fontWeight: 700,
            fontSize: '0.62rem', color: C.TEXT_FAINT,
          }}>
            {filtrados.length} de {reinos.length} reinos
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── ProfileForm ───────────────────────────────────────────────────────────── */
const ProfileForm = ({ onSave, perfilAtual }) => {
  const [step,     setStep]     = useState(perfilAtual ? 1 : 0); // 0=idioma, 1=perfil
  const [nome,     setNome]     = useState(perfilAtual?.nome     || '');
  const [reino,    setReino]    = useState(perfilAtual?.reino    || '');
  const [fuso,     setFuso]     = useState(perfilAtual?.fuso     || '');
  const [playerId, setPlayerId] = useState(perfilAtual?.playerId || '');
  const [toast,    setToast]    = useState({ open: false, message: '', severity: 'success' });
  const { locale, setLocale }   = useI18n();

  const match  = fuso ? fuso.match(/UTC([+-]?\d+)/) : null;
  const offset = match ? parseInt(match[1], 10) : 0;
  const { horaLocal } = useTorneioTimer(fuso ? offset : null);

  const showToast  = (msg, sev = 'success') => setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast(t => ({ ...t, open: false }));

  const handleSelecionarReino = r => {
    setReino(r.nome);
    setFuso(r.fuso);
  };

  const handleSave = () => {
    if (!nome.trim() || !reino.trim() || !fuso) {
      showToast('Preencha nome e reino antes de continuar!', 'warning');
      return;
    }
    const p = { nome: nome.trim(), reino, fuso, playerId: playerId.trim() };
    saveProfile(p);
    onSave(p);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.BG_MAIN }}>
      <Toast {...toast} onClose={closeToast} />

      {/* ── STEP 0: Escolha de idioma ──────────────────────────────────── */}
      {step === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(160deg,#1C3A5E 0%,#2A4C72 100%)',
            padding: '40px 20px 32px',
            textAlign: 'center',
            borderBottom: '2px solid #A88530',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
              background: 'linear-gradient(90deg,transparent,rgba(200,168,74,0.6),transparent)',
            }} />
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'radial-gradient(circle,rgba(200,168,74,0.25) 0%,rgba(28,58,94,0.6) 70%)',
              border: '2px solid rgba(200,168,74,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', margin: '0 auto 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>🌐</div>
            <p style={{
              fontFamily: '"Cinzel",serif', fontWeight: 700,
              fontSize: '1.1rem', letterSpacing: '3px',
              color: '#F8F2E0', margin: 0, textTransform: 'uppercase',
            }}>Bem-vindo</p>
            <p style={{
              fontFamily: '"Cinzel",serif', fontWeight: 700,
              fontSize: '1.1rem', letterSpacing: '3px',
              color: '#F8F2E0', margin: '2px 0 0', textTransform: 'uppercase',
            }}>Welcome</p>
            <p style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 600,
              fontSize: '0.72rem', color: 'rgba(200,168,74,0.7)',
              letterSpacing: '1.5px', margin: '8px 0 0',
            }}>◆ GUIA DOA ◆</p>
          </div>

          {/* Corpo */}
          <div style={{ flex: 1, padding: '28px 20px', maxWidth: 480, width: '100%', margin: '0 auto' }}>
            <p style={{
              fontFamily: '"Cinzel",serif', fontWeight: 700,
              fontSize: '0.82rem', letterSpacing: '2px',
              color: C.TEXT_PRIMARY, textAlign: 'center',
              textTransform: 'uppercase', marginBottom: 6,
            }}>Escolha seu idioma</p>
            <p style={{
              fontFamily: '"Cinzel",serif', fontWeight: 600,
              fontSize: '0.72rem', color: C.TEXT_MUTED,
              textAlign: 'center', marginBottom: 24, letterSpacing: '1px',
            }}>Choose your language</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LOCALES_DISPONIVEIS.map(loc => (
                <button key={loc.code}
                  onClick={() => { setLocale(loc.code); setStep(1); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px',
                    background: locale === loc.code
                      ? 'linear-gradient(90deg,rgba(28,58,94,0.12),rgba(200,168,74,0.08))'
                      : C.BG_CARD,
                    border: `1.5px solid ${locale === loc.code ? 'rgba(200,168,74,0.6)' : 'rgba(200,168,74,0.25)'}`,
                    borderLeft: `4px solid ${locale === loc.code ? C.ACCENT : 'transparent'}`,
                    borderRadius: 12, cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: locale === loc.code ? '0 2px 12px rgba(200,168,74,0.15)' : 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,168,74,0.5)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = locale === loc.code ? 'rgba(200,168,74,0.6)' : 'rgba(200,168,74,0.25)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <span style={{ fontSize: '2.2rem', lineHeight: 1, flexShrink: 0 }}>{loc.flag}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <span style={{
                      display: 'block',
                      fontFamily: '"Nunito",sans-serif', fontWeight: 900,
                      fontSize: '1rem', color: C.TEXT_PRIMARY,
                    }}>{loc.nativo}</span>
                    <span style={{
                      fontFamily: '"Nunito",sans-serif', fontWeight: 600,
                      fontSize: '0.7rem', color: C.TEXT_MUTED,
                    }}>{loc.label}</span>
                  </div>
                  {locale === loc.code && (
                    <span style={{
                      color: C.ACCENT, fontSize: '1.1rem', flexShrink: 0,
                    }}>✓</span>
                  )}
                  <span style={{ color: C.TEXT_FAINT, fontSize: '1rem', flexShrink: 0 }}>›</span>
                </button>
              ))}
            </div>

            <p style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 600,
              fontSize: '0.65rem', color: C.TEXT_FAINT,
              textAlign: 'center', marginTop: 20, lineHeight: 1.6,
            }}>
              Você poderá trocar o idioma a qualquer momento nas configurações.<br />
              You can change the language anytime in settings.
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 1: Formulário de perfil ────────────────────────────────── */}
      {step === 1 && (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* ── Header navy ─────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(160deg, #1C3A5E 0%, #2A4C72 100%)',
          padding: '32px 20px 28px',
          textAlign: 'center',
          borderBottom: '2px solid #A88530',
          position: 'relative', overflow: 'hidden',
        }}>
        {/* Ornamento topo */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
          background: 'linear-gradient(90deg,transparent,rgba(200,168,74,0.6),transparent)',
        }} />

        {/* Ícone com halo */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(200,168,74,0.25) 0%,rgba(28,58,94,0.6) 70%)',
          border: '2px solid rgba(200,168,74,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem', margin: '0 auto 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>🛡️</div>

        <p style={{
          fontFamily: '"Cinzel",serif', fontWeight: 700,
          fontSize: '1.1rem', letterSpacing: '3px',
          color: '#F8F2E0', margin: 0, textTransform: 'uppercase',
        }}>
          Recrutamento
        </p>
        <p style={{
          fontFamily: '"Nunito",sans-serif', fontWeight: 600,
          fontSize: '0.72rem', color: 'rgba(200,168,74,0.7)',
          letterSpacing: '1.5px', margin: '4px 0 0',
        }}>
          ◆ GUIA DOA ◆
        </p>
      </div>

      {/* ── Formulário ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '0 0 32px', maxWidth: 480, width: '100%', margin: '0 auto' }}>

        {/* Banner não oficial */}
        <div style={{
          margin: '16px 14px 14px',
          padding: '10px 13px',
          borderRadius: 10,
          border: `1.5px dashed ${C.ACCENT}`,
          background: 'rgba(200,168,74,0.07)',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>⚠️</span>
          <div>
            <p style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 900,
              fontSize: '0.68rem', color: C.ERROR,
              textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px',
            }}>
              Ferramenta Não Oficial
            </p>
            <p style={{
              fontFamily: '"Nunito",sans-serif', fontWeight: 600,
              fontSize: '0.68rem', color: C.TEXT_MUTED,
              lineHeight: 1.45, margin: 0,
            }}>
              Cálculos são aproximações comunitárias, sem ligação com os servidores da Deca Games.
            </p>
          </div>
        </div>

        {/* Card principal */}
        <div style={{
          background: C.BG_CARD,
          border: `1.5px solid ${C.BORDER}`,
          borderRadius: 14,
          boxShadow: '0 4px 18px rgba(62,47,28,0.12)',
          margin: '0 14px',
        }}>
          {/* Cabeçalho do card */}
          <div style={{
            background: 'linear-gradient(180deg,#EAE0C8,#E0D4B0)',
            borderBottom: `1.5px solid ${C.BORDER}`,
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            borderRadius: '14px 14px 0 0',
          }}>
            <span style={{ position: 'absolute', left: 10, color: C.ACCENT, fontSize: '0.65rem', opacity: 0.7 }}>◆</span>
            <span style={{
              fontFamily: '"Cinzel",serif', fontWeight: 700,
              fontSize: '0.78rem', letterSpacing: '2.5px',
              color: C.TEXT_PRIMARY, textTransform: 'uppercase',
            }}>
              Identificação do Comandante
            </span>
            <span style={{ position: 'absolute', right: 10, color: C.ACCENT, fontSize: '0.65rem', opacity: 0.7 }}>◆</span>
          </div>

          <div style={{ padding: '18px 16px' }}>
            {/* Nome */}
            <Field label="Nome do Comandante">
              <input
                className="tw-input"
                placeholder="Como você é conhecido…"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </Field>

            {/* ID do Jogador */}
            <Field label="ID do Jogador" hint="Opcional — encontre no perfil do jogo">
              <input
                className="tw-input font-mono"
                placeholder="Ex: 12345678"
                inputMode="numeric"
                value={playerId}
                onChange={e => setPlayerId(e.target.value.replace(/\D/g, ''))}
                style={{ letterSpacing: '0.1em' }}
              />
            </Field>

            {/* Divisor */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              margin: '14px 0 16px',
            }}>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${C.BORDER})`, opacity: 0.4 }} />
              <span style={{ color: C.ACCENT, fontSize: '0.65rem' }}>⚔</span>
              <span style={{
                fontFamily: '"Nunito",sans-serif', fontWeight: 900,
                fontSize: '0.6rem', letterSpacing: '2px', color: C.TEXT_MUTED,
                textTransform: 'uppercase',
              }}>
                Seu Reino
              </span>
              <span style={{ color: C.ACCENT, fontSize: '0.65rem' }}>⚔</span>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg,transparent,${C.BORDER})`, opacity: 0.4 }} />
            </div>

            {/* Seletor de Reino */}
            <Field label="Reino">
              <ReinoSelector value={reino} onChange={handleSelecionarReino} />
            </Field>

            {/* Relógio do servidor */}
            {fuso && (
              <div style={{
                margin: '4px 0 16px',
                padding: '10px 14px',
                borderRadius: 9,
                background: 'linear-gradient(90deg,rgba(28,58,94,0.08),rgba(200,168,74,0.06))',
                border: '1px solid rgba(200,168,74,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: '"Nunito",sans-serif', fontWeight: 700,
                  fontSize: '0.68rem', color: C.TEXT_MUTED,
                }}>
                  🕐 Relógio do servidor
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontFamily: 'monospace', fontWeight: 900,
                    fontSize: '1rem', color: C.ACCENT,
                    letterSpacing: '0.05em',
                  }}>
                    {horaLocal}
                  </span>
                  <span style={{
                    display: 'block', fontFamily: 'monospace',
                    fontSize: '0.62rem', color: C.TEXT_FAINT,
                  }}>
                    {fuso}
                  </span>
                </div>
              </div>
            )}

            {/* Botão */}
            <button
              onClick={handleSave}
              style={{
                width: '100%',
                background: 'linear-gradient(180deg,#4A6FA5,#2A4470)',
                border: '1.5px solid #1C3A5E',
                borderRadius: 10, padding: '13px',
                fontFamily: '"Nunito",sans-serif', fontWeight: 900,
                fontSize: '0.88rem', letterSpacing: '1.5px',
                color: '#F8F2E0', cursor: 'pointer',
                textTransform: 'uppercase',
                boxShadow: '0 3px 12px rgba(28,58,94,0.35)',
                transition: 'all 0.15s',
              }}
            >
              ⚔ Aceder ao Quartel
            </button>
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};

/* ─── Field helper ──────────────────────────────────────────────────────────── */
const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
      <label style={{
        fontFamily: '"Nunito",sans-serif', fontWeight: 900,
        fontSize: '0.63rem', letterSpacing: '1.5px',
        color: C.TEXT_MUTED, textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {hint && (
        <span style={{
          fontFamily: '"Nunito",sans-serif', fontWeight: 600,
          fontSize: '0.6rem', color: C.TEXT_FAINT,
          textTransform: 'none', letterSpacing: 0,
        }}>
          ({hint})
        </span>
      )}
    </div>
    {children}
  </div>
);

export default ProfileForm;
