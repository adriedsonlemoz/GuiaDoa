import React from 'react';
import { C } from '../../theme.js';
import Modal from '../../ui/Modal.jsx';

export default function NiveisDialogs({ promptAberto, setPromptAberto, resultadoDialog, setResultadoDialog, onAtualizar }) {
  return (
    <>
      <Modal open={promptAberto} onClose={() => setPromptAberto(false)} maxWidth={320}>
        <div className="p-4 text-center">
          <p className="text-3xl mb-2 m-0">⚠️</p>
          <p className="font-cinzel font-bold text-sm tracking-wide uppercase m-0 mb-2" style={{ color: C.WARNING }}>Atualização de Inteligência</p>
          <p className="font-nunito font-semibold text-sm leading-relaxed m-0 mb-4" style={{ color: C.TEXT_SECONDARY }}>
            Comandante, o seu poder ou nível alterou desde o último registo?
          </p>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setPromptAberto(false)}>Não</button>
            <button className="btn-success flex-1" onClick={onAtualizar}>Sim, Atualizar</button>
          </div>
        </div>
      </Modal>

      <Modal open={resultadoDialog.open} onClose={() => setResultadoDialog(current => ({ ...current, open: false }))} maxWidth={320}>
        <div className="p-4 text-center">
          <p className="font-cinzel font-bold text-sm uppercase tracking-wide m-0 mb-1" style={{ color: resultadoDialog.tipo === 'success' ? C.SUCCESS : C.WARNING }}>
            {resultadoDialog.titulo}
          </p>
          <div className="gold-stripe my-2 opacity-40" />
          <p className="font-nunito font-black text-base m-0 mb-1" style={{ color: C.TEXT_PRIMARY }}>{resultadoDialog.mensagem}</p>
          <p className="font-nunito font-semibold text-xs m-0 mb-3" style={{ color: C.TEXT_MUTED }}>O relatório foi atualizado neste dispositivo.</p>
          <button className={resultadoDialog.tipo === 'success' ? 'btn-success w-full' : 'btn-gold w-full'} onClick={() => setResultadoDialog(current => ({ ...current, open: false }))}>Continuar</button>
        </div>
      </Modal>
    </>
  );
}
