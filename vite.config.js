import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['carby-character.png', 'vite.svg'],
      manifest: {
        name: 'Carby App',
        short_name: 'Carby',
        description: 'Your Smart AI Carb Counter',
        theme_color: '#fb923c', // Naranja
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'carby-character.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'carby-character.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
