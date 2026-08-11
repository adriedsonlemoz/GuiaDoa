import React, { useState } from 'react';
import { getFusoOffset, getProfile } from '../utils/storage.js';
import { useTorneioTimer } from '../hooks/useTorneioTimer.js';
import { useI18n } from '../hooks/useI18n.jsx';
import { C } from '../theme.js';
import TorneioStatusCard         from './shared/TorneioStatusCard.jsx';
import EvolucaoTropas            from './torneios/EvolucaoTropas.jsx';
import PontosTalisma             from './torneios/PontosTalisma.jsx';
import TorneioPoder              from './torneios/TorneioPoder.jsx';
import TorneioAlianca            from './torneios/TorneioAlianca.jsx';
import TorneioMatarTropas        from './torneios/TorneioMatarTropas.jsx';
import TorneioTreinoTropa        from './torneios/TorneioTreinoTropa.jsx';
import TorneioHabilidadeDragao   from './torneios/TorneioHabilidadeDragao.jsx';
import TorneioGeneral            from './torneios/TorneioGeneral.jsx';
import TorneioAprimoramentoTropa from './torneios/TorneioAprimoramentoTropa.jsx';
import TreinamentoDoDragao       from './torneios/TreinamentoDoDragao.jsx';
import TorneioAceleracoes        from './torneios/TorneioAceleracoes.jsx';
import TorneioPocoes             from './torneios/TorneioPocoes.jsx';

const LISTA_TORNEIOS = [
  { id: 'general',             icon: '🎖️', catKey: 'poder',   cor: '#A83C2C', infoOnly: true  },
  { id: 'aprimoramento_tropa', icon: '🛡️', catKey: 'tropas',  cor: '#5C7FA3'                  },
  { id: 'evolucao_tropas',     icon: '⭐', catKey: 'tropas',  cor: '#C87A2C'                  },
  { id: 'habilidade_dragao',   icon: '🐉', catKey: 'dragao',  cor: '#8B6BAE'                  },
  { id: 'matar_tropas',        icon: '☠️', catKey: 'combate', cor: '#A83C2C', infoOnly: true  },
  { id: 'alianca',             icon: '🤝', catKey: 'alianca', cor: '#5A8A5C', infoOnly: true  },
  { id: 'pocoes_antigas',      icon: '📚', catKey: 'poder',   cor: '#8B3A9A'                  },
  { id: 'talisma',             icon: '🧿', catKey: 'magia',   cor: '#8B6BAE'                  },
  { id: 'poder',               icon: '⚡', catKey: 'poder',   cor: '#C87A2C', infoOnly: true  },
  { id: 'treino_tropa',        icon: '⚔️', catKey: 'tropas',  cor: '#A83C2C'                  },
  { id: 'treinamento_dragao',  icon: '🍖', catKey: 'dragao',  cor: '#8B6BAE'                  },
  { id: 'aceleracoes',         icon: '⏩', catKey: 'poder',   cor: '#3B5C8C'                  },
];

// Ordem fixa de exibição das categorias (não depende de ordenação alfabética por idioma)
const ORDEM_CATEGORIAS = ['alianca', 'combate', 'dragao', 'magia', 'poder', 'tropas'];

const MODULOS = {
  evolucao_tropas:      <EvolucaoTropas />,
  talisma:              <PontosTalisma />,
  poder:                <TorneioPoder />,
  habilidade_dragao:    <TorneioHabilidadeDragao />,
  alianca:              <TorneioAlianca />,
  matar_tropas:         <TorneioMatarTropas />,
  treino_tropa:         <TorneioTreinoTropa />,
  general:              <TorneioGeneral />,
  aprimoramento_tropa:  <TorneioAprimoramentoTropa />,
  treinamento_dragao:   <TreinamentoDoDragao />,
  aceleracoes:          <TorneioAceleracoes />,
  pocoes_antigas:       <TorneioPocoes />,
};

// ── Sub-componentes ─────────────────────────────────────────────────────────
const PHeader = ({ title, sub }) => (
  <div className="tw-card text-center px-4 py-3 mb-3 relative">
    <span className="absolute top-1.5 left-2" style={{ color: C.ACCENT, fontSize: 11, opacity: 0.7 }}>◆</span>
    <span className="absolute top-1.5 right-2" style={{ color: C.ACCENT, fontSize: 11, opacity: 0.7 }}>◆</span>
    <p className="font-nunito font-bold text-xs tracking-widest uppercase m-0" style={{ color: C.TEXT_PRIMARY }}>{title}</p>
    {sub && <p className="font-nunito italic text-[0.7rem] m-0 mt-0.5" style={{ color: C.TEXT_MUTED }}>{sub}</p>}
  </div>
);

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 my-2.5">
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C8A84A)' }} />
    <span style={{ color: C.ACCENT, fontSize: 9 }}>◆</span>
    {label && <span className="font-nunito font-bold text-[0.62rem] tracking-widest whitespace-nowrap" style={{ color: C.TEXT_MUTED, letterSpacing: '2.5px' }}>{label}</span>}
    {label && <span style={{ color: C.ACCENT, fontSize: 9 }}>◆</span>}
    <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, transparent, #C8A84A)' }} />
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
const Torneios = () => {
  const { t } = useI18n();
  const [torneioAtivo, setTorneioAtivo] = useState(null);
  const [highlighted,  setHighlighted]  = useState(null);

  const torneioAtual = LISTA_TORNEIOS.find(item => item.id === torneioAtivo);
  const profile = getProfile() || {};
  const offset  = getFusoOffset();
  const { horaLocal, countdown, isUrgente, faseTexto } = useTorneioTimer(offset);

  const catsPresentes = ORDEM_CATEGORIAS.filter(catKey =>
    LISTA_TORNEIOS.some(item => item.catKey === catKey)
  );

  return (
    <div className="max-w-2xl mx-auto pb-4">
      {!torneioAtivo && (
        <TorneioStatusCard
          horaLocal={horaLocal} countdown={countdown}
          isUrgente={isUrgente} faseTexto={faseTexto}
          fuso={profile.fuso} reino={profile.reino}
        />
      )}

      {torneioAtivo && torneioAtual ? (
        <div>
          {/* Barra do torneio ativo */}
          <div
            className="flex justify-between items-center p-3 mb-4 rounded-lg"
            style={{
              border: `2px solid ${torneioAtual.cor}`,
              borderLeft: `6px solid ${torneioAtual.cor}`,
              background: `linear-gradient(90deg, ${torneioAtual.cor}20 0%, ${C.BG_CARD} 100%)`,
              boxShadow: '0 3px 10px rgba(62,47,28,0.15)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="text-2xl leading-none p-1.5 rounded-lg"
                style={{ background: C.BG_CARD, border: `1.5px solid ${C.BORDER}` }}
              >
                {torneioAtual.icon}
              </div>
              <div>
                <p className="font-nunito font-bold text-[0.65rem] uppercase tracking-wide m-0" style={{ color: C.TEXT_MUTED }}>{t('torneio.ativo.label')}</p>
                <p className="font-nunito font-black text-base m-0 leading-tight" style={{ color: C.TEXT_PRIMARY }}>{t(`torneio.titulo.${torneioAtual.id}`)}</p>
              </div>
            </div>
            <button className="btn-danger btn-sm" onClick={() => { setTorneioAtivo(null); setHighlighted(null); }}>
              ← {t('torneio.acao.voltar')}
            </button>
          </div>

          {MODULOS[torneioAtual.id] ?? null}
        </div>
      ) : (
        <div>
          <PHeader title={t('torneio.hub.titulo')} sub={t('torneio.hub.subtitulo')} />

          {catsPresentes.map(catKey => (
            <div key={catKey}>
              <SectionDivider label={t(`torneio.cat.${catKey}`).toUpperCase()} />
              {LISTA_TORNEIOS.filter(item => item.catKey === catKey).map(item => {
                const isHigh = highlighted === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setHighlighted(item.id); setTimeout(() => setTorneioAtivo(item.id), 120); }}
                    className="w-full flex items-center gap-2.5 rounded-lg mb-1.5 cursor-pointer transition-all text-left border-none"
                    style={{
                      padding: '9px 12px',
                      background: isHigh ? `linear-gradient(90deg, ${item.cor}20 0%, ${C.BG_CARD} 100%)` : C.BG_CARD,
                      border: `1.5px solid ${isHigh ? item.cor : C.BORDER_SOFT}`,
                      borderLeft: `4px solid ${item.cor}`,
                      boxShadow: isHigh ? `0 2px 10px ${item.cor}25` : '0 1px 4px rgba(62,47,28,0.06)',
                    }}
                  >
                    <div
                      className="w-9 h-9 shrink-0 flex items-center justify-center text-lg rounded-lg"
                      style={{ background: `${item.cor}15`, border: `1.5px solid ${item.cor}45` }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-nunito font-black text-[0.82rem] m-0 leading-tight" style={{ color: C.TEXT_PRIMARY }}>{t(`torneio.titulo.${item.id}`)}</p>
                      <p className="font-nunito font-semibold text-[0.68rem] m-0 mt-0.5" style={{ color: C.TEXT_MUTED }}>{t(`torneio.desc.${item.id}`)}</p>
                    </div>
                    <div
                      className="font-nunito font-black text-[0.6rem] tracking-widest uppercase shrink-0 px-2.5 py-1 rounded-md"
                      style={{
                        background: isHigh ? item.cor : C.ACCENT,
                        color: '#FFF8EE',
                      }}
                    >
                      {isHigh ? t('torneio.acao.abrindo') : item.infoOnly ? t('torneio.acao.ver') : t('torneio.acao.calcular')}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Torneios;
