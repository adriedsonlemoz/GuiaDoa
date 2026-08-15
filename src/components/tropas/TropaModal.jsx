import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getIcone, getTipoAtaque, fmtFull, ATRIBUTOS } from './tropaUtils.js';
import RelatedTroopTips from './RelatedTroopTips.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { GameInfoTable, GameSectionTitle } from '../shared/GameChrome.jsx';
import TroopTrainingPlanner from './TroopTrainingPlanner.jsx';
import TroopCombatDetails from './TroopCombatDetails.jsx';

export default function TropaModal({ tropa, onFechar, onOpenTips, onOpenTournament }) {
  const { t, content, locale } = useI18n();

  useEffect(() => {
    const handler = event => { if (event.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', handler);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = previous;
    };
  }, [onFechar]);

  if (!tropa) return null;

  const type = getTipoAtaque(tropa, t);
  const name = content(tropa, 'nome');
  const description = content(tropa, 'desc');
  const unlock = tropa.desbloqueio || {};
  const unlockSource = content({ desbloqueioFonte:unlock.fonte, i18n:tropa.i18n }, 'desbloqueioFonte') || unlock.fonte;
  const unlockNote = content({ desbloqueioObservacao:unlock.observacao, i18n:tropa.i18n }, 'desbloqueioObservacao') || unlock.observacao;
  const rows = ATRIBUTOS.filter(attr => attr.id !== 'efi').map(attr => ({
    key: attr.id,
    icon: attr.icon,
    label: attr.labelKey ? t(attr.labelKey) : attr.label,
    value: tropa[attr.id] ? fmtFull(tropa[attr.id], locale) : '—',
  }));

  return createPortal(
    <div onClick={onFechar} className="game-modal-backdrop">
      <article onClick={event => event.stopPropagation()} className="game-modal-sheet">
        <header className="game-modal-heading">
          <button className="game-modal-close" onClick={onFechar} aria-label={t('common.close')}>‹</button>
          <h2>{name}</h2>
          <button className="game-modal-close" onClick={onFechar} aria-label={t('common.close')}>✕</button>
        </header>

        <div className="game-detail-hero">
          <div className="game-thumb">
            {tropa.imagem
              ? <img src={tropa.imagem} alt="" />
              : <span style={{ fontSize:'2.7rem' }}>{getIcone(tropa.nome)}</span>}
          </div>
          <div style={{ minWidth:0 }}>
            <h3 className="game-detail-title">{name}</h3>
            <div className="game-list-meta">{type.label} • ⭐ {tropa.poder || 0} {t('common.power').toLowerCase()}</div>
            {tropa.tipo === 'especial' ? <div className="game-badge">✨ {t('troops.special')}</div> : null}
            {description ? <p className="game-detail-copy">{description}</p> : null}
          </div>
        </div>

        <div className="game-modal-content">
          <GameSectionTitle>{t('troops.attributes').toUpperCase()}</GameSectionTitle>
          <GameInfoTable rows={rows} />

          <TroopCombatDetails troop={tropa} />

          <TroopTrainingPlanner troop={tropa} onOpenTournament={onOpenTournament} />

          {!tropa.treinamento && unlockSource ? (
            <section className="game-panel" style={{ marginTop:10 }}>
              <GameSectionTitle>{t('troops.training_requirement')}</GameSectionTitle>
              <div style={{ padding:'11px 12px', fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", color:'#58462c' }}>
                <div style={{ fontSize:'.78rem', fontWeight:700 }}>{unlockSource}{unlock.nivel ? ` • ${t('common.level_short')} ${unlock.nivel}` : ''}</div>
                {unlockNote ? <div style={{ marginTop:5, color:'#796644', fontSize:'.68rem', lineHeight:1.4 }}>{unlockNote}</div> : null}
              </div>
            </section>
          ) : null}

          <RelatedTroopTips troopName={tropa.nome} onOpenTips={onOpenTips} />
        </div>
      </article>
    </div>,
    document.body,
  );
}
