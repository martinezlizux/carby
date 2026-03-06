import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['carby-icon.png', 'vite.svg'],
      manifest: {
        name: 'Carby App',
        short_name: 'Carby',
        description: 'Your Smart AI Carb Counter',
        theme_color: '#fb923c', // Naranja
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'carby-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'carby-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
