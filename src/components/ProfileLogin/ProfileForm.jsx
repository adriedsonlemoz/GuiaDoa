import React, { useState } from 'react';
import { saveProfile } from '../../utils/storage.js';
import Toast from '../../ui/Toast.jsx';
import { useTorneioTimer } from '../../hooks/useTorneioTimer.js';
import { C } from '../../theme.js';
import ReinoSelector from './ReinoSelector.jsx';
import Field from './ProfileField.jsx';
import { useI18n, LOCALES_DISPONIVEIS } from '../../hooks/useI18n.jsx';

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
export default ProfileForm;
