import React from 'react';
import Modal from '../../ui/Modal.jsx';
import { setTermoAceito } from '../../utils/storage.js';

const TermosDialog = ({ open, onAceitar }) => {
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
          Contrato de Acesso
        </p>
        <p className="font-nunito font-bold text-sm text-aoe-dark mb-2 text-justify leading-relaxed m-0">
          Bem-vindo ao Guia Tático DOA. Este aplicativo é uma ferramenta{' '}
          <strong>não oficial</strong> criada pela comunidade de fãs e não possui qualquer vínculo
          com a desenvolvedora <strong>Deca Games</strong>.
        </p>
        <p className="font-nunito text-sm text-aoe-mid mb-4 text-justify leading-relaxed m-0">
          Os resultados das calculadoras são baseados em lógicas estudadas por jogadores. Pequenas
          variações nos cálculos podem ocorrer. Ao entrar, você concorda que o uso desta ferramenta
          é apenas para auxílio estratégico.
        </p>
        <button onClick={handleAceitar} className="btn-success btn-lg w-full uppercase tracking-wider">
          Li e Aceito os Termos
        </button>
      </div>
    </Modal>
  );
};

export default TermosDialog;
