import React, { useEffect, useState } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';
import { GameInfoTable, GamePanel, GameTabs } from '../shared/GameChrome.jsx';
import BuildingModuleNav from './BuildingModuleNav.jsx';

const COLUMN_LABEL_KEYS = {
  desc:'buildings.column.effect', populacao:'buildings.column.population', producaoHora:'buildings.column.production_hour',
  capacidadeMax:'buildings.column.max_capacity', maxTropas:'buildings.column.max_troops', aumentoPopulacao:'buildings.column.population_increase',
  territorios:'buildings.column.territories', reforcos:'buildings.column.reinforcements', areas:'buildings.column.areas', marchas:'buildings.column.marches',
  tropasPorMarcha:'buildings.column.troops_march',
};
const fmt = (v, locale='pt-BR') => v === null || v === undefined ? '—' : typeof v === 'number' ? v.toLocaleString(locale) : v;

export default function NormalBuildingsView({ edificios, setRoute }) {
  const { t, content, locale } = useI18n();
  const [sel, setSel] = useState(null);
  const [aba, setAba] = useState('tabela');
  const [nivel, setNivel] = useState('1');
  const [qtd, setQtd] = useState('1');

  useEffect(() => { if (!sel && edificios.length) setSel(edificios[0].slug); }, [edificios, sel]);
  const ed = edificios.find(e => e.slug === sel);
  const dados = ed?.niveis || [];
  const colunas = ed?.colunas?.length ? ed.colunas : dados.length
    ? Object.keys(dados[0]).filter(k => k !== 'nivel').map(k => ({ key:k, label:COLUMN_LABEL_KEYS[k] ? t(COLUMN_LABEL_KEYS[k]) : k.toUpperCase(), tipo:'number' }))
    : [];
  const nivelNum = parseInt(nivel,10) || 1;
  const nivelFim = Math.min(nivelNum + (parseInt(qtd,10) || 1) - 1, dados.length);
  const nAtual = dados.find(r => String(r.nivel) === String(nivelNum));
  const nFim = dados.find(r => r.nivel === nivelFim);

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:18 }}>
      <BuildingModuleNav setRoute={setRoute} />
      <GameHeader title={t('buildings.normal_title')} subtitle={t('buildings.subtitle')} />
      {!edificios.length ? <div className="game-panel building-empty">{t('buildings.no_data_help')}</div> : <>
        <div className="game-filter-row" style={{ marginBottom:8 }}>
          <span className="game-filter-label">{t('buildings.select')}:</span>
          <select className="game-field" value={sel || ''} onChange={event => { setSel(event.target.value); setAba('tabela'); setNivel('1'); setQtd('1'); }}>
            {edificios.map(item => <option key={item.slug} value={item.slug}>{content(item,'nome')}</option>)}
          </select>
        </div>
        {ed ? <>
          <GamePanel>
            <div className="game-detail-hero">
              <div className="game-thumb" style={{ fontSize:'2.7rem' }}>{ed.icone || '🏗️'}</div>
              <div style={{ minWidth:0 }}>
                <h1 className="game-detail-title">{content(ed,'nome')}</h1>
                <div className="game-list-meta">{content(ed,'tag') || '—'}</div>
                {content(ed,'descricao') ? <p className="game-detail-copy">{content(ed,'descricao')}</p> : null}
              </div>
            </div>
          </GamePanel>
          <div style={{ marginTop:8 }}><GameTabs tabs={[{id:'tabela',label:t('buildings.table')},{id:'ganhos',label:t('buildings.gains')}]} value={aba} onChange={setAba} /></div>
          {aba === 'tabela' ? <section className="game-panel" style={{ marginTop:8 }}>
            {!dados.length ? <div className="building-empty">{t('buildings.no_levels')}</div> : <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:Math.max(360,80+colunas.length*100) }}>
                <thead><tr><th className="tw-th">{t('common.level')}</th>{colunas.map(c => <th key={c.key} className="tw-th">{c.label}</th>)}</tr></thead>
                <tbody>{dados.map(row => <tr key={row.nivel}><td className="tw-td" style={{ fontWeight:900,color:'#6b512b',textAlign:'center' }}>{row.nivel}</td>{colunas.map(c => <td key={c.key} className="tw-td">{fmt(row[c.key],locale)}</td>)}</tr>)}</tbody>
              </table>
            </div>}
          </section> : <section style={{ marginTop:8 }}>
            <div className="game-filter-row" style={{ marginBottom:8 }}>
              <label style={{ flex:1 }}><span className="game-filter-label" style={{ display:'block',marginBottom:4 }}>{t('buildings.initial_level')}</span><input type="number" min={1} max={dados.length} className="game-field" value={nivel} onChange={e=>setNivel(e.target.value)} /></label>
              <label style={{ flex:1 }}><span className="game-filter-label" style={{ display:'block',marginBottom:4 }}>{t('buildings.level_count')}</span><input type="number" min={1} className="game-field" value={qtd} onChange={e=>setQtd(e.target.value)} /></label>
            </div>
            {nAtual && nFim ? <GameInfoTable rows={colunas.filter(c=>c.key!=='desc').map(c=>{ const de=nAtual[c.key], para=nFim[c.key]; const diff=typeof de==='number'&&typeof para==='number'?para-de:null; return {key:c.key,label:c.label,value:fmt(de,locale),next:`${fmt(para,locale)}${diff!==null&&diff>0?` ↑ +${fmt(diff,locale)}`:''}`}; })} /> : <div className="building-empty">{t('buildings.out_of_range')}</div>}
          </section>}
        </> : null}
      </>}
    </div>
  );
}
