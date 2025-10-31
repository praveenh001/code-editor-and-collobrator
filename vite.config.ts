import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        try {
          copyFileSync('_redirects', 'dist/_redirects');
          console.log('✅ Copied _redirects to dist/');
        } catch (err) {
          console.warn('⚠️ No _redirects file found or copy failed.');
        }
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
