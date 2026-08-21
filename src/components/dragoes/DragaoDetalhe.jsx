import React, { useEffect, useMemo, useState } from 'react';
import { useGameData } from '../../data/GameDataContext.jsx';
import { useI18n } from '../../hooks/useI18n.jsx';
import { GameSectionTitle, GameTabs } from '../shared/GameChrome.jsx';
import { ATTRS_BASE, ATTRS_ELEM, fmtDragaoValor } from './dragaoCompareConfig.js';

const LEVEL_KEY = id => `guiadoa_dragao_nivel_${id}`;
const ALL_ZERO = Object.fromEntries([...ATTRS_BASE, ...ATTRS_ELEM].map(a => [a.key, 0]));

function getSavedLevel(id) {
  try { return Math.max(0, Number(localStorage.getItem(LEVEL_KEY(id))) || 0); } catch { return 0; }
}

const SkillModal = ({ skill, onClose }) => {
  const { t } = useI18n();
  if (!skill) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(22,29,27,.66)', display:'flex', alignItems:'flex-end', justifyContent:'center', padding:12 }}>
      <div onClick={e=>e.stopPropagation()} className="game-panel" style={{ width:'min(560px,100%)', maxHeight:'78vh', overflowY:'auto', padding:0 }}>
        <div style={{ background:'linear-gradient(180deg,#3E625E,#294946)', color:'#fff6dc', padding:'12px 14px', display:'flex', gap:10, alignItems:'center' }}>
          {skill.imagem ? <img src={skill.imagem} alt="" style={{ width:54, height:54, objectFit:'cover', borderRadius:6, border:'1px solid #b69b63' }} /> : <div style={{ width:54, height:54, display:'grid', placeItems:'center', fontSize:24, border:'1px solid #b69b63', borderRadius:6 }}>✦</div>}
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:900, fontSize:'1rem' }}>{skill.nome}</div>
            <div style={{ opacity:.72, fontSize:'.72rem', marginTop:2 }}>{skill.tipo === 'comum' ? t('dragons.skill_type_common') : t('dragons.skill_type_battle')}</div>
          </div>
          <button type="button" className="game-action-button" onClick={onClose} style={{ width:36, minWidth:36, padding:6 }}>✕</button>
        </div>
        <div style={{ padding:16, color:'#3f493f', lineHeight:1.6, whiteSpace:'pre-wrap' }}>
          {skill.descricao || t('dragons.skill_pending')}
        </div>
      </div>
    </div>
  );
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
    if (nivelConsulta == null && niveis.length) setNivelConsulta(niveis[0].nivel);
  }, [niveis, nivelConsulta]);
  useEffect(() => {
    try { localStorage.setItem(LEVEL_KEY(dragaoId), String(meuNivel)); } catch { /* local only */ }
  }, [dragaoId, meuNivel]);

  if (!dragao) return <div className="game-panel" style={{ padding:28, textAlign:'center' }}>🐉<div>{t('dragons.not_found')}</div></div>;

  const snapshot = nivelConsulta === 0 ? { nivel:0, ...ALL_ZERO } : niveis.find(n => n.nivel === nivelConsulta) || null;
  const habilidades = Array.isArray(dragao.habilidades) ? dragao.habilidades : [];
  const batalha = habilidades.filter(h => h.tipo !== 'comum');
  const comuns = habilidades.filter(h => h.tipo === 'comum');
  const obt = dragao.obtencao || {};
  const obtLocale = locale !== 'pt-BR' ? obt?.i18n?.[locale] || {} : {};
  const obtResumo = obtLocale.resumo || obt.resumo || '';
  const captura = obt.captura || null;
  const captureItemName = captura ? ((locale !== 'pt-BR' ? captura.item?.i18n?.[locale]?.nome : '') || captura.item?.nome || '') : '';
  const captureFieldName = captura ? ((locale !== 'pt-BR' ? captura.campo?.i18n?.[locale]?.nome : '') || captura.campo?.nome || '') : '';

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
      <section className="game-panel" style={{ overflow:'hidden', padding:0 }}>
        <div style={{ padding:'14px 14px 12px', display:'flex', gap:13, alignItems:'center', background:'linear-gradient(180deg,#365B57,#294946)', color:'#fff6dc' }}>
          {dragao.imagem ? <img src={dragao.imagem} alt={content(dragao,'nome')} style={{ width:84, height:80, objectFit:'cover', borderRadius:7, border:'1.5px solid #b99b62', background:'#263b39' }} /> : <div style={{ width:84, height:80, display:'grid', placeItems:'center', fontSize:42 }}>🐉</div>}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:900, fontSize:'1.08rem' }}>{content(dragao,'nome')}</div>
            <div style={{ opacity:.72, fontSize:'.75rem', marginTop:2 }}>{content(dragao,'elemento') || t('dragons.dragon_label')}</div>
            <div style={{ marginTop:9, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:'.7rem', fontWeight:800, opacity:.8 }}>{t('dragons.my_level')}</span>
              <button type="button" className="game-action-button" style={{ padding:'4px 10px' }} onClick={()=>setMeuNivel(v=>Math.max(0,v-1))}>−</button>
              <strong style={{ minWidth:34, textAlign:'center' }}>{t('common.level_short')}{meuNivel}</strong>
              <button type="button" className="game-action-button" style={{ padding:'4px 10px' }} onClick={()=>setMeuNivel(v=>Math.min(90,v+1))}>+</button>
            </div>
          </div>
        </div>
      </section>

      <GameTabs tabs={[
        { id:'atributos', label:t('dragons.attributes_tab') },
        { id:'habilidades', label:t('dragons.skills') },
        { id:'obtencao', label:t('dragons.how_to_get') },
      ]} value={aba} onChange={setAba} />

      {aba === 'atributos' && (
        <section className="game-panel" style={{ marginTop:8 }}>
          <GameSectionTitle>{t('dragons.known_attributes')}</GameSectionTitle>
          <p className="game-list-copy" style={{ margin:'8px 12px' }}>{t('dragons.sparse_levels_help')}</p>
          <div style={{ display:'flex', gap:6, overflowX:'auto', padding:'0 12px 4px' }}>
            <button type="button" className={`game-tab ${nivelConsulta === 0 ? 'is-active':''}`} onClick={()=>setNivelConsulta(0)}>{t('common.level_short')}0</button>
            {niveis.map(n => <button type="button" key={n.nivel} className={`game-tab ${nivelConsulta === n.nivel ? 'is-active':''}`} onClick={()=>setNivelConsulta(n.nivel)}>{t('common.level_short')}{n.nivel}</button>)}
          </div>
          {snapshot ? <div style={{ padding:'0 12px 12px' }}><AttributeTable snapshot={snapshot} locale={locale} t={t} />{snapshot.nivel < 51 ? <p className="game-list-copy" style={{ marginTop:8 }}>{t('dragons.elemental_from_51')}</p> : null}</div> : <div style={{ padding:24, textAlign:'center' }}>{t('dragons.attributes_unavailable')}</div>}
        </section>
      )}

      {aba === 'habilidades' && (
        <div style={{ marginTop:8, display:'grid', gap:8 }}>
          <section className="game-panel">
            <GameSectionTitle>{t('dragons.battle_skills')}</GameSectionTitle>
            {batalha.length ? batalha.map(h => <button type="button" key={h.id || h.nome} className="game-list-row" onClick={()=>setSkill(h)} style={{ width:'100%', textAlign:'left', borderLeft:0, borderRight:0, borderTop:0, background:'transparent' }}><div className="game-thumb" style={{ display:'grid', placeItems:'center' }}>{h.imagem ? <img src={h.imagem} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : '✦'}</div><div style={{ flex:1 }}><div className="game-list-name">{h.nome}</div><div className="game-list-copy">{h.descricao || t('dragons.skill_pending')}</div></div><strong>›</strong></button>) : <div style={{ padding:22, textAlign:'center', color:'#806d4d' }}>{t('dragons.no_skills')}</div>}
          </section>
          {comuns.length ? <section className="game-panel"><GameSectionTitle>{t('dragons.common_skills')}</GameSectionTitle>{comuns.map(h => <button type="button" key={h.id || h.nome} className="game-list-row" onClick={()=>setSkill(h)} style={{ width:'100%', textAlign:'left', borderLeft:0, borderRight:0, borderTop:0, background:'transparent' }}><div className="game-thumb" style={{ display:'grid', placeItems:'center' }}>◇</div><div style={{ flex:1 }}><div className="game-list-name">{h.nome}</div><div className="game-list-copy">{h.descricao || t('dragons.skill_pending')}</div></div><strong>›</strong></button>)}</section> : null}
        </div>
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
