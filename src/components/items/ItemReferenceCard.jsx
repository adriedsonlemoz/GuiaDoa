import React from 'react';
import ItemPrice from './ItemPrice.jsx';

export function ItemThumb({ item, size = 48 }) {
  return (
    <span className="item-reference-thumb" style={{ width:size, height:size, flexBasis:size, fontSize:size * .42 }}>
      {item?.imagem ? <img src={item.imagem} alt="" loading="lazy" /> : <span>{item?.icone || '🎒'}</span>}
    </span>
  );
}

export default function ItemReferenceCard({ item, quantity = null, onClick, compact = false }) {
  if (!item) return null;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className={`item-reference-card${compact ? ' item-reference-card--compact' : ''}`}>
      <ItemThumb item={item} size={compact ? 42 : 50} />
      <span className="item-reference-copy">
        <strong>{item.nome}</strong>
        <span>{item.categoria || 'Geral'}{quantity != null ? ` · x${quantity}` : ''}</span>
      </span>
      <ItemPrice preco={item.preco} compact />
    </Tag>
  );
}
