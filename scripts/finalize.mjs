import fs from 'node:fs/promises';
import crypto from 'node:crypto';
async function files(root){const out=[];for(const e of await fs.readdir(root,{withFileTypes:true})){const p=root+'/'+e.name;if(e.isDirectory())out.push(...await files(p));else out.push(p)}return out}
const paths=(await files('dist')).filter(p=>!p.endsWith('/_headers')&&!p.endsWith('/sw.js'));
// Fail the deployment rather than accidentally serving first-party source maps,
// TypeScript/JSX sources or the development entry point.
// The Swiss Ephemeris vendor tree retains its own licensing/source obligations.
const leaked=paths.filter(p=>
 (p.startsWith('dist/src/') ||
  /\.(?:map|ts|tsx|jsx)$/i.test(p) ||
  /\/(?:\.env(?:\..*)?|\.dev\.vars|vite\.config\.[cm]?[jt]s)$/i.test(p)) &&
 !p.startsWith('dist/vendor/swiss/')
);
if(leaked.length)throw new Error('Unexpected development/source files in production: '+leaked.join(', '));
const html=await fs.readFile('dist/index.html','utf8');
if(/(?:src|href)=["']\/src\//.test(html))throw new Error('Uncompiled development entry point leaked to production HTML');
for(const p of paths.filter(p=>/\.(?:js|css)$/i.test(p)&&!p.startsWith('dist/vendor/swiss/'))){
 const body=await fs.readFile(p,'utf8');
 if(/(?:\/\/[#@]|\/\*#)\s*sourceMappingURL\s*=/.test(body))
  throw new Error('Source mapping directive leaked to production: '+p);
}
const version=crypto.createHash('sha256');for(const p of paths)version.update(await fs.readFile(p));
const urls=['/',...paths.map(p=>'/'+p.slice(5))];
await fs.writeFile('dist/sw.js',`const CACHE='mx-astro-${version.digest('hex').slice(0,12)}';const FILES=${JSON.stringify(urls)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('mx-orbit-')||k.startsWith('mx-astro-'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/')));return}e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));});
/* Background push display is supported. Actual delivery requires a separate,
 * authenticated VAPID subscription service, storage and scheduler.
 * Do not claim that the foreground MX Eye switch enables closed-app delivery.
 */
self.addEventListener('push',e=>{
 let payload={};try{payload=e.data&&e.data.json()||{}}catch{}
 const body=typeof payload.body==='string'?payload.body.slice(0,240):'A new MX Astro update is available.';
 const id=typeof payload.id==='string'&&/^[a-zA-Z0-9:_-]{1,100}$/.test(payload.id)?payload.id:'mx-astro-update';
 const page=typeof payload.page==='string'&&/^#(today|signals|time|people|chart|lunar|eclipses|asteroids|advanced|intel|evidence|ai|settings)$/.test(payload.page)?payload.page:'#today';
 e.waitUntil(self.registration.showNotification('MX Astro',{body,tag:id,icon:'/original-brand.png',data:{page},requireInteraction:false}));
});
self.addEventListener('notificationclick',e=>{
 e.notification.close();
 const page=e.notification.data&&e.notification.data.page||'#today';
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
  for(const c of clients){if(new URL(c.url).origin===self.location.origin){await c.focus();if('navigate' in c)await c.navigate('/'+page);return}}
  if(self.clients.openWindow)await self.clients.openWindow('/'+page);
 }));
});`);
console.log('Offline shell includes',urls.length,'same-origin assets.');
