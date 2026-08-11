/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aoe: {
          // ── Fundos ──────────────────────────────────────────────────────
          bg:      '#E8E0CC',   // pergaminho base
          bg2:     '#DDD5BE',   // alternativo
          card:    '#F2EADA',   // superfície dos cards
          card2:   '#EAE0C8',   // gradiente topo do card
          input:   '#F8F4E8',   // campos de entrada
          // ── Navy colonial (AoE3) ────────────────────────────────────────
          navy:    '#1C3A5E',   // cabeçalho — azul colonial escuro
          navy2:   '#2A4C72',   // hover
          navy3:   '#132B47',   // dark active
          navylt:  '#D4E2F0',   // navy bem claro (bg suave)
          // ── Dourado ─────────────────────────────────────────────────────
          gold:    '#C8A84A',   // borda padrão
          gold2:   '#A88530',   // borda forte
          gold3:   '#8A6818',   // borda activa
          gold4:   '#D8C888',   // borda suave
          // ── Texto castanho ───────────────────────────────────────────────
          dark:    '#3E2F1C',   // texto principal
          mid:     '#6E5A3C',   // secundário
          muted:   '#9A7D56',   // label/mutado
          faint:   '#B8A07A',   // placeholder
          cream:   '#F8F2E0',   // texto sobre fundo escuro
          // ── Azul (AoE3 colonial) ─────────────────────────────────────────
          blue:    '#3B5C8C',   // azul primário
          blue2:   '#2A4470',   // escuro
          blue3:   '#5A7FB0',   // claro
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
