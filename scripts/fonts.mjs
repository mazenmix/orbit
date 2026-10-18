import fs from 'node:fs/promises';
const url='https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap';
let css=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>{if(!r.ok)throw Error('Font download failed');return r.text()});
await fs.mkdir('public/fonts',{recursive:true});let index=0;for(const source of new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(x=>x[1]))){const name=`font-${index++}.${source.endsWith('.woff2')?'woff2':'ttf'}`;const r=await fetch(source);if(!r.ok)throw Error('Font download failed');await fs.writeFile('public/fonts/'+name,new Uint8Array(await r.arrayBuffer()));css=css.replaceAll(source,'/fonts/'+name)}
await fs.writeFile('public/fonts/fonts.css',css);console.log('Vendored',index,'font assets. Fonts are served locally.');
