import React, { useState } from 'react';
import { C } from '../../theme.js';
import TorneioLayout from './shared/TorneioLayout.jsx';
import { fmtN } from './shared/RewardRow.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const PESQUISAS = [
  { key: 't1', tier: 1, pts: 10,   color: '#5A8A5C' },
  { key: 't2', tier: 2, pts: 50,   color: '#5C7FA3' },
  { key: 't3', tier: 3, pts: 200,  color: '#8B6BAE' },
  { key: 't4', tier: 4, pts: 1000, color: '#C87A2C' },
  { key: 't5', tier: 5, pts: 5000, color: '#A83C2C' },
];

const TorneioConhecimento = () => {
  const { t, locale } = useI18n();
  const [qtds,     setQtds]    = useState({ t1:'', t2:'', t3:'', t4:'', t5:'' });
  const [tropaSel, setTropaSel] = useState('');
  const [premios,  setPremios]  = useState({ princ:{m:10,b:1000}, meta1:{m:2,b:1000}, meta2:{m:5,b:1000}, meta3:{m:10,b:1000} });
  const hpc = (k,f,v) => setPremios(p=>({ ...p,[k]:{ ...p[k],[f]:v } }));

  const totalPts = PESQUISAS.reduce((acc,p) => acc + (parseInt(qtds[p.key])||0)*p.pts, 0);

  const inventario = (
    <div className="space-y-2">
      {PESQUISAS.map(p => (
        <div key={p.key} className="flex items-center gap-2 p-2.5 rounded-lg"
          style={{ background:`${p.color}12`, border:`1px solid ${p.color}44`, borderLeft:`4px solid ${p.color}` }}>
          <span className="font-nunito font-black text-[0.78rem] flex-1" style={{ color: p.color }}>
            {t('knowledge.tier', { tier:p.tier })}
            <span className="font-semibold text-[0.72rem] ml-1.5" style={{ color: C.TEXT_MUTED }}>({fmtN(p.pts, locale)} {t('knowledge.points')})</span>
          </span>
          <input
            className="tw-input text-center"
            style={{ width:80, padding:'4px 8px' }}
            placeholder={t('knowledge.qty')}
            value={qtds[p.key]}
            onChange={e => setQtds(q=>({ ...q, [p.key]: e.target.value.replace(/\D/g,'') }))}
            inputMode="numeric"
          />
          <span className="font-nunito font-bold text-[0.72rem] whitespace-nowrap shrink-0" style={{ color:p.color, minWidth:50 }}>
            = {fmtN((parseInt(qtds[p.key])||0)*p.pts, locale)}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <TorneioLayout
      title={t('knowledge.title')} icon="📚" color={C.DEFENSE}
      inventario={inventario}
      totalPts={totalPts} ptsSufixo={t('knowledge.points')}
      metas={[{key:'princ',label:t('knowledge.main_prize'),reqPts:0},{key:'meta1',label:`🏅 ${t('knowledge.goal',{value:(1000).toLocaleString(locale)})}`,reqPts:1000},{key:'meta2',label:`🥈 ${t('knowledge.goal',{value:(5000).toLocaleString(locale)})}`,reqPts:5000},{key:'meta3',label:`🥇 ${t('knowledge.goal',{value:(20000).toLocaleString(locale)})}`,reqPts:20000}]}
      premios={premios} onPremioChange={hpc}
      tropaPremio={tropaSel} onTropaChange={setTropaSel}
    />
  );
};

export default TorneioConhecimento;
