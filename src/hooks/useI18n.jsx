import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import ptBR from '../locales/pt-BR.js';
import { getLocale, saveLocale } from '../utils/storage.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const LOCALES_DISPONIVEIS = [
  { code: 'pt-BR', label: 'Português', nativo: 'Português', flag: '🇧🇷' },
  { code: 'en-US', label: 'English',   nativo: 'English',   flag: '🇺🇸' },
];

// ─── Context ──────────────────────────────────────────────────────────────────
const I18nContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function I18nProvider({ children }) {
  const [locale,     setLocaleRaw]  = useState(() => getLocale() || 'pt-BR');
  const [traducoes,  setTraducoes]  = useState({});
  const [carregando, setCarregando] = useState(false);
  const [erro,       setErro]       = useState(null);

  // Carrega traduções do backend quando o locale muda
  useEffect(() => {
    if (locale === 'pt-BR') {
      setTraducoes({});   // PT-BR usa o fallback local direto
      return;
    }
    setCarregando(true);
    setErro(null);
    fetch(`${API}/api/traducoes?locale=${locale}`)
      .then(r => r.json())
      .then(data => {
        setTraducoes(data);
        setCarregando(false);
      })
      .catch(e => {
        console.warn('[i18n] Falha ao carregar traduções:', e.message);
        setErro(e.message);
        setCarregando(false);
        // Em caso de falha, usa PT-BR como fallback silencioso
        setTraducoes({});
      });
  }, [locale]);

  const setLocale = useCallback((code) => {
    saveLocale(code);
    setLocaleRaw(code);
  }, []);

  /**
   * t(chave) — retorna tradução ou fallback PT-BR
   * t('home.botao.torneios') → 'Tournaments' (en-US) ou 'Torneios' (pt-BR)
   */
  const t = useCallback((chave) => {
    if (locale !== 'pt-BR' && traducoes[chave]) return traducoes[chave];
    return ptBR[chave] ?? chave;   // fallback: PT-BR ou a própria chave
  }, [locale, traducoes]);

  return (
    <I18nContext.Provider value={{ t, locale, setLocale, carregando, erro, LOCALES_DISPONIVEIS }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n deve ser usado dentro de <I18nProvider>');
  return ctx;
}

// ─── Componente de troca de idioma (mini widget) ──────────────────────────────
export function LocaleSwitcher({ style }) {
  const { locale, setLocale, carregando, LOCALES_DISPONIVEIS } = useI18n();

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', ...style }}>
      {LOCALES_DISPONIVEIS.map(loc => (
        <button
          key={loc.code}
          onClick={() => setLocale(loc.code)}
          title={loc.label}
          style={{
            background: locale === loc.code ? 'rgba(200,168,74,0.18)' : 'transparent',
            border: locale === loc.code ? '1.5px solid rgba(200,168,74,0.5)' : '1.5px solid rgba(200,168,74,0.2)',
            borderRadius: 6,
            padding: '3px 8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            lineHeight: 1,
            opacity: carregando ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
        >
          {loc.flag}
        </button>
      ))}
    </div>
  );
}
