import React from 'react';

export default function ItemPrice({ preco, compact = false }) {
  if (preco?.valor === null || preco?.valor === undefined || preco?.valor === '') return null;
  const value = Number(preco.valor);
  if (!Number.isFinite(value)) return null;
  const hasOriginal = preco?.valorOriginal !== null && preco?.valorOriginal !== undefined && preco?.valorOriginal !== '';
  const original = hasOriginal ? Number(preco.valorOriginal) : null;
  return (
    <span className={`item-ruby-price${compact ? ' item-ruby-price--compact' : ''}`} title={`${value} Rubis`}>
      <span aria-hidden="true" className="item-ruby-gem">♦</span>
      {Number.isFinite(original) && original > value ? <s>{original}</s> : null}
      <strong>{value}</strong>
    </span>
  );
}
