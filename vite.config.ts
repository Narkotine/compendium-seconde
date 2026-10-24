import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages : https://narkotine.github.io/compendium-seconde/
// Origine narkotine.github.io partagée (jeux, collège, primaire) : portée, caches et clés préfixés « compendium-seconde ».
export default defineConfig({
  base: '/compendium-seconde/',
  build: { target: 'es2020', assetsInlineLimit: 0 },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        id: '/compendium-seconde/',
        name: 'Maths Seconde',
        short_name: 'Maths 2de',
        description: 'Cours de maths de seconde (programme 2026) avec figures, exercices et corrigés, disponibles hors ligne.',
        lang: 'fr',
        dir: 'ltr',
        start_url: '/compendium-seconde/',
        scope: '/compendium-seconde/',
        display: 'standalone',
        background_color: '#f7f6f2',
        theme_color: '#7a3e9d',
        categories: ['education', 'books'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg,png,woff2,webmanifest}'],
        globIgnores: ['**/404.html'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cacheId: 'compendium-seconde',
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/compendium-seconde\//],
      },
    }),
  ],
});
