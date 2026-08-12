import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'Guia Tático DOA',
        short_name: 'Guia DOA',
        start_url: '/',
        display: 'standalone',
        background_color: '#E8D8B5',
        theme_color: '#B8965A',
        description: 'Ferramentas e cálculos para otimização de jogo.',
        icons: [
          { src: 'img/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'img/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'img/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
});
