import {defineConfig} from 'vite';
export default defineConfig({server:{host:'0.0.0.0',allowedHosts:['.app.github.dev','terminal.local']},build:{target:'es2022'},optimizeDeps:{exclude:['swisseph-wasm']}});
