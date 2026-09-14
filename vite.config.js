import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: false,
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2022',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  esbuild: {
    target: 'es2022'
  }
});
