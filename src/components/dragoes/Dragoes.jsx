import React, { useMemo, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import DragaoCard from './ui/DragaoCard.jsx';
import DragaoComparacao from './ui/DragaoComparacao.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import GameHeader from '../shared/GameHeader.jsx';
import { GameSectionTitle, GameTabs } from '../shared/GameChrome.jsx';

const Dragoes = ({ setRoute }) => {
  const { dragoes } = useGameData();
  const { t, content } = useI18n();
  const [busca, setBusca] = useState('');
  const [comparando, setComparando] = useState([]);
  const [nivelIdx, setNivelIdx] = useState(0);
  const [aba, setAba] = useState('lista');
  const apiDataMap = useMemo(() => Object.fromEntries(dragoes.map(d => [d.id,d])), [dragoes]);
  const filtrados = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return dragoes.filter(d => content(d,'nome')?.toLowerCase().includes(term) || content(d,'elemento')?.toLowerCase().includes(term));
  }, [dragoes,busca,content]);
  const elementos = useMemo(() => [...new Set(dragoes.map(d => d.elemento).filter(Boolean))].sort(), [dragoes]);

  const toggleComparar = id => setComparando(current => current.includes(id) ? current.filter(v => v !== id) : current.length >= 3 ? current : [...current,id]);
  const removerComparacao = id => setComparando(current => current.filter(v => v !== id));

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:18, animation:'reveal-up .3s ease both' }}>
      <GameHeader title={t('dragons.subtitle')} subtitle={t('dragons.compare_help')} />
      <GameTabs tabs={[
        { id:'lista', label:t('dragons.list'), icon:'📋' },
        { id:'comparar', label:`${t('dragons.compare')}${comparando.length ? ` (${comparando.length})` : ''}`, icon:'⚔️' },
      ]} value={aba} onChange={setAba} />

      {aba === 'comparar' ? (
        comparando.length ? <div style={{ marginTop:8 }}><DragaoComparacao ids={comparando} nivelIdx={nivelIdx} setNivelIdx={setNivelIdx} apiDataMap={apiDataMap} onRemover={removerComparacao} todosDragoes={dragoes} /></div>
          : <div className="game-panel" style={{ marginTop:8, padding:30, textAlign:'center', color:'#806d4d' }}>🐉<div style={{ marginTop:7 }}>{t('dragons.none_selected')}</div></div>
      ) : (
        <>
          <div className="game-filter-row" style={{ marginTop:8 }}><span>⌕</span><input className="game-field" placeholder={t('dragons.search')} value={busca} onChange={e => setBusca(e.target.value)} /></div>
          <div style={{ display:'grid', gap:9, marginTop:8 }}>
            {elementos.map(elemento => {
              const lista = filtrados.filter(d => d.elemento === elemento);
              if (!lista.length) return null;
              return <section className="game-panel" key={elemento}><GameSectionTitle>{content(lista[0],'elemento') || elemento}</GameSectionTitle>{lista.map(d => <DragaoCard key={d.id} dragao={d} onClick={id => setRoute(`dragao_${id}`)} selecionado={comparando.includes(d.id)} onToggleComparar={toggleComparar} noSlot={comparando.length >= 3} />)}</section>;
            })}
            {!filtrados.length ? <div className="game-panel" style={{ padding:30, textAlign:'center', color:'#806d4d' }}>{t('dragons.no_results')}</div> : null}
          </div>
        </>
      )}
    </div>
  );
};

export default Dragoes;
