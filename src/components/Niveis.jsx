import React from 'react';
import { C } from '../theme.js';
import GameHeader from './shared/GameHeader.jsx';
import Toast from '../ui/Toast.jsx';
import useNivelProgress from './niveis/useNivelProgress.js';
import NiveisDialogs from './niveis/NiveisDialogs.jsx';
import NivelAtualCard from './niveis/NivelAtualCard.jsx';
import NiveisPowerPanel from './niveis/NiveisPowerPanel.jsx';
import NiveisTable from './niveis/NiveisTable.jsx';

const Niveis = () => {
  const state = useNivelProgress();
  return (
    <div className="max-w-2xl mx-auto pb-6">
      <Toast {...state.toast} onClose={state.closeToast} />
      <NiveisDialogs promptAberto={state.promptAberto} setPromptAberto={state.setPromptAberto}
        resultadoDialog={state.resultadoDialog} setResultadoDialog={state.setResultadoDialog} onAtualizar={state.handleAtualizarSim} />
      <div className="tw-card mb-3">
        <GameHeader title="Progresso da Cidade" />
        <p className="font-nunito font-semibold text-sm text-center py-2 px-3 m-0 bg-aoe-card" style={{ color: C.TEXT_SECONDARY }}>
          Acompanhe a sua evolução e descubra quanto falta para o próximo nível.
        </p>
      </div>
      <NivelAtualCard {...state} />
      <NiveisPowerPanel {...state} totalNiveis={state.todosNiveis.length} />
      <NiveisTable {...state} />
    </div>
  );
};

export default Niveis;
