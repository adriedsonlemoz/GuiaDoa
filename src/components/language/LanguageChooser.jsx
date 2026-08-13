import React from 'react';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';

const LanguageOption = ({ locale, active, onSelect, selectedLabel }) => (
  <button
    type="button"
    onClick={() => onSelect(locale.code)}
    aria-pressed={active}
    style={{
      width: '100%', minHeight: 104, padding: '16px 16px 15px', textAlign: 'left', cursor: 'pointer',
      display: 'grid', gridTemplateColumns: '54px 1fr auto', alignItems: 'center', gap: 14,
      borderRadius: 18,
      border: `1.5px solid ${active ? 'rgba(200,168,74,.78)' : 'rgba(200,168,74,.22)'}`,
      background: active
        ? 'linear-gradient(135deg,rgba(49,72,74,.10),rgba(200,168,74,.12))'
        : 'linear-gradient(180deg,rgba(248,244,232,.98),rgba(242,234,218,.98))',
      boxShadow: active ? '0 12px 28px rgba(62,47,28,.12), inset 0 0 0 1px rgba(255,255,255,.32)' : '0 6px 18px rgba(62,47,28,.06)',
      transition: 'transform .16s ease, border-color .16s ease, box-shadow .16s ease',
    }}
  >
    <span style={{
      width: 54, height: 54, borderRadius: 16, display: 'grid', placeItems: 'center', fontSize: 28,
      background: active ? 'linear-gradient(145deg,#3C6863,#2F5652)' : 'rgba(49,72,74,.06)',
      border: `1px solid ${active ? 'rgba(200,168,74,.55)' : 'rgba(49,72,74,.10)'}`,
      boxShadow: active ? '0 7px 18px rgba(49,72,74,.22)' : 'none',
    }}>{locale.flag}</span>

    <span style={{ minWidth: 0 }}>
      <strong className="font-nunito" style={{ display: 'block', color: C.TEXT_PRIMARY, fontSize: '1rem', fontWeight: 900, lineHeight: 1.15 }}>
        {locale.nativo}
      </strong>
      <span className="font-nunito" style={{ display: 'block', marginTop: 5, color: C.TEXT_MUTED, fontSize: '.7rem', fontWeight: 700 }}>
        {locale.label}
      </span>
      <span className="font-nunito" style={{ display: 'inline-block', marginTop: 7, color: C.TEXT_FAINT, fontSize: '.58rem', fontWeight: 900, letterSpacing: 1.2 }}>
        {locale.code.toUpperCase()}
      </span>
    </span>

    <span style={{
      width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0,
      background: active ? C.ACCENT : 'transparent',
      border: `1.5px solid ${active ? C.ACCENT : 'rgba(154,125,86,.28)'}`,
      color: active ? '#213F3C' : C.TEXT_FAINT, fontSize: 14, fontWeight: 900,
    }} aria-label={active ? selectedLabel : undefined}>
      {active ? '✓' : ''}
    </span>
  </button>
);

export default function LanguageChooser({ onBack, onDone, setup = false }) {
  const { locale, setLocale, t, LOCALES_DISPONIVEIS } = useI18n();

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: C.BG_MAIN }}>
      <header style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(150deg,#213F3C 0%,#2F5652 52%,#3C6863 100%)',
        borderBottom: '1px solid rgba(200,168,74,.55)',
        padding: setup ? '38px 18px 34px' : '18px 18px 28px',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', width: 210, height: 210, right: -90, top: -110, borderRadius: '50%', border: '1px solid rgba(200,168,74,.10)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', width: 140, height: 140, left: -70, bottom: -88, borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,168,74,.11),transparent 66%)' }} />

        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          {!setup && (
            <button type="button" onClick={onBack} aria-label={t('common.back')} style={{
              width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', marginBottom: 20,
              border: '1px solid rgba(200,168,74,.34)', background: 'rgba(248,242,224,.045)',
              color: 'rgba(248,242,224,.82)', cursor: 'pointer', fontSize: 17,
            }}>←</button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 15, display: 'grid', placeItems: 'center', flexShrink: 0,
              border: '1px solid rgba(200,168,74,.55)', background: 'rgba(248,242,224,.055)',
              boxShadow: '0 10px 26px rgba(0,0,0,.20)', color: C.ACCENT,
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", fontWeight: 900, fontSize: '.86rem', letterSpacing: 1,
            }}>DOA</div>
            <div>
              <p className="font-nunito" style={{ margin: 0, color: C.ACCENT, fontSize: '.6rem', fontWeight: 900, letterSpacing: 2.2, textTransform: 'uppercase' }}>
                {t('language.eyebrow')}
              </p>
              <h1 className="font-cinzel" style={{ margin: '5px 0 0', color: C.TEXT_HEADER, fontSize: '1.08rem', lineHeight: 1.25 }}>
                {t('language.choose_title')}
              </h1>
            </div>
          </div>
          <p className="font-nunito" style={{ margin: '14px 0 0', maxWidth: 390, color: 'rgba(248,242,224,.66)', fontSize: '.74rem', lineHeight: 1.55 }}>
            {t('language.choose_subtitle')}
          </p>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 480, margin: '0 auto', padding: '22px 16px 30px' }}>
        <div style={{ display: 'grid', gap: 11 }}>
          {LOCALES_DISPONIVEIS.map(item => (
            <LanguageOption
              key={item.code}
              locale={item}
              active={locale === item.code}
              onSelect={setLocale}
              selectedLabel={t('language.selected')}
            />
          ))}
        </div>

        <div style={{
          marginTop: 18, padding: '11px 13px', display: 'flex', gap: 10, alignItems: 'flex-start',
          borderRadius: 12, background: 'rgba(49,72,74,.05)', border: '1px solid rgba(49,72,74,.10)',
        }}>
          <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1.4 }}>◈</span>
          <p className="font-nunito" style={{ margin: 0, color: C.TEXT_MUTED, fontSize: '.66rem', fontWeight: 700, lineHeight: 1.5 }}>
            {t('language.note')}
          </p>
        </div>

        <button type="button" className="btn-navy btn-lg" onClick={onDone} style={{ width: '100%', marginTop: 18 }}>
          {setup ? t('language.continue') : t('language.done')}
        </button>
      </main>
    </div>
  );
}
