import React from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';

function localizedStone(stone, locale) {
  const tr = stone?.i18n?.[locale] || {};
  return { name:tr.nome || stone.nome, attribute:tr.atributo || stone.atributo };
}

export default function SpiritStoneGrid({ stones = [] }) {
  const { t, locale } = useI18n();
  return (
    <div className="spirit-stone-grid">
      {stones.map(stone => {
        const text = localizedStone(stone, locale);
        return (
          <article className="spirit-stone-card" key={stone.id}>
            <img src={stone.imagem} alt="" />
            <div>
              <strong>{text.name}</strong>
              <span>{text.attribute}</span>
              <small>{t('buildings.stone.level1_bonus', { value:String(stone.bonusBasePct).replace('.', locale === 'pt-BR' ? ',' : '.') })}</small>
            </div>
          </article>
        );
      })}
    </div>
  );
}
