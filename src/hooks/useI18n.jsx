import { useState, useCallback, createContext, useContext, useMemo } from 'react';
import ptBR from '../locales/pt-BR.js';
import enUS from '../locales/en-US.js';
import { getLocale, saveLocale } from '../utils/storage.js';

export const LOCALES_DISPONIVEIS = [
  { code: 'pt-BR', label: 'Português', nativo: 'Português', flag: '🇧🇷' },
  { code: 'en-US', label: 'English', nativo: 'English', flag: '🇺🇸' },
];

const DICTIONARIES = Object.freeze({
  'pt-BR': ptBR,
  'en-US': enUS,
});

const I18nContext = createContext(null);

function interpolate(value, params = {}) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => (params[key] ?? `{${key}}`));
}

/**
 * Sobrepõe somente os campos traduzidos do conteúdo administrável.
 * O documento PT-BR permanece como fonte base e i18n.<locale> é opcional.
 */
export function localizeRecord(record, locale) {
  if (!record || typeof record !== 'object' || locale === 'pt-BR') return record;
  const localized = record?.i18n?.[locale];
  if (!localized || typeof localized !== 'object') return record;
  return { ...record, ...localized, i18n: record.i18n };
}

export function I18nProvider({ children }) {
  const [locale, setLocaleRaw] = useState(() => getLocale() || 'pt-BR');

  const setLocale = useCallback((code) => {
    const next = DICTIONARIES[code] ? code : 'pt-BR';
    saveLocale(next);
    setLocaleRaw(next);
  }, []);

  const t = useCallback((key, params) => {
    const selected = DICTIONARIES[locale] || ptBR;
    const value = selected[key] ?? ptBR[key] ?? key;
    if (typeof value === 'function') return value(params);
    return interpolate(value, params);
  }, [locale]);

  const content = useCallback((record, field, fallback = '') => {
    const localized = localizeRecord(record, locale);
    const value = localized?.[field];
    return value ?? record?.[field] ?? fallback;
  }, [locale]);

  const value = useMemo(() => ({
    t,
    content,
    locale,
    setLocale,
    carregando: false,
    erro: null,
    LOCALES_DISPONIVEIS,
  }), [t, content, locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n deve ser usado dentro de <I18nProvider>');
  return ctx;
}

export function LocaleSwitcher({ style }) {
  const { locale, setLocale, LOCALES_DISPONIVEIS } = useI18n();
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', ...style }}>
      {LOCALES_DISPONIVEIS.map(loc => (
        <button
          key={loc.code}
          onClick={() => setLocale(loc.code)}
          title={loc.label}
          aria-label={loc.label}
          style={{
            background: locale === loc.code ? 'rgba(200,168,74,0.18)' : 'transparent',
            border: locale === loc.code ? '1.5px solid rgba(200,168,74,0.5)' : '1.5px solid rgba(200,168,74,0.2)',
            borderRadius: 6,
            padding: '3px 8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            lineHeight: 1,
            transition: 'all 0.15s',
          }}
        >
          {loc.flag}
        </button>
      ))}
    </div>
  );
}
