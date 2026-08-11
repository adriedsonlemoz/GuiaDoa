import React, { useEffect, useMemo, useState } from 'react';
import { dbEdificios } from '../db.js';
import { C } from '../theme.js';
import GameHeader from './shared/GameHeader.jsx';
import Modal from '../ui/Modal.jsx';
import Toast from '../ui/Toast.jsx';

const ILHA_META = {
  PRINC: { icon: '🏰', label: 'Principal', color: C.ACCENT,   lightBg: '#FDF5E6' },
  FOGO:  { icon: '🔥', label: 'Fogo',      color: C.ATTACK,   lightBg: '#FFF3E0' },
  ÁGUA:  { icon: '💧', label: 'Água',      color: C.DEFENSE,  lightBg: '#EFF6FF' },
  BELLA: { icon: '🌸', label: 'Bella',     color: C.HEALTH,   lightBg: '#FFF0F0' },
  TERRA: { icon: '🌿', label: 'Terra',     color: C.ENERGY,   lightBg: '#F0FAF0' },
};

const TIPO_COR = {
  fazendas:  { accent: '#2E7D32', bg: '#F1F8E9', label: '🌾' },
  minas:     { accent: '#6A1B9A', bg: '#F3E5F5', label: '⛏️' },
  pedreiras: { accent: '#5D4037', bg: '#EFEBE9', label: '🪨' },
  serrarias: { accent: '#E65100', bg: '#FFF3E0', label: '🪵' },
  perolas:   { accent: '#1565C0', bg: '#E3F2FD', label: '🔮' },
};

const fmtN = n => Number(n).toLocaleString('pt-BR');

const Ilhas = () => {
  const ilhasNomes = ['PRINC', 'FOGO', 'ÁGUA', 'BELLA', 'TERRA'];

  const [expansoes, setExpansoes] = useState(() => {
    const s = localStorage.getItem('doa_ilhas_expansoes');
    return s ? JSON.parse(s) : { FOGO: false, BELLA: false, TERRA: false };
  });

  const rowsDefault = [
    { id: 'r1', type: 'casas',      name: 'Casas',      values: ['','','','',''] },
    { id: 'r2', type: 'fontes',     name: 'Fontes',     values: ['','','','',''] },
    { id: 'r3', type: 'guarnicoes', name: 'Guarnições', values: ['','','','',''] },
    { id: 'r4', type: 'fazendas',   name: 'Fazendas',   values: ['','','','',''] },
    { id: 'r5', type: 'minas',      name: 'Minas',      values: ['','','','',''] },
    { id: 'r6', type: 'pedreiras',  name: 'Pedreiras',  values: ['','','','',''] },
    { id: 'r7', type: 'serrarias',  name: 'Serrarias',  values: ['','','','',''] },
    { id: 'r8', type: 'perolas',    name: 'F. Pérolas', values: ['','','','',''] },
  ];
  const fixos = ['Viveiro', 'Forja', 'Fábrica', 'Cofre', 'Sentinela'];

  const [data, setData] = useState(() => {
    const s = localStorage.getItem('doa_islands_data_react_v5');
    if (s) { const p = JSON.parse(s); return rowsDefault.map(br => p.find(x => x.type === br.type) || br); }
    return rowsDefault;
  });
  const [niveis, setNiveis] = useState(() => {
    const s = localStorage.getItem('doa_islands_niveis_v5');
    return s ? JSON.parse(s) : { fortaleza:1, casas:1, fontes:1, fazendas:1, minas:1, pedreiras:1, serrarias:1, perolas:1 };
  });
  const [territorios, setTerritorios] = useState(() => {
    const s = localStorage.getItem('doa_islands_territorios_v5');
    return s ? JSON.parse(s) : { fazendas:0, minas:0, pedreiras:0, serrarias:0 };
  });
  const [isEditing, setIsEditing] = useState(() => {
    const s = localStorage.getItem('doa_islands_editing');
    return s ? JSON.parse(s) : true;
  });
  const [dialogConfig, setDialogConfig] = useState({ open: false, type: '', title: '', text: '' });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });

  useEffect(() => { window.temAlteracoesNaoSalvas = isEditing; return () => { window.temAlteracoesNaoSalvas = false; }; }, [isEditing]);
  useEffect(() => {
    localStorage.setItem('doa_islands_data_react_v5', JSON.stringify(data));
    localStorage.setItem('doa_ilhas_expansoes', JSON.stringify(expansoes));
    localStorage.setItem('doa_islands_niveis_v5', JSON.stringify(niveis));
    localStorage.setItem('doa_islands_territorios_v5', JSON.stringify(territorios));
    localStorage.setItem('doa_islands_editing', JSON.stringify(isEditing));
  }, [data, expansoes, niveis, territorios, isEditing]);

  const showToast  = (msg, sev = 'error') => setToast({ open: true, message: msg, severity: sev });
  const closeToast = () => setToast(t => ({ ...t, open: false }));

  const requestAction = (type) => {
    if (type === 'clear') setDialogConfig({ open:true, type:'clear', title:'Limpar Sistema', text:'Tem a certeza que deseja apagar todos os edifícios e territórios? Acção irreversível.' });
    else if (type === 'save') setDialogConfig({ open:true, type:'save', title:'Travar Dados', text:'Isto irá guardar as alterações e bloquear a tabela para evitar edições acidentais.' });
  };

  const confirmAction = () => {
    if (dialogConfig.type === 'clear') { setData(rowsDefault); setTerritorios({ fazendas:0, minas:0, pedreiras:0, serrarias:0 }); setIsEditing(true); showToast('Sistema reiniciado com sucesso.', 'success'); }
    else if (dialogConfig.type === 'save') { setIsEditing(false); showToast('Dados travados e salvos.', 'success'); }
    setDialogConfig(d => ({ ...d, open: false }));
  };

  const dbFortalezaAtual = dbEdificios.Fortaleza.find(f => f.nivel === niveis.fortaleza) || dbEdificios.Fortaleza[0];
  const limiteSipioPrinc = useMemo(() => {
    let l = 11;
    for (let i = 1; i <= niveis.fortaleza; i++) { const db = dbEdificios.Fortaleza.find(f => f.nivel === i); if (db) l += db.areas; }
    return l;
  }, [niveis.fortaleza]);
  const maxTerritorios = dbFortalezaAtual.territorios;
  const terrUsados = territorios.fazendas + territorios.minas + territorios.pedreiras + territorios.serrarias;
  const terrLivres = maxTerritorios - terrUsados;

  const alteraTerritorio = (tipo, delta) => {
    if (!isEditing) return;
    const atual = territorios[tipo] || 0;
    const novo = atual + delta;
    if (novo < 0) return;
    if (delta > 0 && terrLivres <= 0) { showToast(`LIMITE ATINGIDO: Máximo de ${maxTerritorios} territórios.`, 'warning'); return; }
    setTerritorios({ ...territorios, [tipo]: novo });
  };

  const limCidPrinc = 25; const limSitioAgua = 8; const limCidAgua = 4;
  const tiposRecursoTerrestre = ['fazendas', 'minas', 'pedreiras', 'serrarias'];
  const tiposCidade = ['casas', 'fontes', 'guarnicoes'];

  const isAllowed = (type, colIndex) => {
    if (tiposRecursoTerrestre.includes(type)) return colIndex === 0;
    if (type === 'perolas') return colIndex === 2;
    return true;
  };

  const handleChange = (rowIndex, colIndex, val) => {
    if (!isEditing) return;
    if (!/^\d*$/.test(val)) return;
    const rowType = data[rowIndex].type;
    if (!isAllowed(rowType, colIndex)) return;
    const valNum = parseInt(val) || 0;
    const isRT = tiposRecursoTerrestre.includes(rowType);
    const isRA = rowType === 'perolas';
    const isCid = tiposCidade.includes(rowType);
    let novoTotal = 0;

    if (colIndex === 0) {
      if (isRT) {
        data.forEach((r, i) => { if (tiposRecursoTerrestre.includes(r.type)) novoTotal += (i === rowIndex ? valNum : (parseInt(r.values[0]) || 0)); });
        if (novoTotal > limiteSipioPrinc) { showToast(`SÍTIO CHEIO: Limite de ${limiteSipioPrinc} atingido.`, 'warning'); return; }
      } else if (isCid) {
        novoTotal = 5;
        data.forEach((r, i) => { if (tiposCidade.includes(r.type)) novoTotal += (i === rowIndex ? valNum : (parseInt(r.values[0]) || 0)); });
        if (novoTotal > limCidPrinc) { showToast(`CIDADE PRINCIPAL LOTADA: Máx ${limCidPrinc}.`, 'error'); return; }
      }
    } else if (colIndex === 2) {
      if (isRA) {
        data.forEach((r, i) => { if (r.type === 'perolas') novoTotal += (i === rowIndex ? valNum : (parseInt(r.values[2]) || 0)); });
        if (novoTotal > limSitioAgua) { showToast(`ILHA DE ÁGUA LOTADA: Máx ${limSitioAgua} Pérolas.`, 'error'); return; }
      } else if (isCid) {
        data.forEach((r, i) => { if (tiposCidade.includes(r.type)) novoTotal += (i === rowIndex ? valNum : (parseInt(r.values[2]) || 0)); });
        if (novoTotal > limCidAgua) { showToast(`CIDADE NA ÁGUA LOTADA: Máx ${limCidAgua}.`, 'error'); return; }
      }
    } else {
      const limIlha = colIndex === 1 ? (expansoes.FOGO ? 12 : 6) : colIndex === 3 ? (expansoes.BELLA ? 12 : 6) : (expansoes.TERRA ? 12 : 6);
      data.forEach((r, i) => { novoTotal += (i === rowIndex ? valNum : (parseInt(r.values[colIndex]) || 0)); });
      if (novoTotal > limIlha) { showToast(`LIMITE ILHA ${ilhasNomes[colIndex]} ATINGIDO: ${limIlha}.`, 'error'); return; }
    }
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], values: [...newData[rowIndex].values] };
    newData[rowIndex].values[colIndex] = val;
    setData(newData);
  };

  const toggleExpansao = (ilha) => {
    if (!isEditing) return;
    const cIdx = ilhasNomes.indexOf(ilha);
    let total = 0; data.forEach(r => total += parseInt(r.values[cIdx]) || 0);
    if (expansoes[ilha] && total > 6) { showToast(`ERRO: A ilha já tem ${total} edifícios.`, 'error'); return; }
    setExpansoes({ ...expansoes, [ilha]: !expansoes[ilha] });
  };

  const handleNivelChange = (tipo, valor) => { if (!isEditing) return; setNiveis({ ...niveis, [tipo]: valor }); };

  // Totais
  let totais = { casas:0, fontes:0, guarnicoes:0, fazendas:0, minas:0, pedreiras:0, serrarias:0, perolas:0 };
  let cidPrinc = 5, sitPrinc = 0, cidAgua = 0, sitAgua = 0, totFogo = 0, totBella = 0, totTerra = 0;
  data.forEach(row => {
    const isRT = tiposRecursoTerrestre.includes(row.type);
    const isRA = row.type === 'perolas';
    const isCid = tiposCidade.includes(row.type);
    row.values.forEach((val, i) => {
      const n = parseInt(val) || 0;
      if (i === 0) { if (isRT) sitPrinc += n; if (isCid) cidPrinc += n; }
      else if (i === 1) totFogo += n;
      else if (i === 2) { if (isRA) sitAgua += n; if (isCid) cidAgua += n; }
      else if (i === 3) totBella += n;
      else if (i === 4) totTerra += n;
    });
    row.values.forEach(v => { totais[row.type] += parseInt(v) || 0; });
  });

  const dbCasa = dbEdificios.Casa.find(e => e.nivel === niveis.casas) || dbEdificios.Casa[0];
  const dbFonte = dbEdificios.FonteDaCura.find(e => e.nivel === niveis.fontes) || dbEdificios.FonteDaCura[0];
  const dbFaz   = dbEdificios.Fazenda.find(e => e.nivel === niveis.fazendas) || dbEdificios.Fazenda[0];
  const dbMin   = dbEdificios.Mina.find(e => e.nivel === niveis.minas) || dbEdificios.Mina[0];
  const dbPed   = dbEdificios.Pedra.find(e => e.nivel === niveis.pedreiras) || dbEdificios.Pedra[0];
  const dbSer   = dbEdificios.Serraria.find(e => e.nivel === niveis.serrarias) || dbEdificios.Serraria[0];
  const dbPer   = dbEdificios.FazendaPerolas.find(e => e.nivel === niveis.perolas) || dbEdificios.FazendaPerolas[0];

  const popTotal    = totais.casas * dbCasa.popAumento;
  const popUsada    = (totais.fazendas * dbFaz.pop) + (totais.minas * dbMin.pop) + (totais.pedreiras * dbPed.pop) + (totais.serrarias * dbSer.pop) + (totais.perolas * dbPer.pop);
  const popLivre    = popTotal - popUsada;
  const totalCura   = totais.fontes * dbFonte.maxTropas;
  const prodComida  = (totais.fazendas  * dbFaz.prodHora) + (territorios.fazendas  * 2750);
  const prodFerro   = (totais.minas     * dbMin.prodHora) + (territorios.minas     * 2750);
  const prodPedra   = (totais.pedreiras * dbPed.prodHora) + (territorios.pedreiras * 2750);
  const prodMadeira = (totais.serrarias * dbSer.prodHora) + (territorios.serrarias * 2750);
  const prodPerolas = totais.perolas * dbPer.prodHora;

  // ── Sub-componentes ─────────────────────────────────────────────────────
  const InfraRow = ({ label, qtd, tipo, maxNivel, children }) => (
    <div className="mb-2 p-2.5 rounded-lg" style={{ background: C.BG_CARD, border: `1px solid ${C.BORDER_SOFT}` }}>
      <div className="flex justify-between items-center">
        <span className="font-nunito font-bold text-[0.82rem]" style={{ color: C.TEXT_PRIMARY }}>
          {label}{qtd !== undefined && <span style={{ color: C.ACCENT, marginLeft: 4 }}>({qtd})</span>}
        </span>
        <select
          className="tw-select-sm"
          value={niveis[tipo]}
          disabled={!isEditing}
          onChange={e => handleNivelChange(tipo, parseInt(e.target.value))}
        >
          {Array.from({ length: maxNivel }, (_, i) => (
            <option key={i+1} value={i+1}>Nível {i+1}</option>
          ))}
        </select>
      </div>
      {children}
    </div>
  );

  const ProdRow = ({ titulo, qtd, tipoNivel, maxNivel, ganhoLabel, ganhoValor, cor, terrQtd, onTerrAdd, onTerrSub }) => (
    <div className="flex items-center gap-2 mb-1.5 p-2.5 rounded-lg"
      style={{ background: C.BG_CARD, border: `1px solid ${C.BORDER_SOFT}`, borderLeft: `4px solid ${cor}` }}>
      {/* Esq: nome + nível */}
      <div className="flex flex-col" style={{ minWidth: 90 }}>
        <span className="font-nunito font-bold text-[0.75rem]" style={{ color: C.TEXT_PRIMARY }}>
          {titulo.toUpperCase()} <span style={{ color: cor, fontWeight: 900 }}>({qtd})</span>
        </span>
        <select
          className="tw-select-sm mt-0.5"
          value={niveis[tipoNivel]}
          disabled={!isEditing}
          onChange={e => handleNivelChange(tipoNivel, parseInt(e.target.value))}
        >
          {Array.from({ length: maxNivel }, (_, i) => (
            <option key={i+1} value={i+1}>Nível {i+1}</option>
          ))}
        </select>
      </div>
      {/* Centro: territórios */}
      <div className="flex flex-1 justify-center">
        {terrQtd !== undefined && (
          <div className="flex flex-col items-center px-2 py-1 rounded-md"
            style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}` }}>
            <span className="font-nunito font-black text-[0.5rem] uppercase tracking-wider mb-0.5" style={{ color: C.TEXT_MUTED }}>TERRIT.</span>
            <div className="flex items-center gap-1.5">
              <button
                className="w-5 h-5 rounded flex items-center justify-center text-sm font-bold border-none cursor-pointer transition-all"
                style={{ background: C.BG_CARD, border: `1px solid ${C.BORDER_SOFT}`, color: C.ERROR, opacity: (!isEditing || terrQtd === 0) ? 0.3 : 1 }}
                onClick={onTerrSub} disabled={!isEditing || terrQtd === 0}
              >−</button>
              <span className="font-mono font-black text-sm" style={{ color: C.TEXT_PRIMARY, minWidth: 14, textAlign: 'center' }}>{terrQtd}</span>
              <button
                className="w-5 h-5 rounded flex items-center justify-center text-sm font-bold border-none cursor-pointer transition-all"
                style={{ background: C.BG_CARD, border: `1px solid ${C.BORDER_SOFT}`, color: C.SUCCESS, opacity: (!isEditing || terrLivres === 0) ? 0.3 : 1 }}
                onClick={onTerrAdd} disabled={!isEditing || terrLivres === 0}
              >+</button>
            </div>
          </div>
        )}
      </div>
      {/* Dir: produção */}
      <div className="text-right" style={{ minWidth: 80 }}>
        <p className="font-nunito font-black text-[0.6rem] uppercase tracking-wider m-0" style={{ color: C.TEXT_MUTED }}>{ganhoLabel}</p>
        <p className="font-mono font-black text-base leading-tight m-0" style={{ color: cor }}>
          {fmtN(ganhoValor)}<span className="text-[0.55rem] ml-0.5" style={{ color: C.TEXT_MUTED }}>/h</span>
        </p>
        <p className="font-nunito text-[0.6rem] m-0" style={{ color: C.TEXT_MUTED }}>{fmtN(ganhoValor * 24)} /dia</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-4 px-0.5">
      <Toast {...toast} onClose={closeToast} />

      {/* Dialog confirm */}
      <Modal open={dialogConfig.open} onClose={() => setDialogConfig(d => ({ ...d, open: false }))} maxWidth={310}>
        <div className="p-4 text-center">
          <p className="font-nunito font-black text-sm m-0 mb-1" style={{ color: dialogConfig.type === 'clear' ? C.ERROR : C.TEXT_PRIMARY }}>
            {dialogConfig.title}
          </p>
          <p className="font-nunito text-sm m-0 mb-4" style={{ color: C.TEXT_SECONDARY }}>{dialogConfig.text}</p>
          <div className="flex gap-2 justify-center">
            <button className="btn-ghost flex-1" onClick={() => setDialogConfig(d => ({ ...d, open: false }))}>Cancelar</button>
            <button className={dialogConfig.type === 'clear' ? 'btn-danger flex-1' : 'btn-navy flex-1'} onClick={confirmAction}>Confirmar</button>
          </div>
        </div>
      </Modal>

      {/* ── Cabeçalho + controlo ─────────────────────────────────────── */}
      <div className="tw-card mb-2">
        <GameHeader title="Gestão de Ilhas e Recursos" />
        <div className="flex items-center justify-between px-3 py-2" style={{ background: C.BG_SECONDARY, borderTop: `1px solid ${C.BORDER_SOFT}` }}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl leading-none">🏝️</span>
            <div>
              <p className="font-nunito font-black text-[0.55rem] uppercase tracking-widest m-0" style={{ color: C.TEXT_MUTED }}>STATUS</p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                style={{ background: isEditing ? 'rgba(200,122,44,0.12)' : 'rgba(90,138,92,0.12)', border: `1px solid ${isEditing ? C.WARNING : C.SUCCESS}` }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: isEditing ? C.WARNING : C.SUCCESS, boxShadow: `0 0 4px ${isEditing ? C.WARNING : C.SUCCESS}` }} />
                <span className="font-nunito font-black text-[0.65rem]" style={{ color: isEditing ? C.WARNING : C.SUCCESS }}>
                  {isEditing ? 'EDIÇÃO ATIVA' : 'DADOS TRAVADOS'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {isEditing
              ? <button className="btn-navy btn-sm" onClick={() => requestAction('save')}>⚔ Travar</button>
              : <button className="btn-ghost btn-sm" onClick={() => setIsEditing(true)}>✏ Editar</button>
            }
            <button className="btn-danger btn-sm" onClick={() => requestAction('clear')}>🗑</button>
          </div>
        </div>
      </div>

      {/* ── Expansões ─────────────────────────────────────────────────── */}
      <div className="tw-card mb-2 p-3">
        <p className="font-nunito font-black text-[0.72rem] uppercase tracking-widest mb-2 m-0" style={{ color: C.TEXT_MUTED }}>◆ Expansões de Ilhas</p>
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {['FOGO', 'BELLA', 'TERRA'].map(ilha => {
            const meta = ILHA_META[ilha];
            const ativo = expansoes[ilha];
            return (
              <div key={ilha}
                className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                style={{
                  border: `1.5px solid ${ativo ? meta.color : C.BORDER_SOFT}`,
                  background: ativo ? meta.lightBg : C.BG_SECONDARY,
                  opacity: isEditing ? 1 : 0.75,
                  boxShadow: ativo ? `0 0 8px ${meta.color}30` : 'none',
                }}
                onClick={() => toggleExpansao(ilha)}
              >
                <span className="text-lg leading-none">{meta.icon}</span>
                <div>
                  <p className="font-nunito font-black text-[0.68rem] m-0 leading-tight" style={{ color: ativo ? meta.color : C.TEXT_MUTED }}>
                    ILHA DE {ilha}
                  </p>
                  <p className="font-nunito font-bold text-[0.62rem] m-0" style={{ color: ativo ? meta.color : C.TEXT_FAINT }}>
                    {ativo ? '✓ Desbloqueada' : '✗ Bloqueada'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Indicadores de limite ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {[
          { label: 'CID. PRINC', val: cidPrinc,  max: limCidPrinc,       icon: '🏙' },
          { label: 'SÍTIO PRINC', val: sitPrinc, max: limiteSipioPrinc,  icon: '🌾' },
          { label: 'CID. ÁGUA',  val: cidAgua,   max: limCidAgua,        icon: '🌊' },
          { label: 'SÍTIO ÁGUA', val: sitAgua,   max: limSitioAgua,      icon: '🔮' },
        ].map(({ label, val, max, icon }) => {
          const cheio = val >= max;
          return (
            <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: cheio ? 'rgba(200,122,44,0.08)' : C.BG_CARD, border: `1px solid ${cheio ? C.WARNING : C.BORDER_SOFT}` }}>
              <span className="text-sm leading-none">{icon}</span>
              <div>
                <p className="font-nunito font-black text-[0.52rem] uppercase tracking-wide m-0 leading-none" style={{ color: C.TEXT_MUTED }}>{label}</p>
                <p className="font-mono font-black text-[0.75rem] leading-tight m-0" style={{ color: cheio ? C.WARNING : C.TEXT_PRIMARY }}>
                  {val}/{max}{cheio && <span className="text-[0.6rem] ml-1">CHEIO</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tabela ────────────────────────────────────────────────────── */}
      <div className="tw-card mb-3 overflow-hidden" style={{ opacity: isEditing ? 1 : 0.87 }}>
        <GameHeader title="Distribuição de Edifícios" fontSize="0.82rem" />
        <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
          <table className="text-left" style={{ minWidth: 380, tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr style={{ background: C.BG_SECONDARY }}>
                {/* Col edifício */}
                <th className="sticky left-0 z-10 font-nunito font-black text-[0.6rem] uppercase tracking-widest py-2.5 px-2"
                  style={{ background: C.BG_SECONDARY, color: C.TEXT_MUTED, borderBottom: `2px solid ${C.BORDER}`, borderRight: `1px solid ${C.BORDER_SOFT}`, width: '22%' }}>
                  EDIFÍCIO
                </th>
                {ilhasNomes.map((ilha, idx) => {
                  const meta = ILHA_META[ilha];
                  const limIlha = idx === 1 ? (expansoes.FOGO ? 12 : 6) : idx === 3 ? (expansoes.BELLA ? 12 : 6) : idx === 4 ? (expansoes.TERRA ? 12 : 6) : null;
                  return (
                    <th key={ilha} align="center" className="py-2 px-1 text-center"
                      style={{ background: C.BG_SECONDARY, borderBottom: `2px solid ${C.BORDER}`, borderLeft: idx === 0 ? 'none' : `1px solid ${C.BORDER_SOFT}`, width: `${78/5}%` }}>
                      <p className="text-sm leading-none m-0">{meta.icon}</p>
                      <p className="font-nunito font-black text-[0.6rem] tracking-wide m-0" style={{ color: meta.color }}>{ilha}</p>
                      {limIlha !== null && <p className="font-nunito text-[0.5rem] m-0" style={{ color: C.TEXT_FAINT }}>{limIlha} lotes</p>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rIdx) => {
                const tipoCor = TIPO_COR[row.type];
                const isRecurso = !!tipoCor;
                const rowBg = isRecurso ? tipoCor.bg : (rIdx % 2 === 0 ? C.BG_CARD : C.BG_SECONDARY);
                return (
                  <tr key={row.id} style={{ background: rowBg }}>
                    <td className="sticky left-0 z-0 font-nunito font-bold text-[0.78rem] py-1.5 px-2 whitespace-nowrap"
                      style={{ background: rowBg, color: isRecurso ? tipoCor.accent : C.TEXT_PRIMARY,
                        borderBottom: `1px solid ${C.BORDER_SOFT}`, borderRight: `1px solid ${C.BORDER_SOFT}`,
                        borderLeft: isRecurso ? `4px solid ${tipoCor.accent}` : '4px solid transparent' }}>
                      {isRecurso && <span className="mr-1">{tipoCor.label}</span>}
                      {row.name}
                    </td>
                    {row.values.map((val, cIdx) => (
                      <td key={cIdx} className="text-center p-1"
                        style={{ borderBottom: `1px solid ${C.BORDER_SOFT}`, borderLeft: `1px solid ${C.BORDER_SOFT}` }}>
                        {isAllowed(row.type, cIdx) ? (
                          <input
                            type="text" inputMode="numeric"
                            value={val}
                            disabled={!isEditing}
                            onChange={e => handleChange(rIdx, cIdx, e.target.value)}
                            style={{
                              width: '100%', minWidth: 28, maxWidth: 38,
                              background: isEditing ? C.BG_INPUT : 'transparent',
                              border: isEditing ? `1px solid ${isRecurso ? tipoCor.accent : C.BORDER}` : 'none',
                              color: isRecurso ? tipoCor.accent : C.TEXT_PRIMARY,
                              borderRadius: 4, padding: '4px 2px', textAlign: 'center',
                              outline: 'none', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.82rem',
                            }}
                          />
                        ) : (
                          <span className="font-bold text-sm" style={{ color: C.TEXT_FAINT }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {/* Fixos */}
              {fixos.map((nome, idx) => (
                <tr key={nome} style={{ background: C.BG_SECONDARY, opacity: 0.75 }}>
                  <td className="sticky left-0 font-nunito font-bold italic text-[0.75rem] py-1.5 px-2"
                    style={{ background: C.BG_SECONDARY, color: C.TEXT_MUTED,
                      borderBottom: idx === fixos.length - 1 ? 'none' : `1px solid ${C.BORDER_SOFT}`,
                      borderRight: `1px solid ${C.BORDER_SOFT}`, borderLeft: '4px solid transparent' }}>
                    {nome}
                  </td>
                  {ilhasNomes.map((ilha, cIdx) => (
                    <td key={ilha} className="text-center p-1.5"
                      style={{ borderBottom: idx === fixos.length - 1 ? 'none' : `1px solid ${C.BORDER_SOFT}`, borderLeft: `1px solid ${C.BORDER_SOFT}` }}>
                      <span className="font-mono font-black text-[0.78rem]" style={{ color: cIdx === 0 ? C.ACCENT : C.TEXT_FAINT }}>
                        {cIdx === 0 ? '1' : '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Painéis inferiores ────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 md:flex-row">

        {/* Infraestrutura */}
        <div className="tw-card md:w-5/12">
          <GameHeader title="Infraestrutura" fontSize="0.82rem" />
          <div className="p-3">
            <InfraRow label="Fortaleza" tipo="fortaleza" maxNivel={20}>
              <p className="font-nunito font-semibold text-[0.72rem] mt-1 m-0" style={{ color: C.TEXT_MUTED }}>
                Sítio: <span style={{ color: C.ACCENT, fontWeight: 900 }}>{limiteSipioPrinc}</span> lotes
                &nbsp;·&nbsp; Territórios: <span style={{ color: C.ACCENT, fontWeight: 900 }}>{maxTerritorios}</span>
              </p>
            </InfraRow>
            <InfraRow label="Casas" qtd={totais.casas} tipo="casas" maxNivel={30}>
              <p className="font-nunito font-semibold text-[0.72rem] mt-1 m-0" style={{ color: C.TEXT_MUTED }}>
                +<span style={{ color: C.ACCENT_DEEP, fontWeight: 900 }}>{dbCasa.popAumento}</span> hab./edifício
              </p>
            </InfraRow>
            <InfraRow label="Fontes de Cura" qtd={totais.fontes} tipo="fontes" maxNivel={35}>
              <p className="font-nunito font-semibold text-[0.72rem] mt-1 m-0" style={{ color: C.TEXT_MUTED }}>
                Cura total: <span style={{ color: C.HEALTH, fontWeight: 900 }}>{fmtN(totalCura)}</span> tropas
              </p>
            </InfraRow>
            <div className="gold-stripe opacity-30 my-2" />
            {[
              { label: 'Pop. ativa',         val: `${fmtN(popUsada)} / ${fmtN(popTotal)}`, color: C.TEXT_PRIMARY },
              { label: 'Territórios usados', val: `${terrUsados} / ${maxTerritorios}`,     color: terrUsados >= maxTerritorios ? C.ERROR : C.TEXT_PRIMARY },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between items-center mb-1.5 px-0.5">
                <span className="font-nunito font-bold text-[0.75rem]" style={{ color: C.TEXT_MUTED }}>{label}</span>
                <span className="font-mono font-black text-[0.78rem]" style={{ color }}>{val}</span>
              </div>
            ))}
            <div className="flex justify-between items-center px-3 py-2.5 rounded-lg mt-2"
              style={{ background: popLivre < 0 ? `${C.ERROR}10` : `${C.SUCCESS}10`, border: `1px solid ${popLivre < 0 ? C.ERROR : C.SUCCESS}` }}>
              <span className="font-nunito font-black text-[0.75rem]" style={{ color: popLivre < 0 ? C.ERROR : C.SUCCESS }}>👥 Pop. livre</span>
              <span className="font-mono font-black text-base" style={{ color: popLivre < 0 ? C.ERROR : C.SUCCESS }}>{fmtN(popLivre)}</span>
            </div>
          </div>
        </div>

        {/* Produção */}
        <div className="tw-card md:flex-1">
          <GameHeader title="Produção de Recursos" fontSize="0.82rem" />
          <div className="p-3">
            <ProdRow titulo="Fazendas"   qtd={totais.fazendas}  tipoNivel="fazendas"  maxNivel={35} ganhoLabel="COMIDA"  ganhoValor={prodComida}  cor={TIPO_COR.fazendas.accent}  terrQtd={territorios.fazendas}  onTerrAdd={() => alteraTerritorio('fazendas', 1)}  onTerrSub={() => alteraTerritorio('fazendas', -1)} />
            <ProdRow titulo="Minas"      qtd={totais.minas}     tipoNivel="minas"     maxNivel={35} ganhoLabel="FERRO"   ganhoValor={prodFerro}   cor={TIPO_COR.minas.accent}     terrQtd={territorios.minas}     onTerrAdd={() => alteraTerritorio('minas', 1)}     onTerrSub={() => alteraTerritorio('minas', -1)} />
            <ProdRow titulo="Pedreiras"  qtd={totais.pedreiras} tipoNivel="pedreiras" maxNivel={35} ganhoLabel="PEDRA"   ganhoValor={prodPedra}   cor={TIPO_COR.pedreiras.accent} terrQtd={territorios.pedreiras} onTerrAdd={() => alteraTerritorio('pedreiras', 1)} onTerrSub={() => alteraTerritorio('pedreiras', -1)} />
            <ProdRow titulo="Serrarias"  qtd={totais.serrarias} tipoNivel="serrarias" maxNivel={35} ganhoLabel="MADEIRA" ganhoValor={prodMadeira} cor={TIPO_COR.serrarias.accent} terrQtd={territorios.serrarias} onTerrAdd={() => alteraTerritorio('serrarias', 1)} onTerrSub={() => alteraTerritorio('serrarias', -1)} />
            <ProdRow titulo="F. Pérolas" qtd={totais.perolas}   tipoNivel="perolas"   maxNivel={20} ganhoLabel="PÉROLAS" ganhoValor={prodPerolas} cor={TIPO_COR.perolas.accent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ilhas;
