import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'site'),
  base: '/app/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'site/src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'public/app'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'site/index.html'),
        client: resolve(__dirname, 'site/client.html'),
        pricing: resolve(__dirname, 'site/pricing.html'),
        docs: resolve(__dirname, 'site/docs.html'),
        dental: resolve(__dirname, 'site/dental.html'),
        terms: resolve(__dirname, 'site/terms.html'),
        privacy: resolve(__dirname, 'site/privacy.html'),
      },
    },
  },
});


