import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import suidPlugin from '@suid/vite-plugin';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [devtools(), solidPlugin(), suidPlugin()],
  server: {
    port: 7000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
  },
});
