import React, { useState } from 'react';
import { KAOMOJI, ASCII_EM, SYM_CATS } from './data.js';
import { T, C } from './styles.js';
import { useI18n } from '../../hooks/useI18n.jsx';

export const LETTER_VARIANTS = {
  A: ['A','Á','À','Â','Ã','Ä','Å','Ā','Ă','Ą','Æ','ɑ','Δ','ᴀ','a','á','à','â','ã','ä','å','ā','ă','ą','æ'],
  B: ['B','Ɓ','Ƀ','Β','β','ʙ','b','ƀ','ɓ'],
  C: ['C','Ç','Ć','Ĉ','Č','Ƈ','©','Ɔ','ᴄ','c','ç','ć','ĉ','č','ƈ','ɔ'],
  D: ['D','Ð','Ď','Đ','Ɗ','Δ','ᴅ','d','ð','ď','đ','ɗ'],
  E: ['E','É','È','Ê','Ë','Ē','Ĕ','Ė','Ę','Ě','€','Ɛ','ᴇ','e','é','è','ê','ë','ē','ĕ','ė','ę','ě','ε'],
  F: ['F','Ƒ','Ғ','ƒ','ꜰ','f','ƒ'],
  G: ['G','Ǵ','Ğ','Ĝ','Ġ','Ģ','Ǥ','Ɠ','₲','ɢ','g','ǵ','ğ','ĝ','ġ','ģ','ǥ','ɠ'],
  H: ['H','Ĥ','Ħ','Ȟ','Η','ʜ','h','ĥ','ħ','ȟ'],
  I: ['I','Í','Ì','Î','Ï','Ĩ','Ī','Ĭ','Į','İ','Ɨ','Ι','ɪ','i','í','ì','î','ï','ĩ','ī','ĭ','į','ı'],
  J: ['J','Ĵ','Ɉ','Ј','ᴊ','j','ĵ','ɉ'],
  K: ['K','Ķ','Ǩ','Ƙ','Ҡ','₭','Κ','ᴋ','k','ķ','ǩ','ƙ','κ'],
  L: ['L','Ĺ','Ļ','Ľ','Ł','Ƚ','ʟ','l','ĺ','ļ','ľ','ł'],
  M: ['M','Μ','М','ᴍ','m','м'],
  N: ['N','Ń','Ñ','Ň','Ņ','Ŋ','Ɲ','И','ɴ','n','ń','ñ','ň','ņ','ŋ','ɲ'],
  O: ['O','Ó','Ò','Ô','Õ','Ö','Ø','Ō','Ŏ','Ő','Œ','Ɵ','Θ','⊙','◉','○','0','ᴏ','o','ó','ò','ô','õ','ö','ø','ō','ŏ','ő','œ'],
  P: ['P','Ƥ','Ρ','₱','ᴘ','p','ƥ','ρ'],
  Q: ['Q','Ɋ','Ǫ','q','ɋ','ǫ'],
  R: ['R','Ŕ','Ř','Ŗ','Ʀ','Я','ʀ','r','ŕ','ř','ŗ'],
  S: ['S','Ś','Ŝ','Ş','Š','Ș','Ƨ','$','ꜱ','s','ś','ŝ','ş','š','ș','ƨ'],
  T: ['T','Ť','Ţ','Ț','Ŧ','Ƭ','Ŧ','Τ','ᴛ','t','ť','ţ','ț','ŧ','ƭ'],
  U: ['U','Ú','Ù','Û','Ü','Ũ','Ū','Ŭ','Ů','Ű','Ų','Ʊ','μ','ᴜ','u','ú','ù','û','ü','ũ','ū','ŭ','ů','ű','ų'],
  V: ['V','Ʋ','Ѵ','ν','ᴠ','v','ʋ'],
  W: ['W','Ẃ','Ẁ','Ŵ','Ẅ','Ш','ᴡ','w','ẃ','ẁ','ŵ','ẅ'],
  X: ['X','Χ','Ж','×','x','χ'],
  Y: ['Y','Ý','Ỳ','Ŷ','Ÿ','Ƴ','Υ','ʏ','y','ý','ỳ','ŷ','ÿ','ƴ','γ'],
  Z: ['Z','Ź','Ż','Ž','Ƶ','Ʒ','Ȥ','ᴢ','z','ź','ż','ž','ƶ','ʒ'],
};

const MARKS = ['™','©','®','°','№','§','†','‡','∞','✓','✗','★','✦','♡','♥','⊙','◉','○','●','◆','◇','»','«','•','·','—','…'];

export default function CharacterTools({ onInsert, compact = false }) {
  const { t } = useI18n();
  const [panel, setPanel] = useState(null);
  const [letter, setLetter] = useState('O');
  const [symbolCat, setSymbolCat] = useState(0);

  const toggle = next => setPanel(current => current === next ? null : next);

  return (
    <div style={{ marginTop: compact ? 6 : 8 }}>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        <button type="button" style={{ ...T.btnOutline, height: 31, textTransform: 'none', letterSpacing: 0 }} onClick={() => toggle('letters')}>
          Aa {t('builder.characters.letters')}
        </button>
        <button type="button" style={{ ...T.btnOutline, height: 31, textTransform: 'none', letterSpacing: 0 }} onClick={() => toggle('symbols')}>
          ✦ {t('builder.characters.symbols')}
        </button>
        <button type="button" style={{ ...T.btnOutline, height: 31, textTransform: 'none', letterSpacing: 0 }} onClick={() => toggle('emoticons')}>
          ☺ {t('builder.characters.emoticons')}
        </button>
      </div>

      {panel === 'letters' && (
        <div style={{ marginTop: 8, padding: 9, background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 8 }}>
          <div style={{ fontSize: '0.66rem', color: C.TEXT_MUTED, marginBottom: 7 }}>{t('builder.characters.choose_letter')}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 9 }}>
            {Object.keys(LETTER_VARIANTS).map(base => (
              <button key={base} type="button" onClick={() => setLetter(base)} style={{
                width: 29, height: 29, padding: 0, borderRadius: 5,
                border: letter === base ? `1.5px solid ${C.BG_HEADER}` : `1px solid ${C.BORDER_SOFT}`,
                background: letter === base ? C.BG_HEADER : C.BG_INPUT,
                color: letter === base ? C.TEXT_HEADER : C.TEXT_PRIMARY,
                font: 'inherit', fontWeight: 700, cursor: 'pointer',
              }}>{base}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {LETTER_VARIANTS[letter].map((value, index) => (
              <button key={`${value}-${index}`} type="button" style={{ ...T.exSym, width: 34, height: 34, fontSize: '1.05rem' }} onClick={() => onInsert(value)}>{value}</button>
            ))}
          </div>
          <div style={{ ...T.divider, margin: '9px 0' }} />
          <div style={{ fontSize: '0.62rem', color: C.TEXT_MUTED, marginBottom: 6 }}>{t('builder.characters.quick_marks')}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {MARKS.map((value, index) => (
              <button key={`${value}-${index}`} type="button" style={T.exSym} onClick={() => onInsert(value)}>{value}</button>
            ))}
          </div>
        </div>
      )}

      {panel === 'symbols' && (
        <div style={{ marginTop: 8, padding: 9, background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 8 }}>
            {SYM_CATS.map((category, index) => (
              <button key={category.name} type="button" style={{ ...T.catTab(symbolCat === index), flex: '0 0 auto' }} onClick={() => setSymbolCat(index)}>{category.name}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {SYM_CATS[symbolCat].s.map((value, index) => (
              <button key={`${value}-${index}`} type="button" style={T.exSym} onClick={() => onInsert(value)}>{value}</button>
            ))}
          </div>
        </div>
      )}

      {panel === 'emoticons' && (
        <div style={{ marginTop: 8, padding: 9, background: C.BG_SECONDARY, border: `1px solid ${C.BORDER_SOFT}`, borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {[...KAOMOJI, ...ASCII_EM].map((value, index) => (
              <button key={`${value}-${index}`} type="button" style={T.exBtn} onClick={() => onInsert(value)}>{value}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
