import React, { useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import Modal from '../ui/Modal.jsx';
import Toast from '../ui/Toast.jsx';
import { C } from '../theme.js';

const CHANGELOG = [
  {
    ver: 'Beta 2.1', icon: '🔧', nome: 'Correções e Ajustes de Torneios', cor: '#5A8A5C',
    items: [
      'Evolução de Tropas: reescrito com 3 fósseis (Crepúsculo 1, Crepúsculo 2, Ancião 2 — 10 pts cada), remoção das categorias de tropas e nova seção "Como Funciona" com instruções de obtenção via Antropos, Loja de Surpresas e eventos',
      'Habilidade de Dragão: corrigido valor de pontos por Essência da Fúria de 10 para 100 pontos',
      'Home: item Nuvem/Sincronização removido do grid de módulos',
    ],
  },
  {
    ver: 'Beta 2', icon: '⚔️', nome: 'Módulo de Torneios Reformulado', cor: '#C87A2C',
    items: [
      'Treinamento do Dragão: calculador com 6 tipos de carne (Carneiro, Boi, Frango, Veado, Salmão, Lagosta)',
      'Treino de Tropa: seleção de tropa, quantidade e bônus multiplicador (x1 a x5)',
      'Pontos de Talismã: grid 2×2, total com salvamento e campo de pontos possuídos',
      'General, Matar Tropas, Poder e Aliança: convertidos para páginas informativas',
      'Torneio de Conhecimento: renomeado do módulo de Poções Antigas',
      'Conselheiro Tático: assistente de IA integrado na Home, alimentado pelos dados do jogo',
    ],
  },
  {
    ver: 'Beta 1', icon: '🚀', nome: 'Lançamento Beta', cor: '#5C7FA3',
    items: [
      'Módulo de Itens com cadastro pelo painel Admin',
      'Importação de dados via interface web com progresso em tempo real',
      'Sistema de usuários com bloqueio por tentativas e reset de senha',
      'Painel Admin completo: tropas, níveis, itens, dragões, edifícios',
    ],
  },
];

const INFO_CARDS = [
  { icon: '🏰', title: 'Ferramenta Não Oficial', text: 'Criada pela comunidade, sem vínculo com a Deca Games. Resultados são aproximações baseadas em análises de jogadores.' },
  { icon: '⚔️', title: 'Cálculos Táticos',       text: 'As fórmulas foram estudadas e validadas por jogadores experientes. Pequenas variações podem ocorrer.' },
  { icon: '🐉', title: 'Dados Dinâmicos',         text: 'Base de dados actualizada regularmente pela comunidade. Contribuições são bem-vindas.' },
];

const Sobre = () => {
  const [openApoio,   setOpenApoio]   = useState(false);
  const [openContato, setOpenContato] = useState(false);
  const [toast,       setToast]       = useState({ open: false, message: '', severity: 'success' });

  const showToast  = (msg, sev = 'success') => setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast(t => ({ ...t, open: false }));

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    showToast(`${type} copiado com sucesso!`, 'success');
  };

  return (
    <div className="max-w-md mx-auto pb-6">
      <Toast {...toast} onClose={closeToast} />

      {/* ── Modal PIX ─────────────────────────────────────────────────────── */}
      <Modal open={openApoio} onClose={() => setOpenApoio(false)} maxWidth={320}>
        <div className="p-4 text-center">
          <p className="text-4xl m-0 mb-2">💎</p>
          <p className="font-cinzel font-bold text-base tracking-wide m-0 mb-1" style={{ color: C.ACCENT_DEEP }}>Apoiar o Projeto</p>
          <div className="gold-stripe mb-3 opacity-40" />
          <p className="font-nunito font-semibold text-sm leading-relaxed text-justify m-0 mb-3" style={{ color: C.TEXT_SECONDARY }}>
            Este Quartel-General é mantido com esforço e dedicação. Se este guia ajudou nas suas batalhas, considere pagar um café ao desenvolvedor!
          </p>
          <div className="py-2.5 px-3 rounded-lg mb-3" style={{ background: C.BG_SECONDARY, border: `2px dashed ${C.BORDER}` }}>
            <p className="font-nunito font-black text-[0.7rem] uppercase tracking-wider m-0 mb-0.5" style={{ color: C.TEXT_MUTED }}>Chave PIX:</p>
            <p className="font-mono font-black text-xl tracking-wide m-0" style={{ color: C.BLUE }}>37991260524</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setOpenApoio(false)}>Fechar</button>
            <button className="btn-success flex-1" onClick={() => handleCopy('37991260524', 'Chave PIX')}>Copiar PIX</button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Contato ─────────────────────────────────────────────────── */}
      <Modal open={openContato} onClose={() => setOpenContato(false)} maxWidth={320}>
        <div className="p-4 text-center">
          <p className="text-4xl m-0 mb-2">📬</p>
          <p className="font-cinzel font-bold text-base tracking-wide m-0 mb-1" style={{ color: C.BLUE }}>Linha Direta</p>
          <div className="gold-stripe mb-3 opacity-40" />
          <p className="font-nunito font-semibold text-sm leading-relaxed text-justify m-0 mb-3" style={{ color: C.TEXT_SECONDARY }}>
            Encontrou algum erro nos cálculos? Tem uma sugestão tática? Envie uma mensagem directamente para a engenharia central.
          </p>
          <div className="py-2.5 px-3 rounded-lg mb-3" style={{ background: C.BG_SECONDARY, border: `2px dashed ${C.BORDER}` }}>
            <p className="font-nunito font-black text-[0.7rem] uppercase tracking-wider m-0 mb-0.5" style={{ color: C.TEXT_MUTED }}>E-mail de Suporte:</p>
            <p className="font-mono font-black text-sm tracking-wide m-0" style={{ color: C.BLUE }}>suporte@guiadoa.com</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setOpenContato(false)}>Fechar</button>
            <button className="btn-navy flex-1" onClick={() => handleCopy('suporte@guiadoa.com', 'E-mail')}>Copiar E-mail</button>
          </div>
        </div>
      </Modal>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="tw-card mb-3">
        <GameHeader title="Guia Tático DOA" />
        <div className="p-4 text-center bg-aoe-card">
          <p className="text-5xl leading-none mb-2 m-0" style={{ filter: 'drop-shadow(1px 2px 3px rgba(62,47,28,0.2))' }}>🛡️</p>

          <div className="inline-flex items-center gap-2 mb-1">
            <p className="font-cinzel font-bold text-lg uppercase tracking-widest m-0" style={{ color: C.ACCENT_DEEP }}>
              Beta 2.1
            </p>
            <span
              className="font-nunito font-black text-[0.58rem] px-2 py-0.5 rounded-full text-white"
              style={{ background: C.SUCCESS, letterSpacing: '0.5px' }}
            >
              NOVO
            </span>
          </div>

          <p className="font-nunito font-semibold text-xs italic m-0 mb-2" style={{ color: C.TEXT_MUTED }}>
            "Correções de Torneios — Fósseis, Pontuações e Ajustes Visuais"
          </p>
          <div className="gold-stripe mb-3 opacity-50" />
          <p className="font-nunito font-semibold text-sm leading-relaxed text-justify m-0" style={{ color: C.TEXT_PRIMARY }}>
            Este aplicativo foi forjado para auxiliar os Comandantes a optimizarem os seus recursos, planearem os seus ataques e dominarem os torneios com precisão matemática.
          </p>
        </div>
      </div>

      {/* ── Info cards ────────────────────────────────────────────────────── */}
      <div className="tw-card mb-3">
        <GameHeader title="Sobre o Projeto" fontSize="0.78rem" />
        <div className="p-3 bg-aoe-card space-y-2">
          {INFO_CARDS.map(c => (
            <div key={c.title} className="flex gap-2.5 items-start p-2.5 rounded-lg" style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}` }}>
              <span className="text-2xl leading-none shrink-0 mt-0.5">{c.icon}</span>
              <div>
                <p className="font-nunito font-black text-xs m-0 mb-0.5" style={{ color: C.TEXT_PRIMARY }}>{c.title}</p>
                <p className="font-nunito text-[0.72rem] leading-snug m-0" style={{ color: C.TEXT_SECONDARY }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Changelog ─────────────────────────────────────────────────────── */}
      <div className="tw-card mb-3">
        <GameHeader title="Últimas Atualizações" fontSize="0.78rem" />
        <div className="p-3 bg-aoe-card space-y-2.5">
          {CHANGELOG.map((entry, i) => (
            <div key={entry.ver}
              className="rounded-lg overflow-hidden"
              style={{ border: `1.5px solid ${entry.cor}40`, borderLeft: `4px solid ${entry.cor}` }}
            >
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: `${entry.cor}12` }}>
                <span className="text-xl leading-none">{entry.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito font-black text-[0.8rem] m-0 leading-tight" style={{ color: C.TEXT_PRIMARY }}>
                    {entry.nome}
                  </p>
                  <p className="font-nunito font-bold text-[0.65rem] m-0" style={{ color: entry.cor }}>{entry.ver}</p>
                </div>
                {i === 0 && (
                  <span className="font-nunito font-black text-[0.58rem] px-1.5 py-0.5 rounded-full text-white" style={{ background: entry.cor }}>
                    NOVO
                  </span>
                )}
              </div>
              <div className="px-3 py-2 space-y-1">
                {entry.items.map(item => (
                  <p key={item} className="font-nunito text-[0.72rem] flex items-start gap-1.5 m-0" style={{ color: C.TEXT_SECONDARY }}>
                    <span style={{ color: entry.cor }} className="shrink-0 mt-0.5">▸</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Acções ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <button className="btn-gold btn-lg w-full" onClick={() => setOpenApoio(true)}>
          💎 Apoiar o Projeto
        </button>
        <button className="btn-navy btn-lg w-full" onClick={() => setOpenContato(true)}>
          📬 Linha Direta de Suporte
        </button>
      </div>
    </div>
  );
};

export default Sobre;
