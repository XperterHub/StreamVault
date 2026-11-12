import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/streamvault-[name]-${Date.now()}.js`,
        chunkFileNames: `assets/streamvault-[name]-${Date.now()}.js`,
        assetFileNames: `assets/streamvault-[name]-${Date.now()}.[ext]`
      }
    }
  },
  server: {
    port: 3001,
    strictPort: true
  }
});
