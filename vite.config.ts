import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// The site is served from https://<user>.github.io/pilot-programme-trainer/.
// BASE_PATH lets `npm run dev` and local previews run from the root instead.
const base = process.env.BASE_PATH ?? '/pilot-programme-trainer/'

export default defineConfig({
  base,
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep React in its own chunk so app updates do not invalidate it.
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'] },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // Everything is bundled locally, so precaching the build makes the
        // whole trainer usable offline.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: `${base}index.html`,
      },
      manifest: {
        name: 'Pathway Trainer — Wizz Air / Urbe Aero',
        short_name: 'Pathway Trainer',
        description:
          'Allenamento completo per la selezione del Wizz Air Pathway Programme: TestAir360, colloquio tecnico e HR.',
        theme_color: '#0b0b0c',
        background_color: '#0b0b0c',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
