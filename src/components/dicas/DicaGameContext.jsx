import React, { useMemo } from 'react';
import { C } from '../../theme.js';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { buildDicaGameVariables } from './dicaGameUtils.js';
import { LIMITES } from '../ilhas/constants.js';

const MODULES = {
  ilhas: { icon: '🏝️', route: 'ilhas', labelKey: 'islands.title' },
  edificios: { icon: '🏰', route: 'edificios', labelKey: 'buildings.title' },
  tropas: { icon: '⚔️', route: 'tropas_lista', labelKey: 'troops.title' },
  dragoes: { icon: '🐉', route: 'dragoes', labelKey: 'dragons.title' },
  pesquisas: { icon: '🔬', route: 'pesquisas', labelKey: 'research.title' },
  reinos: { icon: '🌍', route: 'home', labelKey: 'profile.realm' },
  itens: { icon: '🎒', route: 'itens', labelKey: 'items.title' },
  niveis: { icon: '📈', route: 'niveis', labelKey: 'levels.title' },
  torneios: { icon: '🏆', route: 'torneios', labelKey: 'home.botao.torneios' },
};

const fmt = (n, locale) => Number(n || 0).toLocaleString(locale);

export default function DicaGameContext({ dica, setRoute }) {
  const { edificios, tropas, dragoes } = useGameData();
  const { t, content, locale } = useI18n();
  const rel = dica.relacionados || {};

  const { capacidadeFonte35: capacidade } = useMemo(() => buildDicaGameVariables(edificios, locale), [edificios, locale]);

  const entidades = useMemo(() => {
    const out = [];
    (rel.tropas || []).forEach(nome => {
      const item = tropas.find(tropa => tropa.nome === nome);
      if (item) out.push({ icon: '⚔️', label: content(item, 'nome'), route: 'tropas_lista' });
    });
    (rel.dragoes || []).forEach(slug => {
      const item = dragoes.find(dragao => (dragao.slug || dragao.id) === slug);
      if (item) out.push({ icon: item.emojiDragao || '🐉', label: content(item, 'nome'), route: `dragao_${slug}` });
    });
    (rel.edificios || []).forEach(slug => {
      const item = edificios.find(edificio => edificio.slug === slug);
      if (item) out.push({ icon: item.icone || '🏰', label: content(item, 'nome'), route: 'edificios' });
    });
    return out.slice(0, 8);
  }, [rel, tropas, dragoes, edificios, content]);

  const modulos = (rel.modulos || []).map(id => ({ id, ...MODULES[id] })).filter(x => x.route);
  if (!modulos.length && !entidades.length && !capacidade) return null;

  return (
    <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
      {capacidade > 0 && dica.slug === 'guia-inicial-construcoes' && (
        <div style={{ borderRadius: 14, padding: '14px 15px', background: `linear-gradient(135deg, ${C.BG_HEADER}, #274d78)`, color: '#fff', boxShadow: '0 6px 18px rgba(28,58,94,.16)' }}>
          <div className="font-cinzel" style={{ fontSize: '.73rem', color: '#e7c96e', letterSpacing: '.06em', textTransform: 'uppercase' }}>{t('tips.live_data')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <div>
              <div className="font-nunito" style={{ fontSize: '.66rem', opacity: .72 }}>{t('tips.fountain_level_35')}</div>
              <div className="font-cinzel" style={{ fontSize: '1.05rem', marginTop: 2 }}>{fmt(capacidade, locale)}</div>
              <div className="font-nunito" style={{ fontSize: '.64rem', opacity: .72 }}>{t('tips.troops_capacity')}</div>
            </div>
            <div>
              <div className="font-nunito" style={{ fontSize: '.66rem', opacity: .72 }}>{t('tips.plan_38_fountains')}</div>
              <div className="font-cinzel" style={{ fontSize: '1.05rem', marginTop: 2 }}>{fmt(capacidade * 38, locale)}</div>
              <div className="font-nunito" style={{ fontSize: '.64rem', opacity: .72 }}>{t('tips.before_bonuses')}</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,.12)' }}>
            <div className="font-nunito" style={{ fontSize:'.67rem', opacity:.82 }}>🏰 {t('tips.main_city_spaces', { count: LIMITES.cidadePrincipal })}</div>
            <div className="font-nunito" style={{ fontSize:'.67rem', opacity:.82 }}>🐉💧 {t('tips.water_dragon_spaces', { count: LIMITES.cidadeAgua })}</div>
          </div>
          <div className="font-nunito" style={{ fontSize: '.64rem', opacity: .66, marginTop: 9 }}>{t('tips.live_data_note')}</div>
        </div>
      )}

      {modulos.length > 0 && (
        <div style={{ padding: '14px', borderRadius: 14, border: `1px solid ${C.BORDER_SOFT}`, background: C.BG_CARD }}>
          <div className="font-cinzel" style={{ fontSize: '.78rem', color: C.TEXT_PRIMARY }}>{t('tips.explore_modules')}</div>
          <div className="font-nunito" style={{ fontSize: '.68rem', color: C.TEXT_MUTED, marginTop: 3 }}>{t('tips.explore_modules_hint')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8, marginTop: 11 }}>
            {modulos.map(item => (
              <button key={item.id} onClick={() => { setRoute?.(item.route); }} style={{ border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 10, background: C.BG_SECONDARY, color: C.TEXT_PRIMARY, padding: '10px 9px', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span className="font-nunito" style={{ fontSize: '.72rem', fontWeight: 800 }}>{t(item.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {entidades.length > 0 && (
        <div style={{ padding: '0 2px' }}>
          <div className="font-nunito" style={{ fontSize: '.66rem', color: C.TEXT_MUTED, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 7 }}>{t('tips.related_data')}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {entidades.map((item, idx) => (
              <button key={`${item.label}-${idx}`} onClick={() => setRoute?.(item.route)} style={{ border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 999, background: C.BG_CARD, color: C.TEXT_SECONDARY, padding: '6px 9px', cursor: 'pointer', fontSize: '.68rem', fontWeight: 700 }}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
