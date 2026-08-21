import React, { useMemo, useState } from 'react';
import GameHeader from './shared/GameHeader.jsx';
import Modal from '../ui/Modal.jsx';
import Toast from '../ui/Toast.jsx';
import { C } from '../theme.js';
import { useI18n } from '../hooks/useI18n.jsx';
import { DISPLAY_VERSION } from '../version.js';
import { API_URL as API } from '../config/api.js';

const CHANGELOG_CONFIG = [
  { ver: DISPLAY_VERSION, icon: '🛡️', key: 'latest', color: '#4E716A', count: 5 },
  { ver: 'Beta 2.73', icon: '↻', key: 'history.2_73', color: '#58746B', count: 5 },
  { ver: 'Beta 2.72', icon: '↻', key: 'history.2_72', color: '#58746B', count: 5 },
  { ver: 'Beta 2.71', icon: '🌍', key: 'history.2_71', color: '#4B6D65', count: 5 },
  { ver: 'Beta 2.70', icon: '⚡', key: 'history.2_70', color: '#7A5C24', count: 5 },
];

const Sobre = () => {
  const { t } = useI18n();
  const [openContato, setOpenContato] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const infoCards = useMemo(() => [
    { icon: '🏰', title: t('about.unofficial_title'), text: t('about.unofficial_text') },
    { icon: '⚔️', title: t('about.calculations_title'), text: t('about.calculations_text') },
    { icon: '🐉', title: t('about.dynamic_title'), text: t('about.dynamic_text') },
  ], [t]);

  const changelog = useMemo(() => CHANGELOG_CONFIG.map(entry => ({
    ...entry,
    name: entry.key === 'latest' ? t('about.latest_title') : t(`about.${entry.key}.title`),
    items: Array.from({ length: entry.count }, (_, i) => entry.key === 'latest'
      ? t(`about.latest_${i + 1}`)
      : t(`about.${entry.key}.${i + 1}`)),
  })), [t]);

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });
  const closeToast = () => setToast(current => ({ ...current, open: false }));

  const handleCopy = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message, 'success');
    } catch {
      showToast(t('errors.copy_failed'), 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto pb-6">
      <Toast {...toast} onClose={closeToast} />

      <Modal open={openContato} onClose={() => setOpenContato(false)} maxWidth={320}>
        <div className="p-4 text-center">
          <p className="text-4xl m-0 mb-2">📬</p>
          <p className="font-cinzel font-bold text-base tracking-wide m-0 mb-1" style={{ color: C.BLUE }}>{t('about.support_modal_title')}</p>
          <div className="gold-stripe mb-3 opacity-40" />
          <p className="font-nunito font-semibold text-sm leading-relaxed text-justify m-0 mb-3" style={{ color: C.TEXT_SECONDARY }}>
            {t('about.support_modal_text')}
          </p>
          <div className="py-2.5 px-3 rounded-lg mb-3" style={{ background: C.BG_SECONDARY, border: `2px dashed ${C.BORDER}` }}>
            <p className="font-nunito font-black text-[0.72rem] uppercase tracking-wider m-0 mb-0.5" style={{ color: C.TEXT_MUTED }}>{t('about.support_email')}:</p>
            <p className="font-mono font-black text-sm tracking-wide m-0" style={{ color: C.BLUE }}>suporte@guiadoa.com</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setOpenContato(false)}>{t('common.close')}</button>
            <button className="btn-navy flex-1" onClick={() => handleCopy('suporte@guiadoa.com', t('about.support_copy_success'))}>{t('about.copy_email')}</button>
          </div>
        </div>
      </Modal>

      <div className="tw-card mb-3">
        <GameHeader title={t('about.app_title')} />
        <div className="p-4 text-center bg-aoe-card">
          <img className="about-brand-icon" src="/img/app-icon.png" alt="GUIA DOA" />
          <div className="inline-flex items-center gap-2 mb-1">
            <p className="font-cinzel font-bold text-lg uppercase tracking-widest m-0" style={{ color: C.ACCENT_DEEP }}>{DISPLAY_VERSION}</p>
            <span className="font-nunito font-black text-[0.72rem] px-2 py-0.5 rounded-full text-white" style={{ background: C.SUCCESS, letterSpacing: '0.5px' }}>{t('about.new')}</span>
          </div>
          <p className="font-nunito font-semibold text-xs italic m-0 mb-2" style={{ color: C.TEXT_MUTED }}>“{t('about.tagline')}”</p>
          <div className="gold-stripe mb-3 opacity-50" />
          <p className="font-nunito font-semibold text-sm leading-relaxed text-justify m-0" style={{ color: C.TEXT_PRIMARY }}>{t('about.intro')}</p>
        </div>
      </div>

      <div className="tw-card mb-3">
        <GameHeader title={t('about.project')} fontSize="0.78rem" />
        <div className="p-3 bg-aoe-card space-y-2">
          {infoCards.map(card => (
            <div key={card.title} className="flex gap-2.5 items-start p-2.5 rounded-lg" style={{ background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}` }}>
              <span className="text-2xl leading-none shrink-0 mt-0.5">{card.icon}</span>
              <div>
                <p className="font-nunito font-black text-xs m-0 mb-0.5" style={{ color: C.TEXT_PRIMARY }}>{card.title}</p>
                <p className="font-nunito text-[0.72rem] leading-snug m-0" style={{ color: C.TEXT_SECONDARY }}>{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tw-card mb-3">
        <GameHeader title={t('about.updates')} fontSize="0.78rem" />
        <div className="p-3 bg-aoe-card space-y-2.5">
          {changelog.map((entry, index) => (
            <details
              key={entry.ver}
              className="about-changelog-entry rounded-lg overflow-hidden"
              style={{ border: `1.5px solid ${entry.color}40`, borderLeft: `4px solid ${entry.color}` }}
            >
              <summary className="about-changelog-summary flex items-center gap-2 px-3 py-2" style={{ background: `${entry.color}12` }}>
                <span className="text-xl leading-none" aria-hidden="true">{entry.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito font-black text-[0.8rem] m-0 leading-tight" style={{ color: C.TEXT_PRIMARY }}>{entry.name}</p>
                  <p className="font-nunito font-bold text-[0.72rem] m-0" style={{ color: entry.color }}>{entry.ver}</p>
                </div>
                {index === 0 && <span className="font-nunito font-black text-[0.72rem] px-1.5 py-0.5 rounded-full text-white" style={{ background: entry.color }}>{t('about.new')}</span>}
                <span className="about-changelog-chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="px-3 py-2 space-y-1">
                {entry.items.map(item => (
                  <p key={item} className="font-nunito text-[0.72rem] flex items-start gap-1.5 m-0" style={{ color: C.TEXT_SECONDARY }}>
                    <span style={{ color: entry.color }} className="shrink-0 mt-0.5">▸</span>{item}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button className="btn-navy btn-lg w-full" onClick={() => setOpenContato(true)}>📬 {t('about.support')}</button>
      </div>

      <button
        type="button"
        className="about-admin-shortcut"
        aria-label={t('about.admin_access')}
        title={t('about.admin_access')}
        onClick={() => window.open(`${API}/admin`, '_blank', 'noopener,noreferrer')}
      >
        ⚙
      </button>
    </div>
  );
};

export default Sobre;
