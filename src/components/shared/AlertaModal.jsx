import React from 'react';
import Modal from '../../ui/Modal.jsx';

const AlertaModal = ({ open, message, onClose }) => (
  <Modal open={open} onClose={onClose} maxWidth={320}>
    {/* Faixa ornamental */}
    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, #C87A2C, transparent)' }} />

    <div className="p-4 text-center">
      {/* Ícone */}
      <div
        className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl"
        style={{ border: '2px solid #C87A2C', background: 'rgba(200,122,44,0.1)', boxShadow: '0 2px 8px rgba(200,122,44,0.2)' }}
      >
        ⚠️
      </div>

      <p className="font-nunito font-black text-base text-aoe-dark mb-2 tracking-wide m-0">
        Atenção, Comandante!
      </p>
      <p className="font-nunito font-semibold text-sm text-aoe-mid leading-relaxed mb-4 m-0">
        {message}
      </p>

      {/* Divisor */}
      <div className="h-px mb-3" style={{ background: 'linear-gradient(90deg, transparent, #C8A84A, transparent)' }} />

      <button
        onClick={onClose}
        className="btn-gold btn-lg w-full uppercase tracking-widest"
      >
        Entendido
      </button>
    </div>
  </Modal>
);

export default AlertaModal;
