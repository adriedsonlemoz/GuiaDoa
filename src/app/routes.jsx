import React from 'react';

import Home from '../components/Home.jsx';
import Torneios from '../components/Torneios.jsx';
import Tropas from '../components/Tropas.jsx';
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
import CampanhaMapa from '../components/CampanhaMapa.jsx';

const BASE_LABELS = {
  torneios: { key: 'home.botao.torneios', icon: '🏆' },
  tropas: { key: 'home.botao.tropas', icon: '⚔️' },
  tropas_lista: { key: 'home.botao.tropas.sub', icon: '📖' },
  tropas_comparar: { key: 'troops.compare', icon: '⚖️' },
  calculostropas: { key: 'troops.simulator', icon: '🧮' },
  edificios: { key: 'home.botao.edificios', icon: '🏰' },
  edificios_normais: { key: 'buildings.normal_title', icon: '🏠' },
  edificios_gruta: { key: 'buildings.cave_title', icon: '🕳️' },
  edificios_basilica: { key: 'buildings.basilica_title', icon: '⛪' },
  itens: { key: 'home.botao.itens', icon: '🎒' },
  niveis: { key: 'home.botao.niveis', icon: '📈' },
  ilhas: { key: 'home.botao.ilhas', icon: '🏝️' },
  sobre: { key: 'home.botao.sobre.sub', icon: 'ℹ️' },
  backup: { key: 'backup.nav', icon: '💾' },
  evolucao_tropas: { key: 'torneio.titulo.evolucao_tropas', icon: '⬆️' },
  talisma: { key: 'torneio.titulo.talisma', icon: '🔮' },
  poder: { key: 'torneio.titulo.poder', icon: '⚡' },
  alianca: { key: 'torneio.cat.alianca', icon: '🤝' },
  matar_tropas: { key: 'torneio.titulo.matar_tropas', icon: '💀' },
  treino_tropa: { key: 'torneio.titulo.treino_tropa', icon: '🎯' },
  habilidade_dragao: { key: 'torneio.titulo.habilidade_dragao', icon: '🐉' },
  torneio_general: { key: 'torneio.titulo.general', icon: '🎖️' },
  aprimoramento_tropa: { key: 'torneio.titulo.aprimoramento_tropa', icon: '🔧' },
  aprimoramento_tropas: { key: 'torneio.titulo.aprimoramento_tropa', icon: '⚗️' },
  conhecimento: { key: 'torneio.titulo.pocoes_antigas', icon: '📚' },
  treinamento_dragao: { key: 'torneio.titulo.treinamento_dragao', icon: '🔥' },
  dragoes: { key: 'home.botao.dragoes', icon: '🐉' },
  pesquisas: { key: 'home.botao.pesquisas', icon: '🔬' },
  dicas: { key: 'home.botao.dicas', icon: '💡' },
  pocoes_antigas: { key: 'torneio.titulo.pocoes_antigas', icon: '🧪' },
  campanha: { key: 'campaign.title', icon: '🗺️' },
};

export function renderRoute(route, setRoute) {
  switch (route) {
    case 'home': return <Home setRoute={setRoute} />;
    case 'torneios': return <Torneios setRoute={setRoute} />;
    case 'tropas': return <Tropas setRoute={setRoute} />;
    case 'tropas_lista': return <Tropas setRoute={setRoute} />;
    case 'tropas_comparar': return <TropaComparar />;
    case 'calculostropas': return <CalculosTropas setRoute={setRoute} />;
    case 'edificios': return <Edificios setRoute={setRoute} initialView="hub" />;
    case 'edificios_normais': return <Edificios setRoute={setRoute} initialView="normal" />;
    case 'edificios_gruta': return <Edificios setRoute={setRoute} initialView="gruta" />;
    case 'edificios_basilica': return <Edificios setRoute={setRoute} initialView="basilica" />;
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
    case 'campanha': return <CampanhaMapa setRoute={setRoute} />;
    default:
      if (route.startsWith('pesquisa_')) {
        return <PesquisaDetalhe slug={route.replace('pesquisa_', '')} />;
      }
      if (route.startsWith('dragao_tracker_')) {
        return <DragaoTracker dragaoId={route.replace('dragao_tracker_', '')} setRoute={setRoute} />;
      }
      if (route.startsWith('dragao_')) {
        return <DragaoDetalhe dragaoId={route.replace('dragao_', '')} setRoute={setRoute} />;
      }
      return <Home setRoute={setRoute} />;
  }
}

export function getRouteLabel(route, dragoes = [], t = (key) => key, content = (record, field) => record?.[field]) {
  if (BASE_LABELS[route]) {
    const item = BASE_LABELS[route];
    return { ...item, label: item.key ? t(item.key) : item.label };
  }
  if (route.startsWith('dragao_tracker_')) {
    const id = route.replace('dragao_tracker_', '');
    const d = dragoes.find((item) => item.id === id);
    if (d) return { label: `${content(d, 'nome')} — ${t('levels.progress')}`, icon: '📊' };
  }
  if (route.startsWith('pesquisa_')) {
    return { label: route.replace('pesquisa_', '').replace(/-/g, ' '), icon: '🔬' };
  }
  if (route.startsWith('dragao_')) {
    const id = route.replace('dragao_', '');
    const d = dragoes.find((item) => item.id === id);
    if (d) return { label: content(d, 'nome'), icon: d.emojiDragao };
  }
  return null;
}
