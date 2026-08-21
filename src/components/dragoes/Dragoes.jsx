import React, { useMemo, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import DragaoCard from './ui/DragaoCard.jsx';
import DragaoComparacao from './ui/DragaoComparacao.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';
import { GameTabs } from '../shared/GameChrome.jsx';

const Dragoes = ({ setRoute }) => {
  const { dragoes } = useGameData();
  const { t, content } = useI18n();
  const [busca, setBusca] = useState('');
  const [comparando, setComparando] = useState([]);
  const [aba, setAba] = useState('lista');
  const filtrados = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return dragoes.filter(d => !term || content(d,'nome')?.toLowerCase().includes(term) || content(d,'elemento')?.toLowerCase().includes(term) || (d.aliases || []).some(alias => String(alias).toLowerCase().includes(term)));
  }, [dragoes,busca,content]);
  const toggleComparar = id => setComparando(current => current.includes(id) ? current.filter(v => v !== id) : current.length >= 2 ? current : [...current,id]);
  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:18, animation:'reveal-up .3s ease both' }}>
      <GameHeader title={t('dragons.subtitle')} subtitle={t('dragons.compare_help')} />
      <GameTabs tabs={[{ id:'lista', label:t('dragons.list') },{ id:'comparar', label:`${t('dragons.compare')}${comparando.length ? ` (${comparando.length}/2)` : ''}` }]} value={aba} onChange={setAba} />
      {aba === 'comparar' ? (
        comparando.length === 2 ? <DragaoComparacao ids={comparando} todosDragoes={dragoes} onRemover={id=>setComparando(v=>v.filter(x=>x!==id))} /> : <div className="game-panel" style={{ marginTop:8, padding:28, textAlign:'center', color:'#806d4d' }}>🐉<div style={{ marginTop:7 }}>{t('dragons.choose_two')}</div></div>
      ) : <>
        <div className="game-filter-row" style={{ marginTop:8 }}><span>⌕</span><input className="game-field" placeholder={t('dragons.search')} value={busca} onChange={e=>setBusca(e.target.value)} /></div>
        <section className="game-panel" style={{ marginTop:8 }}>{filtrados.map(d => <DragaoCard key={d.id} dragao={d} onClick={id=>setRoute(`dragao_${id}`)} selecionado={comparando.includes(d.id)} onToggleComparar={toggleComparar} noSlot={comparando.length >= 2} />)}{!filtrados.length ? <div style={{ padding:30, textAlign:'center', color:'#806d4d' }}>{t('dragons.no_results')}</div> : null}</section>
      </>}
    </div>
  );
};
export default Dragoes;
