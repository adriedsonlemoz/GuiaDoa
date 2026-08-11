import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
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
          {
            src: 'img/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
});
