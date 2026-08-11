// ─── Paleta 70 cores ─────────────────────────────────────────────────────────
export const PRESETS = [
  '#FF0000','#FF3333','#FF6666','#FF9999','#FF1493','#FF69B4','#FFB6C1','#DC143C','#C71585','#B22222',
  '#FF4500','#FF6600','#FF8C00','#FFA500','#FFB347','#FFD700','#FFEC8B','#FFF44F',
  '#ADFF2F','#7FFF00','#39FF14','#32CD32','#00FF00','#228B22','#006400',
  '#00FA9A','#00FF7F','#3CB371','#2E8B57','#008000',
  '#00CED1','#00BFFF','#87CEEB','#1E90FF','#4169E1','#0080FF','#0000FF','#0000CD','#000080',
  '#40E0D0','#48D1CC','#20B2AA','#008B8B',
  '#7B68EE','#6A5ACD','#8A2BE2','#9400D3','#9932CC','#800080',
  '#BA55D3','#DA70D6','#EE82EE','#DDA0DD','#FF00FF','#FF77FF',
  '#D2691E','#8B4513','#A0522D','#CD853F','#DEB887','#F4A460',
  '#FFFFFF','#F0F0F0','#DCDCDC','#C0C0C0','#A9A9A9','#808080','#696969','#404040','#1C1C1C','#000000',
];

// ─── Sugestões de paleta automática ──────────────────────────────────────────
export const SUGGEST_PALETTES = [
  ['FF1493','00FF00','1E90FF','FFD700','FF4500','8A2BE2'],
  ['FF1493','FF1493','00FF00','00FF00','1E90FF','1E90FF'],
  ['FF0080','FF4040','FF8000','FFD700','80FF00','00FF80'],
  ['8A2BE2','9932CC','DA70D6','FF69B4','FFB6C1','FFFFFF'],
  ['1E90FF','00BFFF','00FA9A','7FFF00','FFD700','FF4500'],
  ['FF0000','FF7F00','FFFF00','00FF00','0000FF','8B00FF'],
  ['FFD700','FFA500','FF8C00','FF4500','DC143C','8B0000'],
  ['00FFFF','00CED1','1E90FF','4169E1','8A2BE2','FF00FF'],
  ['FF69B4','FF1493','C71585','9932CC','8A2BE2','4B0082'],
  ['39FF14','7FFF00','ADFF2F','FFFF00','FFD700','FFA500'],
  ['FFFFFF','C0C0C0','808080','404040','000000','FF0000'],
  ['F4A460','D2691E','8B4513','A0522D','CD853F','DEB887'],
  ['009639','FEDF00','002776','FFFFFF','009639','FEDF00'],
];
export const SUGGEST_NAMES = [
  'Arco-íris', 'Pares', 'Gradiente', 'Roxo ✦', 'Oceano',
  'Vibrante', 'Pôr do sol', 'Neon', 'Pink Power', 'Tóxico',
  'Mono PB', 'Terroso', '🇧🇷 Brasil',
];

// ─── Kaomoji (30) ─────────────────────────────────────────────────────────────
export const KAOMOJI = [
  '｡♡‿♡｡','(◕‿◕)','(✿◡‿◡)','ʕ•ᴥ•ʔ','(≧◡≦)','(╥﹏╥)',
  '(ᵔᴥᵔ)','✧˖°','°•✦•°','★~(◠‿◕✿)','(っ˘ω˘ς)','(•_•)',
  '¯\\_(ツ)_/¯','(づ｡◕‿◕｡)づ','(ﾉ◕ヮ◕)ﾉ','(ง •̀_•́)ง',
  '(｀・ω・´)','(・∀・)','(＾▽＾)','(´• ω •`)','(◡ ω ◡)',
  '( ˘ ³˘)♥','(っ◔◡◔)っ','(⁀ᗢ⁀)','ฅ^•ﻌ•^ฅ','(ʘᗩʘ)',
  '(ó_ò)','(*^‿^*)','(▽〃)','٩(◕‿◕)۶',
];

// ─── ASCII Emoticons (20) ─────────────────────────────────────────────────────
export const ASCII_EM = [
  '(^_^)','(>_<)','(T_T)','UwU','OwO','>w<','^w^',
  ':-)',':-D',':-P',':3','-_-','o_O','xD','B-)',
  ';-)','(;-;)',':O','(*_*)','(=^.^=)',
];

// ─── Categorias de símbolos (8) ───────────────────────────────────────────────
export const SYM_CATS = [
  { name:'Corações', s:['♡','♥','❤','❥','❣','❦','💗','💓','💞','💝','🖤','🤍','💛','🧡','💜','💙','💚','❧'] },
  { name:'Estrelas',  s:['★','☆','✦','✧','✩','✪','✫','✬','✭','✮','✯','✰','⭐','💫','✨','🌟','🌠','⚡'] },
  { name:'Flores',    s:['✿','❀','❁','✾','☘','🌸','🌺','🌻','🌹','🌷','🌼','🍀','🍃','🌿','🍂','🍁','🌱','🪷'] },
  { name:'Partes',    s:['｡','◕','◡','ᵔ','ᴥ','◠','˘','ω','ヽ','ノ','づ','っ','ε','٩','۶','ฅ','ʕ','ʔ','•','ᗒ','ᗕ'] },
  { name:'Especiais', s:['•','·','‿','~','–','—','…','°','♪','♫','♬','♩','✓','✗','∞','§','†','‡','‼','⁉','™','©','®'] },
  { name:'Formas',    s:['▲','△','▼','▽','◆','◇','●','○','■','□','▪','▫','◉','◎','⬟','⬡','⬢','⬣','⏺','⬤'] },
  { name:'Setas',     s:['→','←','↑','↓','↗','↘','↙','↖','↔','↕','⇒','⇐','⇑','⇓','»','«','›','‹','⟨','⟩'] },
  { name:'Céu',       s:['🌙','☽','☾','☀','☁','⛅','🌤','❄','☃','⛄','🌈','⚡','🌊','🌌','✦'] },
];

// ─── Bandeiras (25) ───────────────────────────────────────────────────────────
export const FLAGS = [
  // Europa
  { name:'França',          emoji:'🇫🇷', stripes:['0055A4','FFFFFF','EF4135'] },
  { name:'Itália',          emoji:'🇮🇹', stripes:['009246','F1F2F1','CE2B37'] },
  { name:'Alemanha',        emoji:'🇩🇪', stripes:['000000','DD0000','FFCE00'], note:'Horizontal — pode usar na vertical em chats que não diferenciam' },
  { name:'Bélgica',         emoji:'🇧🇪', stripes:['000000','FFD90C','EF3340'] },
  { name:'Irlanda',         emoji:'🇮🇪', stripes:['169B62','FFFFFF','FF883E'] },
  { name:'Países Baixos',   emoji:'🇳🇱', stripes:['AE1C28','FFFFFF','21468B'], note:'Horizontal — vermelho/branco/azul' },
  { name:'Luxemburgo',      emoji:'🇱🇺', stripes:['ED2939','FFFFFF','00A1DE'] },
  { name:'Romênia',         emoji:'🇷🇴', stripes:['002B7F','FCD116','CE1126'] },
  { name:'Andorra',         emoji:'🇦🇩', stripes:['0018A8','FEDD00','D50032'], note:'Simplificado — brasão omitido' },
  { name:'Moldávia',        emoji:'🇲🇩', stripes:['003DA5','FFD200','CC092F'], note:'Simplificado — brasão omitido' },
  // Américas
  { name:'México',          emoji:'🇲🇽', stripes:['006847','FFFFFF','CE1126'], note:'Simplificado — emblema omitido' },
  { name:'Colômbia',        emoji:'🇨🇴', stripes:['FCD116','003087','CE1126'], note:'Proporcional: amarelo=2x, azul e vermelho=1x' },
  { name:'Venezuela',       emoji:'🇻🇪', stripes:['FFCC00','203484','CF142B'], note:'Faixas amarelo/azul/vermelho — versão vertical simplificada, sem estrelas e brasão' },
  { name:'Peru',            emoji:'🇵🇪', stripes:['D91023','FFFFFF','D91023'], note:'Simplificado — brasão omitido' },
  { name:'Canadá',          emoji:'🇨🇦', stripes:['FF0000','FFFFFF','FF0000'], note:'Simplificado — folha omitida' },
  { name:'El Salvador',     emoji:'🇸🇻', stripes:['0047AB','FFFFFF','0047AB'], note:'Versão simplificada vertical' },
  { name:'Guiné',           emoji:'🇬🇳', stripes:['CE1126','FCD116','009460'] },
  // África
  { name:'Mali',            emoji:'🇲🇱', stripes:['14B53A','FCD116','CE1126'] },
  { name:'Senegal',         emoji:'🇸🇳', stripes:['00853F','FDEF42','E31B1D'], note:'Simplificado — estrela omitida' },
  { name:'Camarões',        emoji:'🇨🇲', stripes:['007A5E','CE1126','FCD116'], note:'Simplificado — estrela omitida' },
  { name:'Costa do Marfim', emoji:'🇨🇮', stripes:['F77F00','FFFFFF','009E60'] },
  { name:'Guiné-Bissau',    emoji:'🇬🇼', stripes:['CE1126','FCD116','009E49'], note:'Simplificado — estrela omitida' },
  { name:'Chade',           emoji:'🇹🇩', stripes:['002664','FECB00','C60C30'] },
  // Ásia
  { name:'Emirados Árabes', emoji:'🇦🇪', stripes:['00732F','FFFFFF','FF0000'], note:'Simplificado — barra vermelha vertical' },
  { name:'Iêmen',           emoji:'🇾🇪', stripes:['CE1126','FFFFFF','000000'], note:'Versão simplificada vertical' },
];

export const FLAG_REGIOES = [
  { name:'🌍 Europa',   range:[0,10]  },
  { name:'🌎 Américas', range:[10,17] },
  { name:'🌍 África',   range:[17,23] },
  { name:'🌏 Ásia',     range:[23,25] },
];

export const flagCode = (flag) => flag.stripes.map(c => '[' + c + ']█').join('');

// ─── Modos disponíveis na tela inicial ───────────────────────────────────────
export const MODOS = [
  {
    id: 'texto',
    icon: '🎨',
    title: 'Texto Colorido',
    desc: 'Pinte cada caractere com a cor que quiser e gere o código pronto para colar.',
    cor: '#9B59B6',
  },
  {
    id: 'emoticons',
    icon: '😄',
    title: 'Emoticons',
    desc: 'Kaomoji japoneses e ASCII emoticons para inserir no texto.',
    cor: '#E67E22',
  },
  {
    id: 'simbolos',
    icon: '✦',
    title: 'Símbolos',
    desc: 'Corações, estrelas, flores, formas, setas e muito mais.',
    cor: '#27AE60',
  },
  {
    id: 'bandeiras',
    icon: '🏳',
    title: 'Bandeiras',
    desc: 'Bandeiras coloridas com listras verticais prontas para copiar.',
    cor: '#2980B9',
  },
];

// ─── Frases prontas — textos fixos já coloridos, prontos pra copiar ──────────
// Código no formato [HEX]texto, mesmo padrão usado pelo restante do builder
export const FRASES_PRONTAS = [
  {
    id: 'parabens_general_pt',
    label: '🎉 Parabéns General (PT)',
    preview: 'Parabéns General!',
    // Roxo (8A2BE2) + Laranja (FF8C00) — cores dos generais raros do jogo
    codigo: '[8A2BE2]Parabéns [FF8C00]General[8A2BE2]!',
  },
  {
    id: 'parabens_general_en',
    label: '🎉 Congratulations General (EN)',
    preview: 'Congratulations General!',
    codigo: '[8A2BE2]Congratulations [FF8C00]General[8A2BE2]!',
  },
  {
    id: 'general_roxo_laranja_pt',
    label: '⭐ General Lendário (PT)',
    preview: 'General Lendário ⭐',
    codigo: '[FF8C00]General [8A2BE2]Lendário[FF8C00] ⭐',
  },
  {
    id: 'boa_sorte_pt',
    label: '🍀 Boa sorte! (PT)',
    preview: 'Boa sorte!',
    codigo: '[8A2BE2]Boa [FF8C00]sorte[8A2BE2]!',
  },
];

// ─── Placar de jogos — cores padrão sugeridas ─────────────────────────────────
export const PLACAR_CORES_PADRAO = {
  timeA:      'FFD700', // dourado
  timeB:      '1E90FF', // azul
  placar:     'FFFFFF', // branco
  separador:  'FF4500', // laranja-vermelho (o "-")
  destaque:   'FFD700', // dourado — número do time que marcou por último
};
