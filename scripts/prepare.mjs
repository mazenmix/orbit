import fs from 'node:fs/promises';
await fs.mkdir('public/vendor/swiss',{recursive:true});
for(const name of ['src','wasm']) await fs.cp('node_modules/swisseph-wasm/'+name,'public/vendor/swiss/'+name,{recursive:true});
await fs.copyFile('node_modules/swisseph-wasm/LICENSE','public/vendor/swiss/LICENSE');
console.log('Vendored Swiss Ephemeris 0.1.0, WASM and ephemeris data (no runtime CDN).');

try { await fs.access('public/fonts/font-0.ttf'); } catch { await import('./fonts.mjs'); }

// Use the approved MX Astro Eye artwork for every browser/PWA icon.
await import('./generate-icons.mjs');
