import React, { useState, useRef } from 'react';
import { T, C, safeCopy } from './styles.js';

// ─── Helper: itera por code points (resolve surrogate pairs) ─────────────────
const chars  = str => [...str];
const BASE_UP  = chars('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const BASE_LO  = chars('abcdefghijklmnopqrstuvwxyz');
const BASE_NUM = chars('0123456789');

function mkMap(upStr, loStr = '', numStr = '') {
  const up  = chars(upStr);
  const lo  = chars(loStr);
  const num = chars(numStr);
  const m = {};
  BASE_UP.forEach((c, i)  => { if (up[i])  m[c] = up[i];  });
  BASE_LO.forEach((c, i)  => { if (lo[i])  m[c] = lo[i];  });
  BASE_NUM.forEach((c, i) => { if (num[i]) m[c] = num[i]; });
  return m;
}

function conv(text, map) {
  return chars(text).map(c => map[c] ?? c).join('');
}

// ─── Fontes ───────────────────────────────────────────────────────────────────
const FONTES = [
  { id: 'bold', grupo: 'Negrito', nome: 'Negrito',
    fn: t => conv(t, mkMap('𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙','𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳','𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗')) },
  { id: 'italic', grupo: 'Negrito', nome: 'Itálico',
    fn: t => conv(t, mkMap('𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍','𝑎𝑏𝑐𝑑𝑒𝑓𝑔𝑕𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧')) },
  { id: 'bold_italic', grupo: 'Negrito', nome: 'Negrito Itálico',
    fn: t => conv(t, mkMap('𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁','𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛')) },

  { id: 'script', grupo: 'Cursivo', nome: 'Cursivo',
    fn: t => conv(t, mkMap('𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵','𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝓄𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏')) },
  { id: 'script_bold', grupo: 'Cursivo', nome: 'Cursivo Negrito',
    fn: t => conv(t, mkMap('𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩','𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃')) },

  { id: 'fraktur', grupo: 'Gótico', nome: 'Gótico',
    fn: t => conv(t, mkMap('𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ','𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷')) },
  { id: 'fraktur_bold', grupo: 'Gótico', nome: 'Gótico Negrito',
    fn: t => conv(t, mkMap('𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅','𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟')) },

  { id: 'double', grupo: 'Duplo Contorno', nome: 'Duplo Contorno',
    fn: t => conv(t, mkMap('𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ','𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫','𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡')) },

  { id: 'mono', grupo: 'Monoespaçado', nome: 'Monoespaçado',
    fn: t => conv(t, mkMap('𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉','𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣','𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿')) },

  { id: 'sans', grupo: 'Sans-Serif', nome: 'Sans-Serif',
    fn: t => conv(t, mkMap('𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹','𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓','𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫')) },
  { id: 'sans_bold', grupo: 'Sans-Serif', nome: 'Sans-Serif Negrito',
    fn: t => conv(t, mkMap('𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭','𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇','𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵')) },
  { id: 'sans_italic', grupo: 'Sans-Serif', nome: 'Sans-Serif Itálico',
    fn: t => conv(t, mkMap('𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡','𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻')) },
  { id: 'sans_bold_italic', grupo: 'Sans-Serif', nome: 'Sans-Serif Neg. Itálico',
    fn: t => conv(t, mkMap('𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕','𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯')) },

  { id: 'circle', grupo: 'Decorativo', nome: 'Ⓒ Circulado',
    fn: t => conv(t, mkMap('ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ','ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ','⓪①②③④⑤⑥⑦⑧⑨')) },
  { id: 'circle_neg', grupo: 'Decorativo', nome: '🅝 Circulado Preto',
    fn: t => conv(t, mkMap('🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩','🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩')) },
  { id: 'square_neg', grupo: 'Decorativo', nome: '🅶 Quadrado Preto',
    fn: t => conv(t, mkMap('🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉','🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉')) },

  { id: 'small_caps', grupo: 'Especial', nome: 'ꜱᴍᴀʟʟ ᴄᴀᴘꜱ',
    fn: t => conv(t, mkMap('ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ','ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ')) },
  { id: 'latin_alpha', grupo: 'Especial', nome: 'Aesthetic ɑ (latin alpha)',
    fn: t => conv(t, { 'a':'ɑ', 'A':'ɑ' }) },
  { id: 'wide', grupo: 'Especial', nome: 'Ｗｉｄｅ',
    fn: t => conv(t, mkMap('ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ','ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ','０１２３４５６７８９')) },
  { id: 'greek_like', grupo: 'Especial', nome: 'Grεεk / Hαckeδ',
    fn: t => conv(t, {
      'A':'Δ','B':'β','C':'©','D':'Đ','E':'€','F':'ƒ','G':'Ǥ','H':'Ħ',
      'I':'Ī','J':'Ĵ','K':'Ķ','L':'Ł','M':'Μ','N':'Ñ','O':'Ø','P':'Ρ',
      'Q':'Q','R':'Ŗ','S':'Ş','T':'Ŧ','U':'Ū','V':'V','W':'Ŵ','X':'Χ',
      'Y':'Υ','Z':'Ż',
      'a':'α','b':'b','c':'ç','d':'đ','e':'ε','f':'f','g':'ĝ','h':'ħ',
      'i':'ī','j':'ĵ','k':'ķ','l':'ł','m':'м','n':'ñ','o':'ø','p':'р',
      'q':'q','r':'ŗ','s':'ş','t':'ŧ','u':'ū','v':'v','w':'ŵ','x':'χ',
      'y':'γ','z':'ż',
    }) },
  { id: 'leet', grupo: 'Especial', nome: '1337 (Leet)',
    fn: t => conv(t, {
      'A':'4','B':'8','C':'(','D':'D','E':'3','F':'F','G':'6','H':'#',
      'I':'1','J':'J','K':'K','L':'1','M':'M','N':'N','O':'0','P':'P',
      'Q':'Q','R':'R','S':'5','T':'7','U':'U','V':'V','W':'W','X':'X',
      'Y':'Y','Z':'2',
      'a':'4','b':'8','c':'(','d':'d','e':'3','f':'f','g':'6','h':'#',
      'i':'1','j':'j','k':'k','l':'1','m':'m','n':'n','o':'0','p':'p',
      'q':'q','r':'r','s':'5','t':'7','u':'u','v':'v','w':'w','x':'x',
      'y':'y','z':'2',
    }) },
  { id: 'upside_down', grupo: 'Especial', nome: 'uʍop ǝpᴉsdn',
    fn: t => chars(t).map(c => ({
      'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ',
      'i':'ᴉ','j':'ɾ','k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d',
      'q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x',
      'y':'ʎ','z':'z',
      'A':'∀','B':'ᗺ','C':'Ɔ','D':'ᗡ','E':'Ǝ','F':'Ⅎ','G':'פ','H':'H',
      'I':'I','J':'ɾ','K':'ʞ','L':'˥','M':'W','N':'N','O':'O','P':'d',
      'Q':'Q','R':'ɹ','S':'S','T':'┴','U':'∩','V':'Λ','W':'M','X':'X',
      'Y':'⅄','Z':'Z',
      '0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ',
      '8':'8','9':'6','!':'¡','?':'¿','.':'˙',',':'\'',' ':' ',
    }[c] ?? c)).reverse().join('') },
  { id: 'mirror', grupo: 'Especial', nome: 'ɿoɿɿiM',
    fn: t => chars(t).map(c => ({
      'a':'ɒ','b':'d','c':'ɔ','d':'b','e':'ɘ','f':'ʇ','g':'ᵹ','h':'ʜ',
      'i':'i','j':'ᒐ','k':'ʞ','l':'l','m':'m','n':'ᴎ','o':'o','p':'q',
      'q':'p','r':'ɿ','s':'ƨ','t':'ƚ','u':'u','v':'v','w':'w','x':'x',
      'y':'y','z':'ƹ',
      'A':'A','B':'ᴃ','C':'Ɔ','D':'ᗡ','E':'Ǝ','F':'ᖷ','G':'ᵷ','H':'H',
      'I':'I','J':'Ⴑ','K':'ᴋ','L':'⅃','M':'M','N':'ᴎ','O':'O','P':'ᴑ',
      'Q':'Q','R':'ᴚ','S':'Ƨ','T':'T','U':'U','V':'V','W':'W','X':'X',
      'Y':'Y','Z':'Ƹ',' ':' ',
    }[c] ?? c)).reverse().join('') },
  { id: 'strike', grupo: 'Especial', nome: 'T̶a̶c̶h̶a̶d̶o̶',
    fn: t => chars(t).map(c => c === ' ' ? ' ' : c + '\u0336').join('') },
  { id: 'underline', grupo: 'Especial', nome: 'S̲u̲b̲l̲i̲n̲h̲a̲d̲o̲',
    fn: t => chars(t).map(c => c === ' ' ? ' ' : c + '\u0332').join('') },
  { id: 'double_strike', grupo: 'Especial', nome: 'D̸u̸p̸l̸o̸ ̸T̸r̸a̸ç̸o̸',
    fn: t => chars(t).map(c => c === ' ' ? ' ' : c + '\u0338').join('') },
  { id: 'wave', grupo: 'Especial', nome: 'T͠i͠l͠d͠e͠',
    fn: t => chars(t).map(c => c === ' ' ? ' ' : c + '\u0360').join('') },

  { id: 'spaced', grupo: 'Espaçado', nome: 'E s p a ç a d o',
    fn: t => chars(t).join(' ') },
  { id: 'spaced_dots', grupo: 'Espaçado', nome: 'E·s·p·a·ç·a·d·o',
    fn: t => chars(t).join('·') },
  { id: 'spaced_stars', grupo: 'Espaçado', nome: 'E✦s✦p✦a✦ç✦a✦d✦o',
    fn: t => chars(t).join('✦') },
  { id: 'spaced_hearts', grupo: 'Espaçado', nome: 'E♡s♡p♡a♡ç♡a♡d♡o',
    fn: t => chars(t).join('♡') },
  { id: 'spaced_dots2', grupo: 'Espaçado', nome: 'E•s•p•a•ç•a•d•o',
    fn: t => chars(t).join('•') },

  { id: 'brackets', grupo: 'Encapsulado', nome: '【T e x t o】',
    fn: t => '【' + chars(t).join(' ') + '】' },
  { id: 'stars_wrap', grupo: 'Encapsulado', nome: '✦ Texto ✦',
    fn: t => '✦ ' + t + ' ✦' },
  { id: 'diamond_wrap', grupo: 'Encapsulado', nome: '◆ Texto ◆',
    fn: t => '◆ ' + t + ' ◆' },
  { id: 'flower_wrap', grupo: 'Encapsulado', nome: '✿ Texto ✿',
    fn: t => '✿ ' + t + ' ✿' },
  { id: 'arrow_wrap', grupo: 'Encapsulado', nome: '» Texto «',
    fn: t => '» ' + t + ' «' },
  { id: 'heart_wrap', grupo: 'Encapsulado', nome: '♡ Texto ♡',
    fn: t => '♡ ' + t + ' ♡' },
  { id: 'star_wrap2', grupo: 'Encapsulado', nome: '★彡 Texto 彡★',
    fn: t => '★彡 ' + t + ' 彡★' },
];

const GRUPOS = [...new Set(FONTES.map(f => f.grupo))];
const EXEMPLO = 'Shadow Warriors';

// ═════════════════════════════════════════════════════════════════════════════
export default function ModoFontes({ showToast }) {
  const [texto,     setTexto]     = useState('');
  const [grupo,     setGrupo]     = useState(GRUPOS[0]);
  const [busca,     setBusca]     = useState('');
  const [copiedId,  setCopiedId]  = useState(null);
  const [historico, setHistorico] = useState([]);
  const inputRef = useRef(null);

  const fontesFiltradas = FONTES.filter(f => {
    const noGrupo = busca ? true : f.grupo === grupo;
    const naBusca = busca
      ? f.nome.toLowerCase().includes(busca.toLowerCase()) ||
        f.grupo.toLowerCase().includes(busca.toLowerCase())
      : true;
    return noGrupo && naBusca;
  });

  const copiar = (fonte, textoBase) => {
    const t = textoBase || texto;
    if (!t.trim()) { showToast('Digite um texto primeiro!'); inputRef.current?.focus(); return; }
    const resultado = fonte.fn(t);
    safeCopy(resultado, () => {
      setCopiedId(fonte.id);
      setHistorico(prev => [
        { id: fonte.id, nome: fonte.nome, resultado },
        ...prev.filter(h => h.id !== fonte.id),
      ].slice(0, 5));
      showToast('✓ ' + fonte.nome + ' copiado!');
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  const preview = (fonte) =>
    texto.trim() ? fonte.fn(texto) : fonte.fn(EXEMPLO);

  const charCount = chars(texto).length;

  return (
    <div style={T.body}>

      <div style={T.card}>
        <div style={{ ...T.cardTitle, justifyContent: 'space-between' }}>
          <span><span style={{ color: C.ACCENT }}>✏️</span> Seu texto</span>
          <span style={{ fontSize: '0.65rem', color: charCount > 0 ? C.ACCENT : C.TEXT_FAINT, textTransform: 'none', letterSpacing: 0 }}>
            {charCount} {charCount === 1 ? 'char' : 'chars'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            ref={inputRef}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Shadow Warriors rule the night…"
            rows={2}
            style={{ ...T.input, flex: 1 }}
          />
          {texto && (
            <button
              onClick={() => setTexto('')}
              style={{ ...T.btnOutline, height: 44, padding: '0 10px', alignSelf: 'flex-start', fontSize: '0.8rem' }}
              title="Limpar"
            >✕</button>
          )}
        </div>
        <p style={{ fontSize: '0.63rem', color: C.TEXT_FAINT, marginTop: 5 }}>
          Clique em qualquer estilo para copiar. Sem texto: mostra preview com exemplo.
        </p>
      </div>

      {historico.length > 0 && (
        <div style={{ ...T.card, marginBottom: 8 }}>
          <div style={T.cardTitle}><span style={{ color: C.ACCENT }}>⏱</span> Últimos copiados</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {historico.map(h => (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: C.BG_SECONDARY, borderRadius: 7, padding: '6px 10px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.58rem', color: C.TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {h.nome}
                  </span>
                  <div style={{ fontSize: '0.85rem', color: C.TEXT_PRIMARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.resultado}
                  </div>
                </div>
                <button
                  onClick={() => safeCopy(h.resultado, () => showToast('✓ Recopiado!'))}
                  style={{ ...T.btnOutline, height: 28, padding: '0 8px', fontSize: '0.65rem' }}
                >⎘</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="🔍 Buscar estilo…"
          style={{ ...T.input, flex: 1, minHeight: 34, fontSize: '0.78rem', padding: '6px 10px' }}
        />
        {busca && (
          <button onClick={() => setBusca('')} style={{ ...T.btnOutline, height: 34, padding: '0 10px' }}>✕</button>
        )}
      </div>

      {!busca && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {GRUPOS.map(g => (
            <button key={g} style={T.catTab(grupo === g)} onClick={() => setGrupo(g)}>
              {g}
            </button>
          ))}
        </div>
      )}

      {busca && fontesFiltradas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: C.TEXT_MUTED, fontSize: '0.78rem' }}>
          Nenhum estilo encontrado para "{busca}"
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fontesFiltradas.map(fonte => {
          const result   = preview(fonte);
          const isCopied = copiedId === fonte.id;
          const isEmpty  = !texto.trim();
          return (
            <div key={fonte.id}
              onClick={() => copiar(fonte)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: isCopied
                  ? 'linear-gradient(90deg,rgba(28,76,114,0.15),rgba(200,168,74,0.08))'
                  : C.BG_SECONDARY,
                border: `1.5px solid ${isCopied ? 'rgba(200,168,74,0.55)' : 'rgba(200,168,74,0.2)'}`,
                borderLeft: `4px solid ${isCopied ? C.ACCENT : 'transparent'}`,
                borderRadius: 10, padding: '10px 12px',
                cursor: 'pointer', transition: 'all 0.13s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(200,168,74,0.45)';
                e.currentTarget.style.background  = C.BG_INPUT;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = isCopied ? 'rgba(200,168,74,0.55)' : 'rgba(200,168,74,0.2)';
                e.currentTarget.style.background  = isCopied
                  ? 'linear-gradient(90deg,rgba(28,76,114,0.15),rgba(200,168,74,0.08))'
                  : C.BG_SECONDARY;
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.58rem', color: C.TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
                  {fonte.nome}
                  {isEmpty && <span style={{ marginLeft: 6, color: C.TEXT_FAINT, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>exemplo</span>}
                </div>
                <div style={{
                  fontSize: '0.95rem', color: isEmpty ? C.TEXT_MUTED : C.TEXT_PRIMARY,
                  wordBreak: 'break-all', lineHeight: 1.5,
                }}>
                  {result}
                </div>
              </div>

              <button
                onClick={e => { e.stopPropagation(); copiar(fonte); }}
                style={{
                  background: isCopied ? 'rgba(200,168,74,0.15)' : C.BG_CARD,
                  border: `1.5px solid ${isCopied ? 'rgba(200,168,74,0.5)' : 'rgba(200,168,74,0.25)'}`,
                  borderRadius: 7, color: isCopied ? C.ACCENT : C.TEXT_MUTED,
                  fontSize: isCopied ? '0.75rem' : '1rem',
                  width: 34, height: 34, flexShrink: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s', fontFamily: 'inherit', fontWeight: 700,
                }}
                title="Copiar"
              >
                {isCopied ? '✓' : '⎘'}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
