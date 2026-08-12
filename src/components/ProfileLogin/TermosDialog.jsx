import React from 'react';
import Modal from '../../ui/Modal.jsx';
import { setTermoAceito } from '../../utils/storage.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const TermosDialog = ({ open, onAceitar }) => {
  const { t } = useI18n();
  const handleAceitar = () => {
    setTermoAceito();
    onAceitar();
  };

  return (
    <Modal open={open} maxWidth={360}>
      <div className="p-4 text-center">
        <p className="text-4xl leading-none mb-2 m-0">📜</p>
        <p className="font-cinzel font-bold text-lg uppercase tracking-wide text-aoe-red mb-3 pb-2 m-0"
          style={{ borderBottom: '2px solid #C8A84A' }}>
          {t('terms.title')}
        </p>
        <p className="font-nunito font-bold text-sm text-aoe-dark mb-2 text-justify leading-relaxed m-0">
          {t('terms.p1')}
        </p>
        <p className="font-nunito text-sm text-aoe-mid mb-4 text-justify leading-relaxed m-0">
          {t('terms.p2')}
        </p>
        <button onClick={handleAceitar} className="btn-success btn-lg w-full uppercase tracking-wider">
          {t('terms.accept')}
        </button>
      </div>
    </Modal>
  );
};

export default TermosDialog;
