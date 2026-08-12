import React from 'react';
import { C } from '../theme.js';
import { useI18n } from '../hooks/useI18n.jsx';
import Modal from '../ui/Modal.jsx';
import Toast from '../ui/Toast.jsx';
import useIlhasManager from './ilhas/useIlhasManager.js';
import { IlhasExpansoes, IlhasHeader, IlhasLimites } from './ilhas/IlhasStatus.jsx';
import IlhasTabela from './ilhas/IlhasTabela.jsx';
import { IlhasInfraestrutura, IlhasProducao } from './ilhas/IlhasResumo.jsx';

const Ilhas = () => {
  const manager = useIlhasManager();
  const { t } = useI18n();
  const {
    data, expansoes, niveis, territorios, isEditing, dialogConfig, toast, metricas,
    setIsEditing, setDialogConfig, closeToast, requestAction, confirmAction,
    alteraTerritorio, handleChange, toggleExpansao, handleNivelChange,
  } = manager;

  return (
    <div className="max-w-2xl mx-auto pb-4 px-0.5">
      <Toast {...toast} onClose={closeToast} />
      <Modal open={dialogConfig.open} onClose={() => setDialogConfig(current => ({ ...current, open: false }))} maxWidth={310}>
        <div className="p-4 text-center">
          <p className="font-nunito font-black text-sm m-0 mb-1" style={{ color: dialogConfig.type === 'clear' ? C.ERROR : C.TEXT_PRIMARY }}>{dialogConfig.title}</p>
          <p className="font-nunito text-sm m-0 mb-4" style={{ color: C.TEXT_SECONDARY }}>{dialogConfig.text}</p>
          <div className="flex gap-2 justify-center">
            <button className="btn-ghost flex-1" onClick={() => setDialogConfig(current => ({ ...current, open: false }))}>{t('common.cancel')}</button>
            <button className={dialogConfig.type === 'clear' ? 'btn-danger flex-1' : 'btn-navy flex-1'} onClick={confirmAction}>{t('common.confirm')}</button>
          </div>
        </div>
      </Modal>

      <IlhasHeader isEditing={isEditing} onEdit={() => setIsEditing(true)} onRequestAction={requestAction} />
      <IlhasExpansoes expansoes={expansoes} isEditing={isEditing} onToggle={toggleExpansao} />
      <IlhasLimites metricas={metricas} />
      <IlhasTabela data={data} expansoes={expansoes} isEditing={isEditing} onChange={handleChange} />
      <div className="flex flex-col gap-2 md:flex-row">
        <IlhasInfraestrutura niveis={niveis} metricas={metricas} isEditing={isEditing} onNivelChange={handleNivelChange} />
        <IlhasProducao niveis={niveis} territorios={territorios} metricas={metricas} isEditing={isEditing}
          onNivelChange={handleNivelChange} onTerritorio={alteraTerritorio} />
      </div>
    </div>
  );
};

export default Ilhas;
