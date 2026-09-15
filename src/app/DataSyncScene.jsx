import React, { useEffect } from 'react';
import { DISPLAY_VERSION } from '../version.js';
import { useI18n } from '../hooks/useI18n.jsx';

const DEFAULT_NODES = [
  { key:'gate', icon:'◇' },
  { key:'catalog', icon:'▦' },
  { key:'troops', icon:'⚔' },
  { key:'dragons', icon:'◆' },
  { key:'research', icon:'⌁' },
  { key:'guides', icon:'✦' },
];

export default function DataSyncScene({
  title,
  subtitle,
  progress = null,
  nodes = DEFAULT_NODES,
  completedKeys = [],
  currentKey = '',
  phase = 'sync',
}) {
  const { t } = useI18n();
  useEffect(() => {
    const bodyOverflow=document.body.style.overflow;
    const htmlOverflow=document.documentElement.style.overflow;
    const bodyOverscroll=document.body.style.overscrollBehavior;
    document.body.style.overflow='hidden';
    document.documentElement.style.overflow='hidden';
    document.body.style.overscrollBehavior='none';
    return () => {
      document.body.style.overflow=bodyOverflow;
      document.documentElement.style.overflow=htmlOverflow;
      document.body.style.overscrollBehavior=bodyOverscroll;
    };
  }, []);
  const total = progress?.total || nodes.length || 1;
  const step = Math.min(progress?.step || 0, total);
  const pct = Math.round((step / total) * 100);
  const hasMeasuredProgress = Boolean(progress?.total);

  return (
    <div className="sync-scene" role="status" aria-live="polite">
      <div className="sync-scene-glow sync-scene-glow-a" />
      <div className="sync-scene-glow sync-scene-glow-b" />

      <section className="sync-console">
        <div className="sync-console-eyebrow">{t('app.sync.core_label')}</div>

        <div className="sync-orbit-wrap" aria-hidden="true">
          <div className="sync-orbit sync-orbit-outer" />
          <div className="sync-orbit sync-orbit-inner" />
          <div className="sync-pulse-line sync-pulse-line-a" />
          <div className="sync-pulse-line sync-pulse-line-b" />

          <div className={`sync-core sync-core-${phase}`}>
            <img className="sync-core-logo" src="/img/app-icon.png" alt="" />
            <span className="sync-core-dot" />
          </div>

          {nodes.slice(0, 8).map((node, index) => {
            const angle = `${(360 / Math.max(nodes.length, 1)) * index}deg`;
            const done = completedKeys.includes(node.key);
            const active = currentKey === node.key || (!completedKeys.length && index === step);
            return (
              <div
                key={node.key}
                className={`sync-node ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`}
                style={{ '--sync-angle': angle }}
                title={node.label || ''}
              >
                <span>{done ? '✓' : node.icon}</span>
              </div>
            );
          })}
        </div>

        <div className="sync-console-copy">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="sync-route">
          <div className={`sync-route-step ${phase === 'connect' ? 'is-active' : 'is-done'}`}>
            <span>1</span>{t('app.sync.route_connect')}
          </div>
          <i />
          <div className={`sync-route-step ${phase === 'catalog' || phase === 'sync' ? 'is-active' : phase === 'ready' ? 'is-done' : ''}`}>
            <span>2</span>{t('app.sync.route_catalog')}
          </div>
          <i />
          <div className={`sync-route-step ${phase === 'ready' ? 'is-active is-done' : ''}`}>
            <span>3</span>{t('app.sync.route_ready')}
          </div>
        </div>

        {hasMeasuredProgress ? (
          <div className="sync-meter">
            <div className="sync-meter-head">
              <span>{progress.label || t('app.sync.connecting')}</span>
              <b>{pct}%</b>
            </div>
            <div className="sync-meter-track">
              <div className="sync-meter-fill" style={{ width:`${pct}%` }} />
              {Array.from({ length: total }, (_, index) => (
                <span key={index} className={index < step ? 'is-on' : ''} style={{ left:`${((index + 1) / total) * 100}%` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="sync-signal">
            <span /><span /><span />
            {t('app.sync.secure_channel')}
          </div>
        )}

        <div className="sync-console-version">GUIA DOA · {DISPLAY_VERSION}</div>
      </section>
    </div>
  );
}
