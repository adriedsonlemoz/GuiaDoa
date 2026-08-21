import React, { useMemo, useState } from 'react';
import { getIcone, getTipoAtaque, fmtFull } from '../tropaUtils.js';
import { useI18n } from '../../../hooks/useI18n.jsx';

export default function TropaPicker({ tropas, selecionadas, onEscolher, onFechar }) {
  const { t, content, locale } = useI18n();
  const [busca, setBusca] = useState('');
  const lista = useMemo(() => {
    const term = busca.toLowerCase();
    return tropas
      .filter(item => !selecionadas.find(selected => selected?.nome === item.nome))
      .filter(item => content(item, 'nome').toLowerCase().includes(term))
      .sort((a, b) => content(a, 'nome').localeCompare(content(b, 'nome')));
  }, [tropas, selecionadas, busca, content]);

  return (
    <div onClick={onFechar} className="game-modal-backdrop">
      <div onClick={event => event.stopPropagation()} className="game-modal-sheet" style={{ maxHeight:'82dvh' }}>
        <header className="game-modal-heading">
          <span />
          <h2>{t('troops.select')}</h2>
          <button className="game-modal-close" onClick={onFechar} aria-label={t('common.close')}>✕</button>
        </header>
        <div style={{ padding:'9px 10px', borderBottom:'1px solid rgba(126,94,47,.22)', background:'rgba(231,219,184,.72)' }}>
          <input className="game-field" placeholder={`⌕ ${t('common.search')}...`} value={busca} onChange={event => setBusca(event.target.value)} autoFocus />
        </div>
        <div className="game-list" style={{ border:0, borderRadius:0 }}>
          {lista.map(item => {
            const tipo = getTipoAtaque(item, t);
            const nome = content(item, 'nome');
            return (
              <button key={item.nome} onClick={() => onEscolher(item)} className="game-list-row">
                <div className="game-thumb" style={{ width:54, height:54, flexBasis:54 }}>
                  <span style={{ fontSize:'1.55rem' }}>{getIcone(item.nome)}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="game-list-name" style={{ fontSize:'.82rem' }}>{nome}</div>
                  <div className="game-list-meta">{tipo.label}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span className="game-power-label">{t('common.power')}</span>
                  <strong className="game-power-value">{item.poder ? fmtFull(item.poder, locale) : '—'}</strong>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
