import React, { useMemo, useState } from 'react';
import { GameActionButton, GameSectionTitle } from '../shared/GameChrome.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';

const RESOURCE_ICONS = {
  food:'🍞', wood:'🪵', stone:'🧱', metals:'⛏', gold:'🟡', pearls:'◉', seeds:'✦', geodes:'◆', sulfur:'🔥',
  ice_crystal:'❄', venom_crystal:'☣', dark_crystal:'♦',
};

const RESOURCE_KEYS = {
  food:'troops.resource.food', wood:'troops.resource.wood', stone:'troops.resource.stone', metals:'troops.resource.metals',
  gold:'troops.resource.gold', pearls:'troops.resource.pearls', seeds:'troops.resource.seeds', geodes:'troops.resource.geodes',
  sulfur:'troops.resource.sulfur', ice_crystal:'troops.resource.ice_crystal', venom_crystal:'troops.resource.venom_crystal',
  dark_crystal:'troops.resource.dark_crystal',
};

function toQuantity(value) {
  const n = Number(String(value ?? '').replace(/\D/g,''));
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export default function TroopTrainingPlanner({ troop, onOpenTournament }) {
  const { t, locale } = useI18n();
  const training = troop?.treinamento;
  const [quantity, setQuantity] = useState('1');
  const qty = toQuantity(quantity);
  const power = Number(troop?.poder) || 0;
  const costs = Array.isArray(training?.custos) ? training.custos : [];
  const requirements = Array.isArray(training?.requisitos) ? training.requisitos : [];
  const population = Number(training?.populacao) || 0;
  const hasKnownData = Boolean(training?.dadosCompletos && (costs.length || requirements.length || population));

  const totals = useMemo(() => costs.map(item => ({
    ...item,
    total: (Number(item.quantidade) || 0) * qty,
  })), [costs, qty]);

  if (troop?.tipo === 'especial' || training?.obtencao === 'evento' || training?.disponivel === false) {
    return (
      <section className="game-panel troop-training-panel">
        <GameSectionTitle>{t('troops.training')}</GameSectionTitle>
        <div className="troop-training-event">{t('troops.event_only')}</div>
      </section>
    );
  }

  if (!hasKnownData) {
    return (
      <section className="game-panel troop-training-panel">
        <GameSectionTitle>{t('troops.training')}</GameSectionTitle>
        <div className="troop-training-empty">{t('troops.training_data_pending')}</div>
      </section>
    );
  }

  return (
    <section className="game-panel troop-training-panel">
      <GameSectionTitle>{t('troops.training')}</GameSectionTitle>

      <div className="troop-training-quantity">
        <label htmlFor="troop-train-qty">{t('troops.quantity_to_train')}</label>
        <input
          id="troop-train-qty"
          inputMode="numeric"
          value={quantity}
          onChange={event => setQuantity(event.target.value.replace(/\D/g,''))}
          onBlur={() => { if (!toQuantity(quantity)) setQuantity('1'); }}
          aria-label={t('troops.quantity_to_train')}
        />
        <div className="troop-training-presets">
          {[1000,10000,100000].map(value => (
            <button key={value} type="button" onClick={() => setQuantity(String(value))}>
              {value >= 1000 ? `${value/1000}k` : value}
            </button>
          ))}
        </div>
      </div>

      <div className="troop-training-power">
        <span>{t('troops.power_gained')}</span>
        <strong>{(qty * power).toLocaleString(locale)}</strong>
        <small>{qty.toLocaleString(locale)} × {power.toLocaleString(locale)}</small>
      </div>

      <div className="troop-training-table" role="table" aria-label={t('troops.training_cost')}>
        <div className="troop-training-table-head" role="row">
          <span>{t('troops.resource')}</span>
          <span>{t('troops.per_unit')}</span>
          <span>{t('troops.total')}</span>
        </div>
        {totals.map(item => {
          const label = RESOURCE_KEYS[item.id] ? t(RESOURCE_KEYS[item.id]) : (item.nome || item.id);
          return (
            <div className="troop-training-table-row" role="row" key={item.id || item.nome}>
              <span><b aria-hidden="true">{RESOURCE_ICONS[item.id] || '•'}</b>{label}</span>
              <span>{Number(item.quantidade || 0).toLocaleString(locale)}</span>
              <strong>{Number(item.total || 0).toLocaleString(locale)}</strong>
            </div>
          );
        })}
        {population > 0 ? (
          <div className="troop-training-table-row is-population" role="row">
            <span><b aria-hidden="true">♟</b>{t('troops.idle_population')}</span>
            <span>{population.toLocaleString(locale)}</span>
            <strong>{(population * qty).toLocaleString(locale)}</strong>
          </div>
        ) : null}
      </div>

      {requirements.length ? (
        <div className="troop-requirements-block">
          <div className="troop-subheading">{t('troops.requirements')}</div>
          {requirements.map((item, index) => (
            <div className="troop-requirement-row" key={`${item.tipo}-${item.nome}-${index}`}>
              <span className="troop-requirement-type">{item.tipo === 'pesquisa' ? '⌘' : '♜'}</span>
              <span>{item.nome}</span>
              <strong>{t('common.level_short')} {item.nivel}</strong>
            </div>
          ))}
        </div>
      ) : null}

      {onOpenTournament ? (
        <div className="troop-training-tournament">
          <GameActionButton tone="green" onClick={() => onOpenTournament(troop, Math.max(1, qty))}>
            ⚔ {t('troops.use_in_training_tournament')}
          </GameActionButton>
        </div>
      ) : null}
    </section>
  );
}
