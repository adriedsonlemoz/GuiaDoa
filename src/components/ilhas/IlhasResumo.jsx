import React from 'react';
import { C } from '../../theme.js';
import GameHeader from '../shared/GameHeader.jsx';
import { TIPO_COR } from './constants.js';
import { fmtN } from './ilhasUtils.js';

const NivelSelect = ({ value, maxNivel, disabled, onChange }) => (
  <select className="tw-select-sm" value={value} disabled={disabled} onChange={event => onChange(Number.parseInt(event.target.value, 10))}>
    {Array.from({ length: maxNivel }, (_, index) => <option key={index + 1} value={index + 1}>Nível {index + 1}</option>)}
  </select>
);

const InfraRow = ({ label, qtd, nivel, maxNivel, disabled, onNivelChange, children }) => (
  <div className="mb-2 p-2.5 rounded-lg" style={{ background: C.BG_CARD, border: `1px solid ${C.BORDER_SOFT}` }}>
    <div className="flex justify-between items-center">
      <span className="font-nunito font-bold text-[0.82rem]" style={{ color: C.TEXT_PRIMARY }}>
        {label}{qtd !== undefined && <span style={{ color: C.ACCENT, marginLeft: 4 }}>({qtd})</span>}
      </span>
      <NivelSelect value={nivel} maxNivel={maxNivel} disabled={disabled} onChange={onNivelChange} />
    </div>
    {children}
  </div>
);

const ProdRow = ({ titulo, qtd, nivel, maxNivel, ganhoLabel, ganhoValor, cor, terrQtd, terrLivres, disabled, onNivelChange, onTerrAdd, onTerrSub }) => (
  <div className="flex items-center gap-2 mb-1.5 p-2.5 rounded-lg" style={{ background: C.BG_CARD, border: `1px solid ${C.BORDER_SOFT}`, borderLeft: `4px solid ${cor}` }}>
    <div className="flex flex-col" style={{ minWidth: 90 }}>
      <span className="font-nunito font-bold text-[0.75rem]" style={{ color: C.TEXT_PRIMARY }}>
        {titulo.toUpperCase()} <span style={{ color: cor, fontWeight: 900 }}>({qtd})</span>
      </span>
      <div className="mt-0.5"><NivelSelect value={nivel} maxNivel={maxNivel} disabled={disabled} onChange={onNivelChange} /></div>
    </div>
    <div className="flex flex-1 justify-center">
      {terrQtd !== undefined && (
        <div className="flex flex-col items-center px-2 py-1 rounded-md" style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}` }}>
          <span className="font-nunito font-black text-[0.5rem] uppercase tracking-wider mb-0.5" style={{ color: C.TEXT_MUTED }}>TERRIT.</span>
          <div className="flex items-center gap-1.5">
            <button className="w-5 h-5 rounded flex items-center justify-center text-sm font-bold cursor-pointer transition-all"
              style={{ background: C.BG_CARD, border: `1px solid ${C.BORDER_SOFT}`, color: C.ERROR, opacity: (disabled || terrQtd === 0) ? 0.3 : 1 }} onClick={onTerrSub} disabled={disabled || terrQtd === 0}>−</button>
            <span className="font-mono font-black text-sm" style={{ color: C.TEXT_PRIMARY, minWidth: 14, textAlign: 'center' }}>{terrQtd}</span>
            <button className="w-5 h-5 rounded flex items-center justify-center text-sm font-bold cursor-pointer transition-all"
              style={{ background: C.BG_CARD, border: `1px solid ${C.BORDER_SOFT}`, color: C.SUCCESS, opacity: (disabled || terrLivres === 0) ? 0.3 : 1 }} onClick={onTerrAdd} disabled={disabled || terrLivres === 0}>+</button>
          </div>
        </div>
      )}
    </div>
    <div className="text-right" style={{ minWidth: 80 }}>
      <p className="font-nunito font-black text-[0.6rem] uppercase tracking-wider m-0" style={{ color: C.TEXT_MUTED }}>{ganhoLabel}</p>
      <p className="font-mono font-black text-base leading-tight m-0" style={{ color: cor }}>
        {fmtN(ganhoValor)}<span className="text-[0.55rem] ml-0.5" style={{ color: C.TEXT_MUTED }}>/h</span>
      </p>
      <p className="font-nunito text-[0.6rem] m-0" style={{ color: C.TEXT_MUTED }}>{fmtN(ganhoValor * 24)} /dia</p>
    </div>
  </div>
);

export function IlhasInfraestrutura({ niveis, metricas, isEditing, onNivelChange }) {
  return (
    <div className="tw-card md:w-5/12">
      <GameHeader title="Infraestrutura" fontSize="0.82rem" />
      <div className="p-3">
        <InfraRow label="Fortaleza" nivel={niveis.fortaleza} maxNivel={20} disabled={!isEditing} onNivelChange={value => onNivelChange('fortaleza', value)}>
          <p className="font-nunito font-semibold text-[0.72rem] mt-1 m-0" style={{ color: C.TEXT_MUTED }}>
            Sítio: <span style={{ color: C.ACCENT, fontWeight: 900 }}>{metricas.limiteSipioPrinc}</span> lotes
            &nbsp;·&nbsp; Territórios: <span style={{ color: C.ACCENT, fontWeight: 900 }}>{metricas.maxTerritorios}</span>
          </p>
        </InfraRow>
        <InfraRow label="Casas" qtd={metricas.totais.casas} nivel={niveis.casas} maxNivel={30} disabled={!isEditing} onNivelChange={value => onNivelChange('casas', value)}>
          <p className="font-nunito font-semibold text-[0.72rem] mt-1 m-0" style={{ color: C.TEXT_MUTED }}>
            +<span style={{ color: C.ACCENT_DEEP, fontWeight: 900 }}>{Number(metricas.dbCasa.popAumento || 0)}</span> hab./edifício
          </p>
        </InfraRow>
        <InfraRow label="Fontes de Cura" qtd={metricas.totais.fontes} nivel={niveis.fontes} maxNivel={35} disabled={!isEditing} onNivelChange={value => onNivelChange('fontes', value)}>
          <p className="font-nunito font-semibold text-[0.72rem] mt-1 m-0" style={{ color: C.TEXT_MUTED }}>
            Cura total: <span style={{ color: C.HEALTH, fontWeight: 900 }}>{fmtN(metricas.totalCura)}</span> tropas
          </p>
        </InfraRow>
        <div className="gold-stripe opacity-30 my-2" />
        {[
          { label: 'Pop. ativa', val: `${fmtN(metricas.popUsada)} / ${fmtN(metricas.popTotal)}`, color: C.TEXT_PRIMARY },
          { label: 'Territórios usados', val: `${metricas.terrUsados} / ${metricas.maxTerritorios}`, color: metricas.terrUsados >= metricas.maxTerritorios ? C.ERROR : C.TEXT_PRIMARY },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex justify-between items-center mb-1.5 px-0.5">
            <span className="font-nunito font-bold text-[0.75rem]" style={{ color: C.TEXT_MUTED }}>{label}</span>
            <span className="font-mono font-black text-[0.78rem]" style={{ color }}>{val}</span>
          </div>
        ))}
        <div className="flex justify-between items-center px-3 py-2.5 rounded-lg mt-2"
          style={{ background: metricas.popLivre < 0 ? `${C.ERROR}10` : `${C.SUCCESS}10`, border: `1px solid ${metricas.popLivre < 0 ? C.ERROR : C.SUCCESS}` }}>
          <span className="font-nunito font-black text-[0.75rem]" style={{ color: metricas.popLivre < 0 ? C.ERROR : C.SUCCESS }}>👥 Pop. livre</span>
          <span className="font-mono font-black text-base" style={{ color: metricas.popLivre < 0 ? C.ERROR : C.SUCCESS }}>{fmtN(metricas.popLivre)}</span>
        </div>
      </div>
    </div>
  );
}

export function IlhasProducao({ niveis, territorios, metricas, isEditing, onNivelChange, onTerritorio }) {
  const rows = [
    ['Fazendas', 'fazendas', 35, 'COMIDA', metricas.prodComida, TIPO_COR.fazendas.accent, territorios.fazendas],
    ['Minas', 'minas', 35, 'FERRO', metricas.prodFerro, TIPO_COR.minas.accent, territorios.minas],
    ['Pedreiras', 'pedreiras', 35, 'PEDRA', metricas.prodPedra, TIPO_COR.pedreiras.accent, territorios.pedreiras],
    ['Serrarias', 'serrarias', 35, 'MADEIRA', metricas.prodMadeira, TIPO_COR.serrarias.accent, territorios.serrarias],
    ['F. Pérolas', 'perolas', 20, 'PÉROLAS', metricas.prodPerolas, TIPO_COR.perolas.accent, undefined],
  ];
  return (
    <div className="tw-card md:flex-1">
      <GameHeader title="Produção de Recursos" fontSize="0.82rem" />
      <div className="p-3">
        {rows.map(([titulo, tipo, maxNivel, ganhoLabel, ganhoValor, cor, terrQtd]) => (
          <ProdRow key={tipo} titulo={titulo} qtd={metricas.totais[tipo]} nivel={niveis[tipo]} maxNivel={maxNivel}
            ganhoLabel={ganhoLabel} ganhoValor={ganhoValor} cor={cor} terrQtd={terrQtd} terrLivres={metricas.terrLivres}
            disabled={!isEditing} onNivelChange={value => onNivelChange(tipo, value)}
            onTerrAdd={terrQtd === undefined ? undefined : () => onTerritorio(tipo, 1)}
            onTerrSub={terrQtd === undefined ? undefined : () => onTerritorio(tipo, -1)} />
        ))}
      </div>
    </div>
  );
}
