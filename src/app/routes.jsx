import React from 'react';

import Home from '../components/Home.jsx';
import Torneios from '../components/Torneios.jsx';
import Tropas from '../components/Tropas.jsx';
import TropaLista from '../components/tropas/TropaLista.jsx';
import TropaComparar from '../components/tropas/TropaComparar.jsx';
import CalculosTropas from '../components/CalculosTropas.jsx';
import Edificios from '../components/Edificios.jsx';
import Itens from '../components/Itens.jsx';
import Niveis from '../components/Niveis.jsx';
import Ilhas from '../components/Ilhas.jsx';
import Sobre from '../components/Sobre.jsx';
import Backup from '../components/Backup.jsx';
import AprimoramentoTropas from '../components/AprimoramentoTropas.jsx';
import EvolucaoTropas from '../components/torneios/EvolucaoTropas.jsx';
import PontosTalisma from '../components/torneios/PontosTalisma.jsx';
import TorneioPoder from '../components/torneios/TorneioPoder.jsx';
import TorneioAlianca from '../components/torneios/TorneioAlianca.jsx';
import TorneioMatarTropas from '../components/torneios/TorneioMatarTropas.jsx';
import TorneioTreinoTropa from '../components/torneios/TorneioTreinoTropa.jsx';
import TorneioHabilidadeDragao from '../components/torneios/TorneioHabilidadeDragao.jsx';
import TorneioGeneral from '../components/torneios/TorneioGeneral.jsx';
import TorneioAprimoramentoTropa from '../components/torneios/TorneioAprimoramentoTropa.jsx';
import TreinamentoDoDragao from '../components/torneios/TreinamentoDoDragao.jsx';
import Dragoes from '../components/dragoes/Dragoes.jsx';
import DragaoDetalhe from '../components/dragoes/DragaoDetalhe.jsx';
import DragaoTracker from '../components/dragoes/DragaoTracker.jsx';
import Pesquisas from '../components/pesquisas/Pesquisas.jsx';
import Dicas from '../components/Dicas.jsx';
import PesquisaDetalhe from '../components/pesquisas/PesquisaDetalhe.jsx';
import TorneioPocoes from '../components/torneios/TorneioPocoes.jsx';

const BASE_LABELS = {
  torneios: { label: 'Torneios', icon: '🏆' },
  tropas: { label: 'Tropas', icon: '⚔️' },
  tropas_lista: { label: 'Enciclopédia', icon: '📖' },
  tropas_comparar: { label: 'Comparar Tropas', icon: '⚖️' },
  calculostropas: { label: 'Cálculo de Tropas', icon: '🧮' },
  edificios: { label: 'Edifícios', icon: '🏰' },
  itens: { label: 'Itens', icon: '🎒' },
  niveis: { label: 'Níveis', icon: '📈' },
  ilhas: { label: 'Ilhas', icon: '🏝️' },
  sobre: { label: 'Sobre', icon: 'ℹ️' },
  backup: { label: 'Backup', icon: '💾' },
  evolucao_tropas: { label: 'Evolução de Tropas', icon: '⬆️' },
  talisma: { label: 'Pontos Talismã', icon: '🔮' },
  poder: { label: 'Torneio de Poder', icon: '⚡' },
  alianca: { label: 'Aliança', icon: '🤝' },
  matar_tropas: { label: 'Matar Tropas', icon: '💀' },
  treino_tropa: { label: 'Treino de Tropa', icon: '🎯' },
  habilidade_dragao: { label: 'Habilidade do Dragão', icon: '🐉' },
  torneio_general: { label: 'General', icon: '🎖️' },
  aprimoramento_tropa: { label: 'Aprimoramento de Tropa', icon: '🔧' },
  aprimoramento_tropas: { label: 'Aprimoramento de Tropas', icon: '⚗️' },
  conhecimento: { label: 'Conhecimento', icon: '📚' },
  treinamento_dragao: { label: 'Treinamento do Dragão', icon: '🔥' },
  dragoes: { label: 'Dragões', icon: '🐉' },
  pesquisas: { label: 'Pesquisas', icon: '🔬' },
  dicas: { label: 'Dicas', icon: '💡' },
  pocoes_antigas: { label: 'Poções Antigas', icon: '🧪' },
};

export function renderRoute(route, setRoute) {
  switch (route) {
    case 'home': return <Home setRoute={setRoute} />;
    case 'torneios': return <Torneios setRoute={setRoute} />;
    case 'tropas': return <Tropas setRoute={setRoute} />;
    case 'tropas_lista': return <TropaLista />;
    case 'tropas_comparar': return <TropaComparar />;
    case 'calculostropas': return <CalculosTropas setRoute={setRoute} />;
    case 'edificios': return <Edificios setRoute={setRoute} />;
    case 'itens': return <Itens setRoute={setRoute} />;
    case 'niveis': return <Niveis />;
    case 'ilhas': return <Ilhas />;
    case 'sobre': return <Sobre />;
    case 'backup': return <Backup />;
    case 'evolucao_tropas': return <EvolucaoTropas />;
    case 'talisma': return <PontosTalisma />;
    case 'poder': return <TorneioPoder />;
    case 'alianca': return <TorneioAlianca />;
    case 'matar_tropas': return <TorneioMatarTropas />;
    case 'treino_tropa': return <TorneioTreinoTropa />;
    case 'habilidade_dragao': return <TorneioHabilidadeDragao />;
    case 'torneio_general': return <TorneioGeneral />;
    case 'aprimoramento_tropa': return <TorneioAprimoramentoTropa />;
    case 'aprimoramento_tropas': return <AprimoramentoTropas setRoute={setRoute} />;
    case 'conhecimento': return <TorneioPocoes />;
    case 'treinamento_dragao': return <TreinamentoDoDragao />;
    case 'dragoes': return <Dragoes setRoute={setRoute} />;
    case 'pesquisas': return <Pesquisas setRoute={setRoute} />;
    case 'dicas': return <Dicas setRoute={setRoute} />;
    case 'pocoes_antigas': return <TorneioPocoes />;
    default:
      if (route.startsWith('pesquisa_')) {
        return <PesquisaDetalhe slug={route.replace('pesquisa_', '')} />;
      }
      if (route.startsWith('dragao_tracker_')) {
        return <DragaoTracker dragaoId={route.replace('dragao_tracker_', '')} />;
      }
      if (route.startsWith('dragao_')) {
        return <DragaoDetalhe dragaoId={route.replace('dragao_', '')} />;
      }
      return <Home setRoute={setRoute} />;
  }
}

export function getRouteLabel(route, dragoes = []) {
  if (BASE_LABELS[route]) return BASE_LABELS[route];
  if (route.startsWith('dragao_tracker_')) {
    const id = route.replace('dragao_tracker_', '');
    const d = dragoes.find((item) => item.id === id);
    if (d) return { label: `${d.nome} — Progresso`, icon: '📊' };
  }
  if (route.startsWith('pesquisa_')) {
    return { label: route.replace('pesquisa_', '').replace(/-/g, ' '), icon: '🔬' };
  }
  if (route.startsWith('dragao_')) {
    const id = route.replace('dragao_', '');
    const d = dragoes.find((item) => item.id === id);
    if (d) return { label: d.nome, icon: d.emojiDragao };
  }
  return null;
}
