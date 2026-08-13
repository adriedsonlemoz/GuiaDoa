import React, { useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { C } from '../../theme.js';
import { useI18n } from '../../hooks/useI18n.jsx';


const ATTRS_BASE = [
  { key:'vida',           label:'Vida', labelKey:'common.health',          icon:'❤️',  cor:C.HEALTH  },
  { key:'defesa',         label:'Defesa', labelKey:'common.defense',        icon:'🛡️',  cor:C.DEFENSE },
  { key:'ataquePerto',    label:'Atq. Perto', labelKey:'troops.attack_near',    icon:'⚔️',  cor:C.ATTACK  },
  { key:'ataqueDistante', label:'Atq. Distante', labelKey:'troops.attack_range', icon:'🏹',  cor:C.POWER   },
  { key:'alcance',        label:'Alcance', labelKey:'common.range',       icon:'🎯',  cor:C.ENERGY  },
  { key:'velocidade',     label:'Velocidade', labelKey:'common.speed',    icon:'⚡',  cor:C.ACCENT  },
];
const ATTRS_ELEM = [
  { key:'ataqueElemental',     label:'Ataque Elem.', labelKey:'dragons.attr.elemental_attack',     icon:'🔥', cor:'#E05C30' },
  { key:'impulsoElemental',    label:'Impulso Elem.', labelKey:'dragons.attr.elemental_boost',    icon:'💥', cor:'#E0803A' },
  { key:'barreiraElemental',   label:'Barreira Elem.', labelKey:'dragons.attr.elemental_barrier',   icon:'🔰', cor:C.DEFENSE },
  { key:'bombardeioElemental', label:'Bombardeio Elem.', labelKey:'dragons.attr.bombardment', icon:'💣', cor:C.ERROR   },
  { key:'confrontoElemental',  label:'Confronto Elem.', labelKey:'dragons.attr.confrontation',  icon:'⚡', cor:C.ACCENT  },
  { key:'bloqueioElemental',   label:'Bloqueio Elem.', labelKey:'dragons.attr.block',   icon:'🛡', cor:C.BLUE    },
  { key:'rupturaElemental',    label:'Ruptura Elem.', labelKey:'dragons.attr.rupture',    icon:'💢', cor:C.POWER   },
];

const fmt = (v, locale='pt-BR') => (v == null || v === 0) ? '0' : v.toLocaleString(locale);
const pct = (v, max) => max > 0 ? Math.min(100, (v / max) * 100) : 0;

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 my-2.5">
    <div className="flex-1 h-px" style={{ background:`linear-gradient(90deg,transparent,${C.BORDER})` }} />
    <span style={{ color:C.ACCENT, fontSize:'0.65rem' }}>◆</span>
    <span className="font-nunito font-bold text-[0.65rem] tracking-widest whitespace-nowrap uppercase" style={{ color:C.TEXT_MUTED }}>{label}</span>
    <span style={{ color:C.ACCENT, fontSize:'0.65rem' }}>◆</span>
    <div className="flex-1 h-px" style={{ background:`linear-gradient(270deg,transparent,${C.BORDER})` }} />
  </div>
);

const TipoBadge = ({ campo }) => {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.58rem] font-nunito font-black tracking-wide leading-tight"
      style={{ background:campo?'#7B1C1C':'#1B5E20', border:`1px solid ${campo?'#A52020':'#2E7D32'}`, color:campo?'#FFCDD2':'#C8E6C9' }}>
      {campo?'🏅':'⚔️'} {campo?t('dragons.field_effect'):t('dragons.battle_effect')}
    </span>
  );
};

const HabilidadeCard = ({ hab, cor, index }) => {
  const { t } = useI18n();
  const [expandido, setExpandido] = useState(false);
  const isCampo = hab.tipo?.toLowerCase().includes('campo');
  const xpPercent = (() => {
    if (!hab.nivelAtual?.xp) return 0;
    const parts = hab.nivelAtual.xp.split('/');
    if (parts.length !== 2) return 0;
    return Math.min(100, (parseFloat(parts[0]) / parseFloat(parts[1])) * 100);
  })();

  return (
    <div onClick={() => setExpandido(v=>!v)} className="rounded-xl overflow-hidden mb-3 cursor-pointer transition-all"
      style={{ border:`1.5px solid ${C.BORDER_SOFT}`, animation:`reveal-up 0.35s ${0.08+index*0.07}s ease both` }}>
      <div className="flex items-center gap-3 px-3.5 py-2.5"
        style={{ background:`linear-gradient(135deg,rgba(62,47,28,0.92) 0%,${cor}55 100%)`, borderBottom:`1px solid ${cor}44` }}>
        <div className="w-11 h-11 shrink-0 flex items-center justify-center text-2xl rounded-xl"
          style={{ background:`linear-gradient(135deg,${cor}33,${cor}66)`, border:`1.5px solid ${cor}88`, boxShadow:`0 2px 8px ${cor}44` }}>
          {hab.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-nunito font-black text-[0.9rem] m-0 leading-tight" style={{ color:'#FFF8EE' }}>
            {hab.nome}
            {hab.nivelAtual?.nivel != null && (
              <span className="text-[0.65rem] font-bold ml-1.5" style={{ color:'rgba(255,248,238,0.5)' }}>Nv.{hab.nivelAtual.nivel}</span>
            )}
          </p>
          {hab.nivelAtual?.xp && (
            <div className="mt-1">
              <span className="font-nunito text-[0.58rem]" style={{ color:'rgba(255,248,238,0.45)' }}>{hab.nivelAtual.xp}</span>
              <div className="h-1 rounded-full overflow-hidden mt-0.5" style={{ background:'rgba(255,255,255,0.15)' }}>
                <div style={{ height:'100%', width:`${xpPercent}%`, background:`linear-gradient(90deg,${cor},#FFD700)` }} />
              </div>
            </div>
          )}
          {hab.nivelAtual?.duracao && (
            <p className="font-nunito font-semibold text-[0.62rem] mt-0.5 m-0" style={{ color:'rgba(255,248,238,0.6)' }}>⏱ {hab.nivelAtual.duracao}</p>
          )}
        </div>
        <span className="text-xl leading-none transition-transform"
          style={{ color:'rgba(255,248,238,0.45)', transform:expandido?'rotate(90deg)':'rotate(0deg)' }}>›</span>
      </div>
      <div className="grid grid-cols-2">
        <div className="p-3" style={{ background:C.BG_CARD, borderRight:`1px solid ${C.BORDER_SOFT}` }}>
          <p className="font-nunito font-black text-[0.68rem] m-0 mb-1.5" style={{ color:C.TEXT_PRIMARY }}>{t('levels.current')}</p>
          {hab.nivelAtual?.defesa && <p className="font-nunito font-bold text-[0.65rem] m-0 mb-1.5" style={{ color:C.DEFENSE }}>🛡 {hab.nivelAtual.defesa}</p>}
          <TipoBadge campo={isCampo} />
          <p className="font-nunito font-semibold text-[0.73rem] leading-relaxed mt-1.5 m-0"
            style={{ color:C.TEXT_SECONDARY, display:expandido?'block':'-webkit-box', WebkitLineClamp:expandido?'unset':4, WebkitBoxOrient:'vertical', overflow:expandido?'visible':'hidden' }}>
            {hab.nivelAtual?.descricao}
          </p>
        </div>
        <div className="p-3 relative" style={{ background:`linear-gradient(180deg,${C.BG_CARD_TOP} 0%,${C.BG_CARD} 100%)` }}>
          <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 text-base" style={{ color:cor, opacity:0.5 }}>›</span>
          <p className="font-nunito font-black text-[0.68rem] m-0 mb-1.5" style={{ color:'#A05820' }}>{t('research.max_level')}</p>
          {hab.nivelMax?.defesa && <p className="font-nunito font-bold text-[0.65rem] m-0 mb-1.5" style={{ color:C.ENERGY }}>🛡 {hab.nivelMax.defesa}</p>}
          <TipoBadge campo={isCampo} />
          <p className="font-nunito font-semibold text-[0.73rem] leading-relaxed mt-1.5 m-0"
            style={{ color:C.TEXT_SECONDARY, display:expandido?'block':'-webkit-box', WebkitLineClamp:expandido?'unset':4, WebkitBoxOrient:'vertical', overflow:expandido?'visible':'hidden' }}>
            {hab.nivelMax?.descricao}
          </p>
        </div>
      </div>
      {!expandido && (
        <div className="text-center py-1.5" style={{ background:'rgba(184,150,90,0.06)', borderTop:`1px solid ${C.BORDER_SOFT}` }}>
          <span className="font-nunito font-bold text-[0.62rem] tracking-widest" style={{ color:C.TEXT_FAINT }}>{t('dragons.view_full').toUpperCase()} ▸</span>
        </div>
      )}
    </div>
  );
};

// ── Atributos por nível (Design 2) ────────────────────────────────────────────
const AtributosSection = ({ niveis, cor }) => {
  const { t, locale } = useI18n();
  const [niv, setNiv] = useState(0);

  if (!niveis || niveis.length === 0) return (
    <div className="py-6 text-center rounded-xl mb-3"
      style={{ border:`1px dashed ${C.BORDER}`, background:C.BG_CARD }}>
      <p className="font-nunito text-sm m-0" style={{ color:C.TEXT_MUTED }}>
        {t('dragons.attributes_unavailable')}<br/>
        <span style={{ fontSize:'0.72rem', fontStyle:'italic' }}>{t('dragons.attributes_unavailable_help')}</span>
      </p>
    </div>
  );

  const atual   = niveis[niv];
  const proximo = niveis[niv + 1];

  const StatRow = ({ attr }) => {
    const max  = Math.max(...niveis.map(n => n[attr.key] || 0));
    const v    = atual[attr.key] || 0;
    const vN   = proximo?.[attr.key] || 0;
    const diff = vN - v;
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:`1px solid rgba(200,168,74,0.1)` }}>
        <span style={{ width:20, textAlign:'center', fontSize:'0.9rem', flexShrink:0 }}>{attr.icon}</span>
        <span style={{ flex:'0 0 98px', fontSize:'0.65rem', fontWeight:700, color:C.TEXT_MUTED, letterSpacing:'0.3px' }}>{attr.labelKey ? t(attr.labelKey) : attr.label}</span>
        <div style={{ flex:1, height:5, background:C.BG_SECONDARY, borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:3, transition:'width 0.4s ease',
            width:`${pct(v, max)}%`, background:`linear-gradient(90deg,${attr.cor}88,${attr.cor})` }} />
        </div>
        <div style={{ width:82, textAlign:'right', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 }}>
          <span style={{ fontSize:'0.78rem', fontWeight:900, color:C.TEXT_PRIMARY, fontFamily:'monospace' }}>{fmt(v, locale)}</span>
          {proximo && diff > 0 && <span style={{ fontSize:'0.6rem', color:C.SUCCESS, fontWeight:800 }}>+{fmt(diff, locale)}</span>}
          {proximo && diff < 0 && <span style={{ fontSize:'0.6rem', color:C.ERROR,   fontWeight:800 }}>{fmt(diff, locale)}</span>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom:4 }}>
      {/* Carrossel de níveis */}
      <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:10, scrollbarWidth:'none', marginBottom:12 }}>
        {niveis.map((n, i) => (
          <button key={i} onClick={() => setNiv(i)} style={{
            flexShrink:0, minWidth:38, height:38, borderRadius:9,
            border:`1.5px solid ${i===niv ? cor : C.BORDER_SOFT}`,
            cursor:'pointer', fontWeight:900, fontFamily:'monospace', fontSize:'0.75rem',
            background: i===niv ? `linear-gradient(135deg,${cor},${cor}CC)` : C.BG_CARD,
            color: i===niv ? '#FFF8EE' : C.TEXT_MUTED,
            transform: i===niv ? 'translateY(-2px)' : 'none',
            boxShadow: i===niv ? `0 3px 10px ${cor}44` : 'none',
            transition:'all 0.15s',
          }}>{n.nivel}</button>
        ))}
      </div>

      {/* Pill de info do nível */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        background:`${cor}0F`, border:`1px solid ${cor}30`, borderRadius:10, padding:'7px 12px', marginBottom:12 }}>
        <span style={{ fontSize:'0.72rem', fontWeight:900, color:cor }}>◆ {t('common.level')} {atual.nivel}</span>
        <span style={{ fontSize:'0.65rem', color:C.TEXT_MUTED }}>
          {atual.xpNecessaria > 0 ? `${fmt(atual.xpNecessaria, locale)} XP` : t('dragons.base_level')}
        </span>
        {proximo
          ? <span style={{ fontSize:'0.65rem', color:C.SUCCESS, fontWeight:800 }}>→ {t('common.level')} {proximo.nivel}</span>
          : <span style={{ fontSize:'0.65rem', color:C.TEXT_FAINT }}>{t('research.max_level')}</span>}
      </div>

      {/* Atributos Base */}
      <div style={{ background:C.BG_CARD, border:`1px solid ${C.BORDER_SOFT}`,
        borderRadius:12, padding:'10px 14px', marginBottom:10 }}>
        <div style={{ fontSize:'0.55rem', letterSpacing:'2.5px', color:C.ACCENT_DEEP,
          textTransform:'uppercase', fontWeight:900, marginBottom:6 }}>⚔ {t('dragons.base_attributes')}</div>
        {ATTRS_BASE.map(a => <StatRow key={a.key} attr={a} />)}
      </div>

      {/* Atributos Elementais */}
      <div style={{ background:C.BG_CARD, border:'1px solid rgba(139,107,174,0.3)',
        borderRadius:12, padding:'10px 14px', marginBottom:4 }}>
        <div style={{ fontSize:'0.55rem', letterSpacing:'2.5px', color:'#8B6BAE',
          textTransform:'uppercase', fontWeight:900, marginBottom:6 }}>✨ {t('dragons.elemental_attributes')}</div>
        {ATTRS_ELEM.map(a => <StatRow key={a.key} attr={a} />)}
      </div>
    </div>
  );
};

// ── DragaoDetalhe ─────────────────────────────────────────────────────────────
const DragaoDetalhe = ({ dragaoId, setRoute }) => {
  const { t, content } = useI18n();
  const { dragoes } = useGameData();
  const dragao = dragoes.find(d => d.id === dragaoId) || null;
  const niveis = dragao?.niveis || [];

  if (!dragao) return (
    <div className="text-center py-12 px-4">
      <p className="text-5xl mb-3 m-0">🐉</p>
      <p className="font-nunito font-black text-base m-0 mb-2" style={{ color:C.ERROR }}>{t('dragons.not_found')}</p>
      <button className="btn-ghost" onClick={() => setRoute?.('dragoes')}>← {t('common.back')}</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto pb-4" style={{ animation:'reveal-up 0.4s ease both' }}>

      {/* Hero (original) */}
      <div className="rounded-2xl overflow-hidden mb-3"
        style={{ border:`2px solid ${dragao.cor}`, boxShadow:`0 4px 20px ${dragao.cor}30` }}>
        <div className="flex items-center gap-4 px-4 py-4 relative"
          style={{ background:`linear-gradient(135deg, rgba(49,72,74,0.95) 0%, ${dragao.cor}55 100%)` }}>
          <div className="w-20 h-20 shrink-0 flex items-center justify-center text-5xl rounded-2xl"
            style={{ background:`linear-gradient(135deg,${dragao.cor}33,${dragao.cor}66)`,
              border:`2.5px solid ${dragao.cor}88`, boxShadow:`0 4px 16px ${dragao.cor}55` }}>
            {dragao.emojiDragao}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-cinzel font-bold text-xl m-0 leading-tight"
                style={{ color:'#FFF8EE', textShadow:`0 2px 8px ${dragao.cor}88` }}>{content(dragao, 'nome')}</p>
              <span className="font-nunito font-black text-[0.62rem] px-2 py-0.5 rounded-full"
                style={{ background:`${dragao.cor}44`, border:`1px solid ${dragao.cor}88`, color:'#FFF8EE' }}>
                {content(dragao, 'elemento')}
              </span>
            </div>
            <p className="font-nunito font-semibold text-[0.75rem] leading-snug m-0"
              style={{ color:'rgba(255,248,238,0.7)' }}>{content(dragao, 'descricao')}</p>
            <button
              className="mt-2 font-nunito font-black text-[0.65rem] px-3 py-1 rounded-md tracking-widest uppercase border-none cursor-pointer"
              style={{ background:`${dragao.cor}44`, border:`1.5px solid ${dragao.cor}88`, color:'#FFF8EE' }}
              onClick={() => setRoute?.(`dragao_tracker_${dragao.id}`)}>
              📊 {t('dragons.tracker')}
            </button>
          </div>
        </div>
      </div>

      {/* Atributos por nível */}
      <SectionDivider label={t('dragons.attributes_by_level').toUpperCase()} />
      <AtributosSection niveis={niveis} cor={dragao.cor} />

      {/* Habilidades (original, abaixo de tudo) */}
      <SectionDivider label={`${t('dragons.skills').toUpperCase()} — ${content(dragao, 'nome').toUpperCase()}`} />
      {dragao.habilidades?.length > 0 ? (
        dragao.habilidades.map((hab, i) => (
          <HabilidadeCard key={hab.id || i} hab={hab} cor={dragao.cor} index={i} />
        ))
      ) : (
        <div className="py-8 text-center rounded-xl" style={{ border:`1px dashed ${C.BORDER}`, background:C.BG_CARD }}>
          <p className="font-nunito italic text-sm m-0" style={{ color:C.TEXT_MUTED }}>
            {t('dragons.no_skills')}
          </p>
        </div>
      )}
    </div>
  );
};

export default DragaoDetalhe;
