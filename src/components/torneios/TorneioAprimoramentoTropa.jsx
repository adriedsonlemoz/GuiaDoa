import React, { useState } from 'react';
import { C } from '../../theme.js';
import TorneioLayout from './shared/TorneioLayout.jsx';
import { fmtN } from './shared/RewardRow.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const RARIDADES = [
  { key: 'incomum',   chave: 'torneio.aprimoramento_tropa.raridade.incomum',    pts: 5,    color: '#5A8A5C' },
  { key: 'raro',      chave: 'torneio.aprimoramento_tropa.raridade.raro',       pts: 10,   color: '#5C7FA3' },
  { key: 'epico',     chave: 'torneio.aprimoramento_tropa.raridade.epico',      pts: 50,   color: '#8B6BAE' },
  { key: 'lendario',  chave: 'torneio.aprimoramento_tropa.raridade.lendario',   pts: 200,  color: '#C87A2C' },
  { key: 'mitologico',chave: 'torneio.aprimoramento_tropa.raridade.mitologico', pts: 1000, color: '#A83C2C' },
];

const TorneioAprimoramentoTropa = () => {
  const { t } = useI18n();
  const [qtds,     setQtds]    = useState({ incomum:'', raro:'', epico:'', lendario:'', mitologico:'' });
  const [tropaSel, setTropaSel] = useState('');
  const [premios,  setPremios]  = useState({ princ:{m:10,b:1000}, meta1:{m:2,b:1000}, meta2:{m:5,b:1000}, meta3:{m:10,b:1000} });
  const hpc = (k,f,v) => setPremios(p=>({ ...p,[k]:{ ...p[k],[f]:v } }));

  const totalPts = RARIDADES.reduce((acc,r) => acc + (parseInt(qtds[r.key])||0)*r.pts, 0);

  const inventario = (
    <div>
      <p className="font-nunito font-semibold text-[0.72rem] leading-snug text-justify mb-3 m-0" style={{ color: C.TEXT_SECONDARY }}>
        {t('torneio.aprimoramento_tropa.instrucao')}
      </p>
      <div className="space-y-2">
        {RARIDADES.map(r => (
          <div key={r.key} className="flex items-center gap-2 p-2.5 rounded-lg"
            style={{ background:`${r.color}12`, border:`1px solid ${r.color}44`, borderLeft:`4px solid ${r.color}` }}>
            <span className="font-nunito font-black text-[0.78rem] flex-1" style={{ color: r.color }}>
              {t(r.chave)}
              <span className="font-semibold text-[0.62rem] ml-1.5" style={{ color: C.TEXT_MUTED }}>({r.pts} pts)</span>
            </span>
            <input
              className="tw-input text-center"
              style={{ width:80, padding:'4px 8px' }}
              placeholder={t('torneio.aprimoramento_tropa.placeholder_qtd')}
              value={qtds[r.key]}
              onChange={e => setQtds(q=>({ ...q, [r.key]: e.target.value.replace(/\D/g,'') }))}
              inputMode="numeric"
            />
            <span className="font-nunito font-bold text-[0.65rem] whitespace-nowrap shrink-0" style={{ color:r.color, minWidth:50 }}>
              = {fmtN((parseInt(qtds[r.key])||0)*r.pts)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <TorneioLayout
      title={t('torneio.titulo.aprimoramento_tropa')} icon="🛡️" color={C.DEFENSE}
      inventario={inventario}
      totalPts={totalPts} ptsSufixo={t('torneio.label.pontos')}
      metas={[
        {key:'princ',label:t('torneio.aprimoramento_tropa.meta.principal'),reqPts:0},
        {key:'meta1',label:t('torneio.aprimoramento_tropa.meta.m1'),reqPts:100},
        {key:'meta2',label:t('torneio.aprimoramento_tropa.meta.m2'),reqPts:500},
        {key:'meta3',label:t('torneio.aprimoramento_tropa.meta.m3'),reqPts:2000},
      ]}
      premios={premios} onPremioChange={hpc}
      tropaPremio={tropaSel} onTropaChange={setTropaSel}
    />
  );
};

export default TorneioAprimoramentoTropa;
