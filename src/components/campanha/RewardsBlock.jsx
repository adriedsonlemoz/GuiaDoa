import React from 'react';
import CollapsibleSection from './CollapsibleSection.jsx';

export default function RewardsBlock({ rewards, status = 'pendente', t, locale }) {
  const confirmedEmpty = status === 'confirmado' && rewards.length === 0;
  const meta = confirmedEmpty ? '0' : (rewards.length ? String(rewards.length) : '—');

  return (
    <CollapsibleSection title={t('campaign.possible_rewards')} meta={meta}>
      {rewards.length ? (
        <div className="campaign-reward-grid">
          {rewards.map((reward, index) => {
            const translated = locale !== 'pt-BR' ? reward?.i18n?.[locale] || {} : {};
            const name = translated.nome || reward.nome || '';
            return (
              <div className={`campaign-reward ${reward.nomeConfirmado ? 'is-named' : 'is-symbolic'} ${reward.imagem ? 'has-image' : ''}`} key={reward.codigo || index}>
                {reward.imagem ? (
                  <img className="campaign-reward-image" src={reward.imagem} alt={name || t('campaign.reward_unknown')} loading="lazy" />
                ) : (
                  <span className="campaign-reward-symbol">{reward.simbolo || `R${index + 1}`}</span>
                )}
                <div>
                  <strong>{name || t('campaign.reward_unknown')}</strong>
                  {!reward.nomeConfirmado && <small>{t('campaign.reward_name_pending')}</small>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="campaign-reward-empty">{confirmedEmpty ? t('campaign.no_rewards_confirmed') : t('campaign.rewards_pending')}</p>
      )}
      {rewards.length > 0 && <p className="campaign-reward-note">{t('campaign.reward_note')}</p>}
    </CollapsibleSection>
  );
}
