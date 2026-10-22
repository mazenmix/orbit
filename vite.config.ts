import {defineConfig} from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.app.github.dev', 'terminal.local'],
  },
  // Production source protection. Browser-delivered code is still inspectable;
  // these settings only reduce readability and prevent debug artifact leakage.
  esbuild: {
    drop: ['debugger'],
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: false,
    manifest: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
      },
    },
  },
  optimizeDeps: {exclude: ['swisseph-wasm']},
});
