import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ⭐ REQUIRED FOR RENDER SPA ROUTING
  publicDir: "public",

  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
