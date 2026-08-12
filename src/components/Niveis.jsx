import React from 'react';
import { C } from '../theme.js';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
import Toast from '../ui/Toast.jsx';
import useNivelProgress from './niveis/useNivelProgress.js';
import NiveisDialogs from './niveis/NiveisDialogs.jsx';
import NivelAtualCard from './niveis/NivelAtualCard.jsx';
import NiveisPowerPanel from './niveis/NiveisPowerPanel.jsx';
import NiveisTable from './niveis/NiveisTable.jsx';

const Niveis = () => {
  const state = useNivelProgress();
  const { t } = useI18n();
  return (
    <div className="max-w-2xl mx-auto pb-6">
      <Toast {...state.toast} onClose={state.closeToast} />
      <NiveisDialogs promptAberto={state.promptAberto} setPromptAberto={state.setPromptAberto}
        resultadoDialog={state.resultadoDialog} setResultadoDialog={state.setResultadoDialog} onAtualizar={state.handleAtualizarSim} />
      <div className="tw-card mb-3">
        <GameHeader title={t('levels.city_progress')} />
        <p className="font-nunito font-semibold text-sm text-center py-2 px-3 m-0 bg-aoe-card" style={{ color: C.TEXT_SECONDARY }}>
          {t('levels.city_progress_desc')}
        </p>
      </div>
      <NivelAtualCard {...state} />
      <NiveisPowerPanel {...state} totalNiveis={state.todosNiveis.length} />
      <NiveisTable {...state} />
    </div>
  );
};

export default Niveis;
