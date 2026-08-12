import React from 'react';
import { C } from '../theme.js';
import { useI18n } from '../hooks/useI18n.jsx';
import GameHeader from './shared/GameHeader.jsx';
import Modal from '../ui/Modal.jsx';
import useBattleSimulator from './tropas/simulador/useBattleSimulator.js';
import MarchaPanel from './tropas/simulador/MarchaPanel.jsx';
import ComparePanel from './tropas/simulador/ComparePanel.jsx';
import TropaSelectDrawer from './tropas/simulador/TropaSelectDrawer.jsx';

const CalculosTropas = ({ setRoute }) => {
  const sim = useBattleSimulator({ setRoute });
  const { t } = useI18n();
  const closeDrawer = () => { sim.setSelecionandoPara(null); sim.setBusca(''); };
  return (
    <div className="max-w-2xl mx-auto pb-6">
      <Modal open={sim.confirmDialog.open} onClose={() => sim.setConfirmDialog(current => ({ ...current, open: false }))} maxWidth={300}>
        <div className="p-4 text-center"><p className="font-nunito font-black text-sm m-0 mb-1" style={{ color: C.ERROR }}>{sim.confirmDialog.title}</p><p className="font-nunito text-sm m-0 mb-4" style={{ color: C.TEXT_SECONDARY }}>{sim.confirmDialog.text}</p><div className="flex gap-2 justify-center"><button className="btn-ghost flex-1" onClick={() => sim.setConfirmDialog(current => ({ ...current, open: false }))}>{t('common.cancel')}</button><button className="btn-danger flex-1" onClick={() => { sim.confirmDialog.acao?.(); sim.setConfirmDialog(current => ({ ...current, open: false })); }}>{t('common.confirm')}</button></div></div>
      </Modal>
      <div className="mb-2"><GameHeader title={t('troops.simulator')} /></div>
      <button className="btn-ghost btn-sm mb-2.5" onClick={sim.solicitarSaida}>{t('troops.simulator.back_catalog')}</button>
      <div className="flex gap-2 mb-3">
        {[{ id: 'marcha', label: t('troops.simulator.march') }, { id: 'comparar', label: t('troops.simulator.compare') }].map(({ id, label }) => {
          const ativo = sim.aba === id;
          return <button key={id} onClick={() => sim.setAba(id)} className="flex-1 font-nunito font-black text-[0.8rem] py-2 rounded-lg transition-all cursor-pointer" style={{ background: ativo ? C.ACCENT_HOVER : 'transparent', color: ativo ? '#0e0a03' : C.ACCENT_HOVER, border: `1.5px solid ${C.ACCENT_HOVER}` }}>{label}</button>;
        })}
      </div>
      {sim.aba === 'marcha' && <MarchaPanel esquadroes={sim.esquadroes} calcMarcha={sim.calcMarcha} onAdd={() => sim.setSelecionandoPara('MARCHA')} onQtd={sim.updateQtd} onRemove={sim.confirmarRemocao} />}
      {sim.aba === 'comparar' && <ComparePanel tropaA={sim.tropaA} tropaB={sim.tropaB} onSelect={sim.setSelecionandoPara} />}
      <TropaSelectDrawer open={sim.selecionandoPara !== null} tropas={sim.tropasFiltradas} busca={sim.busca} setBusca={sim.setBusca} onSelect={sim.handleSelect} onClose={closeDrawer} />
    </div>
  );
};

export default CalculosTropas;
