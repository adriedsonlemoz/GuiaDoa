import React from 'react';
import { C } from '../theme.js';
import { useI18n } from '../hooks/useI18n.jsx';
import Modal from '../ui/Modal.jsx';
import Toast from '../ui/Toast.jsx';
import useIlhasManager from './ilhas/useIlhasManager.js';
import { IlhasHeader } from './ilhas/IlhasStatus.jsx';
import IslandPlannerView from './ilhas/IslandPlannerView.jsx';
import { ComparisonPanel, GlobalPopulationPanel, RecommendationPanel } from './ilhas/IslandPlannerSummary.jsx';

const Ilhas = () => {
  const manager = useIlhasManager();
  const { t, locale } = useI18n();

  return (
    <div className="max-w-3xl mx-auto pb-4 island-planner-page">
      <Toast {...manager.toast} onClose={manager.closeToast} />
      <Modal open={manager.dialogConfig.open} onClose={() => manager.setDialogConfig(current => ({ ...current, open: false }))} maxWidth={330}>
        <div className="p-4 text-center">
          <p className="font-bold text-sm m-0 mb-1" style={{ color: manager.dialogConfig.type === 'clear' ? C.ERROR : C.TEXT_PRIMARY }}>{manager.dialogConfig.title}</p>
          <p className="text-sm m-0 mb-4" style={{ color: C.TEXT_SECONDARY }}>{manager.dialogConfig.text}</p>
          <div className="flex gap-2 justify-center">
            <button className="btn-ghost flex-1" onClick={() => manager.setDialogConfig(current => ({ ...current, open: false }))}>{t('common.cancel')}</button>
            <button className={manager.dialogConfig.type === 'clear' ? 'btn-danger flex-1' : 'btn-success flex-1'} onClick={manager.confirmAction}>{t('common.confirm')}</button>
          </div>
        </div>
      </Modal>

      <IlhasHeader isEditing={manager.isEditing} onEdit={() => manager.setIsEditing(true)} onRequestAction={manager.requestAction} />
      <IslandPlannerView manager={manager} />
      <GlobalPopulationPanel metricas={manager.metricas} t={t} locale={locale} />
      <RecommendationPanel
        plan={manager.plan}
        recommendation={manager.recommendation}
        onFocus={manager.setFocus}
        onApply={manager.applyRecommendation}
        canApply={manager.isEditing && manager.selectedMetrics.normalFree > 0}
        t={t}
      />
      <ComparisonPanel comparison={manager.comparison} onStart={manager.startComparison} onStop={manager.stopComparison} t={t} locale={locale} />
    </div>
  );
};

export default Ilhas;
