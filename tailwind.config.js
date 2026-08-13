/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aoe: {
          // ── Fundos ──────────────────────────────────────────────────────
          bg:      '#E6DED0',   // pergaminho base
          bg2:     '#D8CFBE',   // alternativo
          card:    '#F4ECDF',   // superfície dos cards
          card2:   '#EBE1CF',   // gradiente topo do card
          input:   '#FAF5EC',   // campos de entrada
          // ── Navy colonial (AoE3) ────────────────────────────────────────
          navy:    '#31484A',   // cabeçalho — azul colonial escuro
          navy2:   '#3A5456',   // hover
          navy3:   '#25393B',   // dark active
          navylt:  '#D4E2F0',   // navy bem claro (bg suave)
          // ── Dourado ─────────────────────────────────────────────────────
          gold:    '#B8954D',   // borda padrão
          gold2:   '#987433',   // borda forte
          gold3:   '#7C5E25',   // borda activa
          gold4:   '#D3C39A',   // borda suave
          // ── Texto castanho ───────────────────────────────────────────────
          dark:    '#443321',   // texto principal
          mid:     '#6C5940',   // secundário
          muted:   '#8D7758',   // label/mutado
          faint:   '#B6A182',   // placeholder
          cream:   '#F4EBDD',   // texto sobre fundo escuro
          // ── Azul (AoE3 colonial) ─────────────────────────────────────────
          blue:    '#58727D',   // azul primário
          blue2:   '#3F5963',   // escuro
          blue3:   '#7A9198',   // claro
          // ── Status ───────────────────────────────────────────────────────
          red:     '#A83C2C',
          redlt:   '#C85050',
          green:   '#5A8A5C',
          greenlt: '#78AA7A',
          orange:  '#C87A2C',
          purple:  '#8B6BAE',
          // ── Stats de tropa ───────────────────────────────────────────────
          health:  '#C85C5C',
          defense: '#5C7FA3',
          attack:  '#D08A3C',
          energy:  '#6FA36B',
        },
      },
      fontFamily: {
        cinzel:  ['"Cinzel"', 'Georgia', 'serif'],
        nunito:  ['"Nunito"', '"Segoe UI"', 'sans-serif'],
      },
      borderWidth: {
        '1.5': '1.5px',
      },
      animation: {
        'reveal-up':       'reveal-up 0.5s ease both',
        'urgent-pulse':    'urgent-pulse 0.9s ease-in-out infinite',
        'timer-breathe':   'timer-breathe 6s ease-in-out infinite',
        'tool-in':         'tool-in 0.35s ease both',
        'online-pulse':    'online-pulse 2.5s ease-in-out infinite',
        'gold-flicker':    'gold-flicker 8s ease-in-out infinite',
        'urgent-pulse-card':'urgent-pulse-card 0.9s ease-in-out infinite',
      },
      keyframes: {
        'reveal-up':    { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'urgent-pulse': { '0%,100%': { color: '#A83C2C' }, '50%': { color: '#E06060' } },
        'timer-breathe':{ '0%,100%': { opacity:'1', transform:'scale(1)' }, '50%': { opacity:'0.9', transform:'scale(0.995)' } },
        'tool-in':      { from: { opacity:'0', transform:'translateY(8px) scale(0.96)' }, to: { opacity:'1', transform:'translateY(0) scale(1)' } },
        'online-pulse': { '0%,100%': { opacity:'1' }, '50%': { opacity:'0.4' } },
        'gold-flicker': { '0%,90%,100%': { opacity:'1' }, '93%,97%': { opacity:'0.82' } },
        'urgent-pulse-card': { '0%,100%': { color:'#A83C2C', textShadow:'0 0 20px rgba(220,60,30,0.7)' }, '50%': { color:'#ff7050', textShadow:'0 0 40px rgba(255,80,40,0.9)' } },
      },
    },
  },
  plugins: [],
};
