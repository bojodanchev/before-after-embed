import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'site'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'site/src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'public/app'),
    emptyOutDir: true,
  },
});


