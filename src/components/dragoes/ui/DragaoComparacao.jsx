import React from 'react';
import { C } from '../../../theme.js';
import { useI18n } from '../../../hooks/useI18n.jsx';
import { ATTRS_BASE, ATTRS_ELEM, fmtDragaoValor as fmt } from '../dragaoCompareConfig.js';

const DragaoComparacao = ({ ids, nivelIdx, setNivelIdx, apiDataMap, onRemover, todosDragoes }) => {
  const { t, content, locale } = useI18n();
  const dragoes = ids.map(id => todosDragoes.find(d => d.id === id)).filter(Boolean);
  if (dragoes.length === 0) return null;

  // Calcula o nível máximo disponível entre os dragões selecionados
  const maxNiveis = Math.max(...ids.map(id => (apiDataMap[id]?.niveis?.length || 0)));

  // Valor do atributo de um dragão no nível atual
  const getVal = (id, key) => {
    const niveis = apiDataMap[id]?.niveis;
    if (!niveis || niveis.length === 0) return null;
    const nv = niveis[nivelIdx] || niveis[niveis.length - 1];
    return nv?.[key] ?? 0;
  };

  // Quem tem o maior valor em cada atributo
  const melhor = (key) => {
    let maxVal = -Infinity, melhorId = null;
    ids.forEach(id => {
      const v = getVal(id, key);
      if (v !== null && v > maxVal) { maxVal = v; melhorId = id; }
    });
    return melhorId;
  };

  const temDados = ids.some(id => (apiDataMap[id]?.niveis?.length || 0) > 0);

  return (
    <div style={{
      background:C.BG_CARD, border:`1.5px solid ${C.BORDER}`,
      borderRadius:14, overflow:'hidden', marginBottom:16,
    }}>
      {/* Cabeçalho */}
      <div style={{
        background:`linear-gradient(135deg,#1C3A5E,#2A4C72)`,
        padding:'10px 14px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <span className="font-cinzel font-bold text-sm tracking-wider" style={{ color:'#F8F2E0' }}>
          ⚔️ {t('dragons.comparison_title')}
        </span>
        <span className="font-nunito font-bold text-xs" style={{ color:'rgba(248,242,224,0.5)' }}>
          {t('dragons.count_selected', { count: dragoes.length })}
        </span>
      </div>

      {/* Chips dos dragões selecionados */}
      <div style={{ display:'flex', gap:6, padding:'10px 14px', flexWrap:'wrap', borderBottom:`1px solid ${C.BORDER_SOFT}` }}>
        {dragoes.map(d => (
          <div key={d.id} style={{
            display:'flex', alignItems:'center', gap:6, padding:'5px 10px',
            background:`${d.cor}15`, border:`1.5px solid ${d.cor}44`, borderRadius:20,
          }}>
            <span style={{ fontSize:'1rem' }}>{d.emojiDragao}</span>
            <span className="font-nunito font-bold text-xs" style={{ color:d.cor }}>{content(d, 'nome')}</span>
            <button onClick={() => onRemover(d.id)} style={{
              background:'none', border:'none', cursor:'pointer',
              color:`${d.cor}99`, fontSize:'0.75rem', padding:'0 2px', lineHeight:1,
            }}>✕</button>
          </div>
        ))}
        {ids.length < 3 && (
          <div style={{
            display:'flex', alignItems:'center', gap:4, padding:'5px 10px',
            border:`1.5px dashed ${C.BORDER}`, borderRadius:20,
          }}>
            <span className="font-nunito text-xs" style={{ color:C.TEXT_FAINT }}>{3 - ids.length === 1 ? t('dragons.add_more_one') : t('dragons.add_more_many', { count: 3 - ids.length })}</span>
          </div>
        )}
      </div>

      {!temDados ? (
        <div style={{ padding:'20px', textAlign:'center' }}>
          <p className="font-nunito text-xs italic m-0" style={{ color:C.TEXT_MUTED }}>
            {t('dragons.none_attributes_selected')}<br/>
            <span style={{ fontSize:'0.65rem' }}>{t('dragons.attributes_unavailable_help')}</span>
          </p>
        </div>
      ) : (
        <>
          {/* Seletor de nível */}
          {maxNiveis > 0 && (
            <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.BORDER_SOFT}`,
              display:'flex', alignItems:'center', gap:10 }}>
              <span className="font-nunito font-bold text-xs" style={{ color:C.TEXT_MUTED, whiteSpace:'nowrap' }}>
                {t('common.level')}:
              </span>
              <div style={{ display:'flex', gap:4, overflowX:'auto', scrollbarWidth:'none', flex:1 }}>
                {Array.from({ length: maxNiveis }, (_, i) => {
                  const anyNivel = ids.some(id => (apiDataMap[id]?.niveis?.[i]));
                  if (!anyNivel) return null;
                  const nivelNum = apiDataMap[ids.find(id => apiDataMap[id]?.niveis?.[i])]?.niveis?.[i]?.nivel;
                  return (
                    <button key={i} onClick={() => setNivelIdx(i)} style={{
                      flexShrink:0, minWidth:32, height:30, borderRadius:7, border:'none',
                      cursor:'pointer', fontWeight:900, fontFamily:'monospace', fontSize:'0.7rem',
                      background: i === nivelIdx ? `linear-gradient(135deg,${C.ACCENT},${C.ACCENT_HOVER})` : C.BG_SECONDARY,
                      color: i === nivelIdx ? '#FFF8EE' : C.TEXT_MUTED,
                      transform: i === nivelIdx ? 'translateY(-1px)' : 'none',
                      boxShadow: i === nivelIdx ? `0 2px 8px ${C.ACCENT}44` : 'none',
                      transition:'all 0.12s',
                    }}>{nivelNum ?? i+1}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tabela de atributos */}
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.75rem' }}>
              <thead>
                <tr style={{ background:C.BG_SECONDARY }}>
                  <th style={{ padding:'7px 10px', textAlign:'left', fontSize:'0.58rem',
                    letterSpacing:'1px', color:C.TEXT_MUTED, fontWeight:900, whiteSpace:'nowrap' }}>
                    {t('dragons.attribute_column')}
                  </th>
                  {dragoes.map(d => (
                    <th key={d.id} style={{ padding:'7px 10px', textAlign:'center',
                      fontSize:'0.65rem', color:d.cor, fontWeight:900, whiteSpace:'nowrap' }}>
                      {d.emojiDragao} {String(content(d, 'nome')).split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Separador Base */}
                <tr><td colSpan={dragoes.length + 1} style={{ padding:'4px 10px',
                  fontSize:'0.55rem', fontWeight:900, letterSpacing:'2px', color:C.ACCENT_DEEP,
                  textTransform:'uppercase', background:`${C.ACCENT}08` }}>
                  {t('dragons.base_section')}
                </td></tr>

                {ATTRS_BASE.map((a, i) => {
                  const melhorId = melhor(a.key);
                  return (
                    <tr key={a.key} style={{ borderBottom:`1px solid ${C.BORDER_SOFT}`,
                      background: i%2===0 ? C.BG_CARD : C.BG_SECONDARY }}>
                      <td style={{ padding:'7px 10px', color:C.TEXT_MUTED, fontWeight:700, whiteSpace:'nowrap' }}>
                        {a.icon} {t(a.labelKey)}
                      </td>
                      {ids.map(id => {
                        const v = getVal(id, a.key);
                        const isBest = id === melhorId && v > 0;
                        const dragao = dragoes.find(d => d.id === id);
                        return (
                          <td key={id} style={{ padding:'7px 10px', textAlign:'center', fontFamily:'monospace',
                            fontWeight: isBest ? 900 : 700,
                            color: v === null ? C.TEXT_FAINT : isBest ? dragao.cor : C.TEXT_PRIMARY,
                          }}>
                            {v === null ? '—' : (
                              <span style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
                                <span>{fmt(v, locale)}</span>
                                {isBest && <span style={{ fontSize:'0.5rem', color:dragao.cor, fontFamily:'sans-serif' }}>{t('dragons.best')}</span>}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Separador Elementais */}
                <tr><td colSpan={dragoes.length + 1} style={{ padding:'4px 10px',
                  fontSize:'0.55rem', fontWeight:900, letterSpacing:'2px', color:'#8B6BAE',
                  textTransform:'uppercase', background:'rgba(139,107,174,0.08)' }}>
                  {t('dragons.elemental_section')}
                </td></tr>

                {ATTRS_ELEM.map((a, i) => {
                  const melhorId = melhor(a.key);
                  return (
                    <tr key={a.key} style={{ borderBottom:`1px solid ${C.BORDER_SOFT}`,
                      background: i%2===0 ? C.BG_CARD : C.BG_SECONDARY }}>
                      <td style={{ padding:'7px 10px', color:'#8B6BAE', fontWeight:700, whiteSpace:'nowrap' }}>
                        {a.icon} {t(a.labelKey)}
                      </td>
                      {ids.map(id => {
                        const v = getVal(id, a.key);
                        const isBest = id === melhorId && v > 0;
                        const dragao = dragoes.find(d => d.id === id);
                        return (
                          <td key={id} style={{ padding:'7px 10px', textAlign:'center', fontFamily:'monospace',
                            fontWeight: isBest ? 900 : 700,
                            color: v === null ? C.TEXT_FAINT : isBest ? dragao.cor : C.TEXT_PRIMARY,
                          }}>
                            {v === null ? '—' : (
                              <span style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
                                <span>{fmt(v, locale)}</span>
                                {isBest && <span style={{ fontSize:'0.5rem', color:dragao.cor, fontFamily:'sans-serif' }}>{t('dragons.best')}</span>}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};


export default DragaoComparacao;
