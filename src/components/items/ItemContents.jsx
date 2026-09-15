import React from 'react';
import ItemReferenceCard from './ItemReferenceCard.jsx';

export default function ItemContents({ item, itemMap, onOpen, t }) {
  const rows = (item?.conteudo || []).map(row => ({ ...row, target:itemMap.get(row.itemSlug) }));
  if (!rows.length && !item?.conteudoObservacao) return null;
  return (
    <section className="item-detail-section">
      <h4>{t('items.contents')}</h4>
      {rows.length ? (
        <div className="item-contents-grid">
          {rows.map((row, index) => row.target ? (
            <ItemReferenceCard key={`${row.itemSlug}-${index}`} item={row.target} quantity={row.quantidade} compact onClick={() => onOpen?.(row.target)} />
          ) : (
            <div className="item-reference-card item-reference-card--compact" key={`${row.itemSlug}-${index}`}>
              <span className="item-reference-thumb" style={{ width:42, height:42, flexBasis:42 }}>🎒</span>
              <span className="item-reference-copy"><strong>{row.itemSlug}</strong><span>x{row.quantidade ?? 1}</span></span>
            </div>
          ))}
        </div>
      ) : null}
      {item.conteudoObservacao ? <p className="item-detail-note">{item.conteudoObservacao}</p> : null}
    </section>
  );
}
