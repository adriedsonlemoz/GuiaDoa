import React, { useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import Modal from '../ui/Modal.jsx';
import Toast from '../ui/Toast.jsx';
import { C } from '../theme.js';
import { DISPLAY_VERSION } from '../version.js';

const CHANGELOG = [
  {
    ver: DISPLAY_VERSION, icon: '🧩', nome: 'Arquitetura Modular — Fase 2', cor: '#5C7FA3',
    items: [
      'Ilhas separadas em regras, persistência, tabela, status, infraestrutura e produção',
      'Níveis separados em cálculo de progressão, estado, cartões, diálogos e tabela',
      'Dragões, Dicas, Home, Comparação de Tropas e Simulador de Batalha reorganizados em componentes de domínio menores',
      'Configuração da URL do serviço online centralizada em um único módulo',
      'Corrigida uma falha no seletor de tropas que poderia ocorrer ao abrir a comparação',
    ],
  },
  {
    ver: 'Beta 2.9', icon: '✨', nome: 'Experiência e Perfil Refinados', cor: '#5C7FA3',
    items: [
      'Mensagens de carregamento e sincronização foram reescritas para uma experiência mais clara e profissional',
      'Erros agora exibem códigos de suporte e permitem copiar um diagnóstico para facilitar a identificação de falhas',
      'Corrigida a falha que podia ocorrer ao avançar da escolha de idioma para a configuração do perfil',
      'Perfil redesenhado, dividido em componentes menores e com edição posterior sem apagar os dados do jogador',
      'Seletor de reinos melhorado para lidar corretamente com registros que ainda não possuem região ou idioma preenchidos',
    ],
  },
  {
    ver: 'Beta 2.8', icon: '☁️', nome: 'Dados Online como Fonte Única', cor: '#5A8A5C',
    items: [
      'Dados padrão passaram por migração automática para a base online antes da primeira utilização',
      'A migração é versionada e preserva alterações já cadastradas',
      'O primeiro acesso verifica a configuração e permite definir as credenciais administrativas quando necessário',
      'Tropas, níveis, dragões, edifícios, pesquisas, reinos e categorias são carregados exclusivamente pelo serviço online',
      'Caches antigos de dados do jogo foram removidos para evitar informações desatualizadas',
    ],
  },
  {
    ver: 'Beta 2.7', icon: '🧭', nome: 'Configuração Inteligente', cor: '#5A8A5C',
    items: [
      'Painel administrativo passou a detectar automaticamente a ausência do primeiro usuário e dos dados iniciais',
      'Foi introduzido o assistente de criação do primeiro administrador',
      'A versão preparou o projeto para a migração automática implementada na Beta 2.8',
    ],
  },
  {
    ver: 'Beta 2.6', icon: '🧩', nome: 'Arquitetura Modular', cor: '#5C7FA3',
    items: [
      'Painel administrativo reorganizado em módulos independentes por domínio',
      'Traduções separadas em catálogo, navegação de categorias e editor',
      'Aplicativo principal dividido em roteamento, sincronização, rotas, tratamento de erros e componentes de status',
      'Conselheiro Tático dividido em configuração, mensagens, modal e lógica de comunicação',
      'Novos testes protegem os principais fluxos após a modularização',
    ],
  },
  {
    ver: 'Beta 2.5', icon: '🌍', nome: 'Novos Reinos', cor: '#5A8A5C',
    items: [
      'Adicionados os Realms 345 Corvith (UTC+0), 346 Kenorax (UTC-7), 347 Eisenhold (UTC+1) e 348 Zulanka (UTC-4)',
      'Importação dos novos reinos passou a evitar duplicações e preservar informações complementares já cadastradas',
    ],
  },
  {
    ver: 'Beta 2.4', icon: '🗂️', nome: 'Organização dos Dados', cor: '#5A8A5C',
    items: [
      'Dados do GUIA DOA passaram a ter identificação própria para coexistir com outros projetos na mesma infraestrutura',
      'Diagnóstico e configuração passaram a informar de forma mais clara o estado dos dados do aplicativo',
    ],
  },
  {
    ver: 'Beta 2.2', icon: '🛡️', nome: 'Segurança e Estabilidade', cor: '#5A8A5C',
    items: [
      'Configuração inicial protegida após a criação do primeiro administrador',
      'Proteção contra tentativas repetidas de login e uso excessivo do Assistente Tático',
      'Uploads de dicas passaram a fazer rollback seguro em caso de falha',
      'Sincronização paralela e sanitização reforçada no painel administrativo',
    ],
  },
  {
    ver: 'Beta 2.1', icon: '🔧', nome: 'Correções e Ajustes de Torneios', cor: '#5A8A5C',
    items: [
      'Evolução de Tropas revisada com novos fósseis e instruções de obtenção',
      'Habilidade de Dragão: corrigido o valor de pontos por Essência da Fúria',
      'Tela inicial recebeu ajustes de organização',
    ],
  },
  {
    ver: 'Beta 2', icon: '⚔️', nome: 'Módulo de Torneios Reformulado', cor: '#C87A2C',
    items: [
      'Novas calculadoras e páginas informativas para os principais torneios',
      'Conselheiro Tático integrado à tela inicial e alimentado pelos dados do jogo',
    ],
  },
  {
    ver: 'Beta 1', icon: '🚀', nome: 'Lançamento Beta', cor: '#5C7FA3',
    items: [
      'Primeiros módulos de itens, tropas, níveis, dragões e edifícios',
      'Sistema administrativo com autenticação e gerenciamento de conteúdo',
    ],
  },
];

const INFO_CARDS = [
  { icon: '🏰', title: 'Ferramenta Não Oficial', text: 'Criada pela comunidade, sem vínculo com a Deca Games. Resultados são aproximações baseadas em análises de jogadores.' },
  { icon: '⚔️', title: 'Cálculos Táticos',       text: 'As fórmulas foram estudadas e validadas por jogadores experientes. Pequenas variações podem ocorrer.' },
  { icon: '🐉', title: 'Dados Dinâmicos',         text: 'Base de dados atualizada regularmente pela comunidade. Contribuições são bem-vindas.' },
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
            Encontrou algum erro nos cálculos? Tem uma sugestão tática? Envie uma mensagem diretamente para a equipe de suporte.
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
              {DISPLAY_VERSION}
            </p>
            <span
              className="font-nunito font-black text-[0.58rem] px-2 py-0.5 rounded-full text-white"
              style={{ background: C.SUCCESS, letterSpacing: '0.5px' }}
            >
              NOVO
            </span>
          </div>

          <p className="font-nunito font-semibold text-xs italic m-0 mb-2" style={{ color: C.TEXT_MUTED }}>
            "Dados sempre atualizados, onde você estiver"
          </p>
          <div className="gold-stripe mb-3 opacity-50" />
          <p className="font-nunito font-semibold text-sm leading-relaxed text-justify m-0" style={{ color: C.TEXT_PRIMARY }}>
            Este aplicativo foi forjado para auxiliar os Comandantes a otimizarem seus recursos, planejarem seus ataques e dominarem os torneios com precisão matemática.
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
