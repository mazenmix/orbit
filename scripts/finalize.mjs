import fs from 'node:fs/promises';
import crypto from 'node:crypto';
async function files(root){const out=[];for(const e of await fs.readdir(root,{withFileTypes:true})){const p=root+'/'+e.name;if(e.isDirectory())out.push(...await files(p));else out.push(p)}return out}
const paths=(await files('dist')).filter(p=>!p.endsWith('/_headers')&&!p.endsWith('/sw.js'));
const version=crypto.createHash('sha256');for(const p of paths)version.update(await fs.readFile(p));
const urls=['/',...paths.map(p=>'/'+p.slice(5))];
await fs.writeFile('dist/sw.js',`const CACHE='mx-orbit-${version.digest('hex').slice(0,12)}';const FILES=${JSON.stringify(urls)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mx-orbit-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/')));return}e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));});`);
console.log('Offline shell includes',urls.length,'same-origin assets.');
