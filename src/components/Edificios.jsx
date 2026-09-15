import React from 'react';
import { useGameData } from '../data/GameDataContext.jsx';
import BuildingHub from './edificios/BuildingHub.jsx';
import NormalBuildingsView from './edificios/NormalBuildingsView.jsx';
import GrutaView from './edificios/GrutaView.jsx';
import BasilicaView from './edificios/BasilicaView.jsx';

export default function Edificios({ setRoute, initialView = 'hub' }) {
  const { edificios } = useGameData();
  const normal = edificios.filter(item => item.grupo !== 'especial' && item.tipoModulo !== 'gruta' && item.tipoModulo !== 'basilica');
  const gruta = edificios.find(item => item.tipoModulo === 'gruta' || item.slug === 'Gruta');
  const basilica = edificios.find(item => item.tipoModulo === 'basilica' || item.slug === 'Basilica');

  if (initialView === 'normal') return <NormalBuildingsView edificios={normal} setRoute={setRoute} />;
  if (initialView === 'gruta') return <GrutaView gruta={gruta} basilica={basilica} setRoute={setRoute} />;
  if (initialView === 'basilica') return <BasilicaView basilica={basilica} setRoute={setRoute} />;
  return <BuildingHub normalCount={normal.length} gruta={gruta} basilica={basilica} setRoute={setRoute} />;
}
