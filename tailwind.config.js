/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aoe: {
          // ── Fundos ──────────────────────────────────────────────────────
          bg:      '#D9CEAA',   // pergaminho base
          bg2:     '#D0C39C',   // alternativo
          card:    '#E4D8B4',   // superfície dos cards
          card2:   '#EADFC0',   // gradiente topo do card
          input:   '#F7F1DC',   // campos de entrada
          // ── Navy colonial (AoE3) ────────────────────────────────────────
          navy:    '#2F5652',   // cabeçalho — azul colonial escuro
          navy2:   '#3C6863',   // hover
          navy3:   '#213F3C',   // dark active
          navylt:  '#D7E2DE',   // navy bem claro (bg suave)
          // ── Dourado ─────────────────────────────────────────────────────
          gold:    '#A48955',   // borda padrão
          gold2:   '#806033',   // borda forte
          gold3:   '#6F5128',   // borda activa
          gold4:   '#C1AE7C',   // borda suave
          // ── Texto castanho ───────────────────────────────────────────────
          dark:    '#2E342F',   // texto principal
          mid:     '#4F574D',   // secundário
          muted:   '#687064',   // label/mutado
          faint:   '#8B8E7D',   // placeholder
          cream:   '#FFF8E7',   // texto sobre fundo escuro
          // ── Azul (AoE3 colonial) ─────────────────────────────────────────
          blue:    '#258EAA',   // azul primário
          blue2:   '#1D6F83',   // escuro
          blue3:   '#55B3C4',   // claro
          // ── Status ───────────────────────────────────────────────────────
          red:     '#A83C2C',
          redlt:   '#C85050',
          green:   '#2EA53A',
          greenlt: '#52B85B',
          orange:  '#BF853B',
          purple:  '#8B6BAE',
          // ── Stats de tropa ───────────────────────────────────────────────
          health:  '#C85C5C',
          defense: '#5C7FA3',
          attack:  '#D08A3C',
          energy:  '#6FA36B',
        },
      },
      fontFamily: {
        cinzel:  ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        nunito:  ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
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
