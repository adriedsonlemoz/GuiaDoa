import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { GameSectionTitle, GameTabs } from '../shared/GameChrome.jsx';
import { ATTRS_BASE, ATTRS_ELEM, fmtDragaoValor } from './dragaoCompareConfig.js';
import DragonLevelNavigator from './ui/DragonLevelNavigator.jsx';

const LEVEL_KEY = id => `guiadoa_dragao_nivel_${id}`;
function getSavedLevel(id) {
  try { return Math.max(0, Number(localStorage.getItem(LEVEL_KEY(id))) || 0); } catch { return 0; }
}

const SkillModal = ({ skill, onClose }) => {
  const { t } = useI18n();
  useEffect(() => {
    if (!skill || typeof document === 'undefined') return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [skill]);
  if (!skill) return null;
  const modal = (
    <div className="game-modal-backdrop dragon-skill-modal-backdrop" onClick={onClose} role="presentation" style={{ zIndex:9500 }}>
      <section className="game-modal-sheet dragon-skill-modal-sheet" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label={skill.nome}>
        <div className="game-modal-heading">
          {skill.imagem ? <img src={skill.imagem} alt="" style={{ width:54, height:54, objectFit:'cover', borderRadius:6, border:'1px solid #b69b63', flexShrink:0 }} /> : <div style={{ width:54, height:54, display:'grid', placeItems:'center', fontSize:24, border:'1px solid #b69b63', borderRadius:6, flexShrink:0 }}>✦</div>}
          <div style={{ flex:1, minWidth:0 }}>
            <h2 style={{ margin:0, fontSize:'1rem' }}>{skill.nome}</h2>
            <div style={{ opacity:.82, fontSize:'.72rem', marginTop:2 }}>{skill.tipo === 'comum' ? t('dragons.skill_type_common') : t('dragons.skill_type_battle')}</div>
          </div>
          <button type="button" className="game-modal-close" onClick={onClose} aria-label={t('common.close') || 'Fechar'}>✕</button>
        </div>
        <div className="dragon-skill-modal-content">{skill.descricao || t('dragons.skill_pending')}</div>
      </section>
    </div>
  );
  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};

const AttributeTable = ({ snapshot, locale, t }) => {
  const level = snapshot?.nivel ?? 0;
  const rows = level >= 51 ? [...ATTRS_BASE, ...ATTRS_ELEM] : ATTRS_BASE;
  return (
    <div className="game-info-table" style={{ marginTop:10 }}>
      {rows.map(attr => (
        <div className="game-info-table-row" key={attr.key}>
          <span>{attr.icon} {t(attr.labelKey)}</span>
          <strong>{fmtDragaoValor(snapshot?.[attr.key] ?? 0, locale)}</strong>
        </div>
      ))}
    </div>
  );
};

const DragaoDetalhe = ({ dragaoId, setRoute }) => {
  const { dragoes } = useGameData();
  const { t, content, locale } = useI18n();
  const dragao = dragoes.find(d => d.id === dragaoId) || null;
  const [aba, setAba] = useState('atributos');
  const [skill, setSkill] = useState(null);
  const [meuNivel, setMeuNivel] = useState(() => getSavedLevel(dragaoId));
  const niveis = useMemo(() => (dragao?.niveis || []).slice().sort((a,b)=>a.nivel-b.nivel), [dragao]);
  const [nivelConsulta, setNivelConsulta] = useState(null);

  useEffect(() => {
    if (!niveis.length) {
      if (nivelConsulta != null) setNivelConsulta(null);
      return;
    }
    if (!niveis.some(n => Number(n.nivel) === Number(nivelConsulta))) setNivelConsulta(niveis[0].nivel);
  }, [niveis, nivelConsulta]);
  useEffect(() => {
    try { localStorage.setItem(LEVEL_KEY(dragaoId), String(meuNivel)); } catch { /* local only */ }
  }, [dragaoId, meuNivel]);

  if (!dragao) return <div className="game-panel" style={{ padding:28, textAlign:'center' }}>🐉<div>{t('dragons.not_found')}</div></div>;

  const snapshot = niveis.find(n => n.nivel === nivelConsulta) || null;
  const habilidades = Array.isArray(dragao.habilidades) ? dragao.habilidades : [];
  const batalha = habilidades.filter(h => h.tipo !== 'comum');
  const comuns = habilidades.filter(h => h.tipo === 'comum');
  const alimentos = Array.isArray(dragao.itensAlimentacao) ? dragao.itensAlimentacao : [];
  const obt = dragao.obtencao || {};
  const obtLocale = locale !== 'pt-BR' ? obt?.i18n?.[locale] || {} : {};
  const obtResumo = obtLocale.resumo || obt.resumo || '';
  const captura = obt.captura || null;
  const captureItemName = captura ? ((locale !== 'pt-BR' ? captura.item?.i18n?.[locale]?.nome : '') || captura.item?.nome || '') : '';
  const captureFieldName = captura ? ((locale !== 'pt-BR' ? captura.campo?.i18n?.[locale]?.nome : '') || captura.campo?.nome || '') : '';

  const abrirSavana = () => {
    try { sessionStorage.setItem('guiadoa_open_field', 'savana'); } catch { /* navigation still works */ }
    setRoute?.('campanha');
  };

  const abrirTutorialCaptura = () => {
    try { sessionStorage.setItem('guiadoa_open_tip', 'tutorial-capturar-dragoes'); } catch { /* navigation still works */ }
    setRoute?.('dicas');
  };

  const abrirCampoCaptura = () => {
    if (!captura?.campo?.subtipo) return;
    try { sessionStorage.setItem('guiadoa_open_field', captura.campo.subtipo); } catch { /* navigation still works */ }
    setRoute?.('campanha');
  };

  return (
    <div style={{ maxWidth:620, margin:'0 auto', paddingBottom:24, animation:'reveal-up .3s ease both' }}>
      <section className="game-panel dragon-detail-hero-panel">
        <div className="dragon-detail-hero">
          <div className="dragon-detail-portrait-wrap">
            {dragao.imagem ? <img className="dragon-detail-portrait" src={dragao.imagem} alt={content(dragao,'nome')} /> : <div className="dragon-detail-portrait dragon-detail-portrait-fallback">🐉</div>}
          </div>
          <div className="dragon-detail-identity">
            <div className="dragon-detail-name">{content(dragao,'nome')}</div>
            <div className="dragon-detail-element">{content(dragao,'elemento') || t('dragons.dragon_label')}</div>
            <div className="dragon-my-level">
              <span>{t('dragons.my_level')}</span>
              <button type="button" className="dragon-my-level-button" onClick={()=>setMeuNivel(v=>Math.max(0,v-1))}>−</button>
              <strong>{t('common.level_short')}{meuNivel}</strong>
              <button type="button" className="dragon-my-level-button" onClick={()=>setMeuNivel(v=>Math.min(90,v+1))}>+</button>
            </div>
          </div>
        </div>
      </section>

      <GameTabs tabs={[
        { id:'atributos', label:t('dragons.attributes_tab') },
        { id:'habilidades', label:t('dragons.skills') },
        { id:'evoluir', label:t('dragons.level_up_tab') },
        { id:'obtencao', label:t('dragons.how_to_get') },
      ]} value={aba} onChange={setAba} />

      {aba === 'atributos' && (
        <section className="game-panel" style={{ marginTop:8 }}>
          <GameSectionTitle>{t('dragons.known_attributes')}</GameSectionTitle>
          <p className="game-list-copy dragon-confirmed-help">{t('dragons.confirmed_levels_help')}</p>
          {niveis.length ? (
            <div className="dragon-attributes-body">
              <DragonLevelNavigator levels={niveis.map(n=>n.nivel)} value={nivelConsulta} onChange={setNivelConsulta} label={t('dragons.attributes_at_level')} />
              {snapshot ? <><AttributeTable snapshot={snapshot} locale={locale} t={t} />{snapshot.nivel < 51 ? <p className="game-list-copy" style={{ marginTop:8 }}>{t('dragons.elemental_from_51')}</p> : null}</> : <div style={{ padding:24, textAlign:'center' }}>{t('dragons.attributes_unavailable')}</div>}
            </div>
          ) : <div style={{ padding:24, textAlign:'center' }}>{t('dragons.attributes_unavailable')}</div>}
        </section>
      )}

      {aba === 'habilidades' && (
        <div style={{ marginTop:8, display:'grid', gap:8 }}>
          <section className="game-panel">
            <GameSectionTitle>{t('dragons.battle_skills')}</GameSectionTitle>
            {batalha.length ? batalha.map(h => <button type="button" key={h.id || h.nome} className="game-list-row" onClick={()=>setSkill(h)} style={{ width:'100%', textAlign:'left', borderLeft:0, borderRight:0, borderTop:0, background:'transparent' }}><div className="game-thumb" style={{ display:'grid', placeItems:'center' }}>{h.imagem ? <img src={h.imagem} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : '✦'}</div><div style={{ flex:1 }}><div className="game-list-name">{h.nome}</div><div className="game-list-copy">{h.descricao || t('dragons.skill_pending')}</div></div><strong>›</strong></button>) : <div style={{ padding:22, textAlign:'center', color:'#806d4d' }}>{t('dragons.no_skills')}</div>}
          </section>
          {comuns.length ? <section className="game-panel"><GameSectionTitle>{t('dragons.common_skills')}</GameSectionTitle>{comuns.map(h => <button type="button" key={h.id || h.nome} className="game-list-row" onClick={()=>setSkill(h)} style={{ width:'100%', textAlign:'left', borderLeft:0, borderRight:0, borderTop:0, background:'transparent' }}><div className="game-thumb" style={{ display:'grid', placeItems:'center', overflow:'hidden' }}>{h.imagem ? <img src={h.imagem} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : '◇'}</div><div style={{ flex:1 }}><div className="game-list-name">{h.nome}</div><div className="game-list-copy">{h.descricao || t('dragons.skill_pending')}</div></div><strong>›</strong></button>)}</section> : null}
        </div>
      )}

      {aba === 'evoluir' && (
        <section className="game-panel" style={{ marginTop:8 }}>
          <GameSectionTitle>{t('dragons.level_up_title')}</GameSectionTitle>
          <div style={{ padding:14 }}>
            <p style={{ margin:'0 0 12px', lineHeight:1.55, color:'#574f40' }}>{t('dragons.level_up_help')}</p>
            <div style={{ display:'grid', gap:8 }}>
              {alimentos.map(food => {
                const localized = locale !== 'pt-BR' ? food?.i18n?.[locale] || {} : {};
                const foodName = localized.nome || food.nome || '';
                const foodDesc = localized.descricao || food.descricao || '';
                return (
                  <div className="game-list-row" key={food.id || foodName} style={{ border:'1px solid #c7af78', borderRadius:7, background:'rgba(255,250,232,.72)' }}>
                    <div className="game-thumb" style={{ display:'grid', placeItems:'center', overflow:'hidden' }}>
                      {food.imagem ? <img src={food.imagem} alt={foodName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🍖'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="game-list-name">{foodName}</div>
                      <div className="game-list-copy">{foodDesc}</div>
                    </div>
                    <strong style={{ color:'#2f675e', whiteSpace:'nowrap' }}>+{Number(food.xp || 0).toLocaleString(locale)} XP</strong>
                  </div>
                );
              })}
            </div>
            <p className="game-list-copy" style={{ marginTop:12 }}>{t('dragons.level_xp_pending')}</p>
            {setRoute ? <button type="button" className="game-action-button" style={{ marginTop:10, width:'100%' }} onClick={abrirSavana}>🗺️ {t('dragons.open_savanna')}</button> : null}
          </div>
        </section>
      )}

      {aba === 'obtencao' && (
        <section className="game-panel" style={{ marginTop:8 }}>
          <GameSectionTitle>{t('dragons.how_to_get')}</GameSectionTitle>
          <div style={{ padding:14 }}>
            <div style={{ fontWeight:900, color:'#334d48', marginBottom:7 }}>
              {obt.tipo === 'fragmentos' ? `🧩 ${t('dragons.obtain_fragments')}` : obt.tipo === 'recompensa' ? `🎁 ${t('dragons.obtain_reward')}` : obt.tipo === 'recompensa_ou_captura' ? `🎁🐉 ${t('dragons.obtain_reward_or_capture')}` : obt.tipo === 'inicial' ? `🏰 ${t('dragons.obtain_initial')}` : `🐉 ${t('dragons.obtain_capture')}`}
            </div>
            <p style={{ margin:0, lineHeight:1.55, color:'#574f40' }}>{obtResumo || t('dragons.capture_pending')}</p>
            {obt.dia ? <div className="game-info-table" style={{ marginTop:12 }}><div className="game-info-table-row"><span>{t('common.day')}</span><strong>{obt.dia}</strong></div></div> : null}

            {captura ? (
              <>
                <div className="game-list-row" style={{ marginTop:12, border:'1px solid #b99b62', borderRadius:7, background:'rgba(255,250,232,.68)' }}>
                  <div className="game-thumb" style={{ display:'grid', placeItems:'center', overflow:'hidden' }}>
                    {captura.item?.imagem ? <img src={captura.item.imagem} alt={captureItemName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '◆'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div className="game-list-copy">{t('dragons.required_item')}</div>
                    <div className="game-list-name">{captura.quantidade || 100} × {captureItemName}</div>
                  </div>
                </div>
                <div className="game-info-table" style={{ marginTop:12 }}>
                  <div className="game-info-table-row"><span>{t('dragons.source')}</span><strong>{captureFieldName}</strong></div>
                  <div className="game-info-table-row"><span>{t('dragons.field_levels')}</span><strong>{captura.nivelMin ?? '?'}–{captura.nivelMax ?? '?'}</strong></div>
                  <div className="game-info-table-row"><span>{t('dragons.required_quantity')}</span><strong>{captura.quantidade || 100}</strong></div>
                </div>
                {setRoute ? (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
                    <button type="button" className="game-action-button" onClick={abrirTutorialCaptura}>📘 {t('dragons.open_capture_tutorial')}</button>
                    <button type="button" className="game-action-button" onClick={abrirCampoCaptura}>🗺️ {t('dragons.open_field')}</button>
                  </div>
                ) : null}
              </>
            ) : obt.fonte ? (
              <div className="game-info-table" style={{ marginTop:12 }}>
                <div className="game-info-table-row"><span>{t('dragons.source')}</span><strong>{obt.fonte.nome || obt.fonte.slug}</strong></div>
                {(obt.fonte.nivelMin != null || obt.fonte.nivelMax != null) ? <div className="game-info-table-row"><span>{t('dragons.field_levels')}</span><strong>{obt.fonte.nivelMin ?? '?'}–{obt.fonte.nivelMax ?? '?'}</strong></div> : null}
              </div>
            ) : null}
          </div>
        </section>
      )}

      {setRoute ? <button type="button" className="game-action-button" style={{ marginTop:10 }} onClick={()=>setRoute('dragoes')}>← {t('common.back')}</button> : null}
      <SkillModal skill={skill} onClose={()=>setSkill(null)} />
    </div>
  );
};

export default DragaoDetalhe;
