import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTropas } from '../../hooks/useTropas.js';
import GameHeader from '../shared/GameHeader.jsx';
import TropaSlot from './comparar/TropaSlot.jsx';
import TropaPicker from './comparar/TropaPicker.jsx';
import TropaComparisonTable from './comparar/TropaComparisonTable.jsx';
import { SLOT_CORES, SLOT_MAX } from './comparar/config.js';

const TropaComparar = () => {
  const { tropas } = useTropas();
  const { t } = useI18n();
  const [slots, setSlots] = useState(() => {
    const base = Array(SLOT_MAX).fill(null);
    try {
      const names = JSON.parse(sessionStorage.getItem('guiadoa_troop_compare') || '[]');
      sessionStorage.removeItem('guiadoa_troop_compare');
      names.slice(0, SLOT_MAX).forEach((name, index) => { base[index] = tropas.find(t => t.nome === name) || null; });
    } catch {}
    return base;
  });
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
      <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:16 }}>
        <GameHeader title={t('troops.compare_title').replace('⚖️ ', '')} subtitle={t('troops.compare_desc')} />

        <section className="game-panel" style={{ padding:'10px', marginBottom:10 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:7 }}>
            {slots.map((tropa, index) => (
              <TropaSlot
                key={index}
                index={index}
                tropa={tropa}
                cor={SLOT_CORES[index]}
                onSelecionar={() => setPickerSlot(index)}
                onRemover={() => removerTropa(index)}
              />
            ))}
          </div>
          {tropasAtivas.length === 0 ? (
            <p style={{ textAlign:'center', margin:'9px 0 0', color:'#687064', fontSize:'.68rem', fontWeight:650 }}>{t('troops.compare_add')}</p>
          ) : null}
        </section>

        <TropaComparisonTable slots={slots} />

        {tropasAtivas.length === 1 ? (
          <div className="game-panel" style={{ textAlign:'center', padding:'18px 14px', color:'#687064', fontSize:'.7rem', fontWeight:650 }}>
            ⚖ {t('troops.compare_add_second')}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default TropaComparar;
