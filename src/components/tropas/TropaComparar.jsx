import React, { useState } from 'react';
import { C } from '../../theme.js';
import { useTropas } from '../../hooks/useTropas.js';
import TropaSlot from './comparar/TropaSlot.jsx';
import TropaPicker from './comparar/TropaPicker.jsx';
import TropaComparisonTable from './comparar/TropaComparisonTable.jsx';
import { SLOT_CORES, SLOT_MAX } from './comparar/config.js';

const TropaComparar = () => {
  const { tropas } = useTropas();
  const [slots, setSlots] = useState(() => Array(SLOT_MAX).fill(null));
  const [pickerSlot, setPickerSlot] = useState(null);
  const tropasAtivas = slots.filter(Boolean);
  const adicionarTropa = tropa => {
    if (pickerSlot === null) return;
    setSlots(current => current.map((value, index) => (index === pickerSlot ? tropa : value)));
    setPickerSlot(null);
  };
  const removerTropa = index => setSlots(current => current.map((value, currentIndex) => (currentIndex === index ? null : value)));

  return (
    <>
      {pickerSlot !== null && <TropaPicker tropas={tropas} selecionadas={slots} onEscolher={adicionarTropa} onFechar={() => setPickerSlot(null)} />}
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 16 }}>
        <div style={{ background: 'linear-gradient(135deg,#2A1A4A,#4A2A7A)', borderRadius: '12px 12px 0 0', padding: '12px 16px 10px', textAlign: 'center' }}>
          <p className="font-cinzel font-bold uppercase m-0" style={{ fontSize: '0.8rem', letterSpacing: '3px', color: '#F0E8FF' }}>⚖️ Comparar Tropas</p>
          <p className="font-nunito font-semibold m-0" style={{ fontSize: '0.62rem', color: 'rgba(180,150,230,0.7)', marginTop: 3 }}>Selecione até 3 unidades para comparar lado a lado</p>
        </div>
        <div style={{ background: C.BG_SECONDARY, border: `1.5px solid ${C.BORDER}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '12px 10px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            {slots.map((tropa, index) => <TropaSlot key={index} index={index} tropa={tropa} cor={SLOT_CORES[index]} onSelecionar={() => setPickerSlot(index)} onRemover={() => removerTropa(index)} />)}
          </div>
          {tropasAtivas.length === 0 && <p className="font-nunito text-center m-0" style={{ fontSize: '0.7rem', color: C.TEXT_FAINT, marginTop: 8, fontStyle: 'italic' }}>Clique em ➕ para adicionar uma tropa</p>}
        </div>
        <TropaComparisonTable slots={slots} />
        {tropasAtivas.length === 1 && (
          <div style={{ textAlign: 'center', padding: '20px 16px', border: '1px dashed rgba(200,168,74,0.25)', borderRadius: 12, background: C.BG_CARD }}>
            <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>⚖️</p>
            <p className="font-nunito font-semibold m-0" style={{ fontSize: '0.78rem', color: C.TEXT_MUTED }}>Adicione mais uma tropa para iniciar a comparação</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TropaComparar;
