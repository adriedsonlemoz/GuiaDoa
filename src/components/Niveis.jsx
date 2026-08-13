import React from 'react';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
import Toast from '../ui/Toast.jsx';
import useNivelProgress from './niveis/useNivelProgress.js';
import NivelAtualCard from './niveis/NivelAtualCard.jsx';
import NiveisPowerPanel from './niveis/NiveisPowerPanel.jsx';
import NiveisHistory from './niveis/NiveisHistory.jsx';
import NiveisTable from './niveis/NiveisTable.jsx';

const Niveis = () => {
  const state = useNivelProgress();
  const { t } = useI18n();
  return (
    <div className="max-w-2xl mx-auto pb-6">
      <Toast {...state.toast} onClose={state.closeToast} />
      <div style={{ marginBottom:10 }}><GameHeader title={t('levels.city_progress')} subtitle={t('levels.city_progress_desc')} /></div>
      <NivelAtualCard {...state} />
      <NiveisPowerPanel {...state} />
      <NiveisHistory {...state} />
      <NiveisTable {...state} />
    </div>
  );
};

export default Niveis;
