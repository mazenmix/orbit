import test from 'node:test';import assert from 'node:assert/strict';
import {mountAsteroid,isAsteroidMounted,namedAsteroidPositions} from '../src/asteroidRuntime.ts';
test('numbered .se1 mounts into correct Swiss filesystem path and uses official body ID',()=>{
 const operations:string[]=[];
 const mock={SweModule:{FS_createPath:(...a:any[])=>operations.push('dir:'+a.slice(0,2).join('/')),FS_createDataFile:(...a:any[])=>operations.push('file:'+a.slice(0,2).join('/'))},set_ephe_path:(s:string)=>operations.push('path:'+s),calc_ut:(jd:number,id:number)=>new Float64Array([id-10000,0,0,1])};
 mountAsteroid(mock,433,new Uint8Array(2000));
 assert.ok(isAsteroidMounted(433));
 assert.ok(operations.some(s=>s.includes('ast0/se00433s.se1')));
 assert.equal(namedAsteroidPositions(mock,new Date('2026-10-18T00:00:00Z')).find(x=>x.id==='Eros')?.longitude,73);
});
test('malformed binary data, arbitrary asteroid ID and missing filesystem fail closed',()=>{
 const mock={SweModule:{},set_ephe_path:()=>{},calc_ut:()=>new Float64Array([0,0,0,0])};
 assert.throws(()=>mountAsteroid(mock,433,new Uint8Array(100)));
 assert.throws(()=>mountAsteroid(mock,99999,new Uint8Array(2000)));
 assert.throws(()=>mountAsteroid(mock,433,new Uint8Array(2000)));
});

test('a failed SE1 computation deletes the bad WASM file and retries instead of poisoning the cache/session',async()=>{
 const {loadNamedAsteroids}=await import('../src/asteroidRuntime.ts');
 const files=new Set<string>();
 let rejected=true,unlinks=0;
 const mock={
  SweModule:{
   FS_createPath:()=>{},
   FS_createDataFile:(parent:string,name:string)=>{
    const key=parent+'/'+name;
    if(files.has(key))throw Error('Emscripten file already exists: '+key);
    files.add(key);
   },
   FS_unlink:(path:string)=>{files.delete(path);unlinks++}
  },
  set_ephe_path:()=>{},
  calc_ut:(_jd:number,id:number)=>{
   if(id===10016&&rejected)return new Float64Array([NaN,0,0,NaN]);
   return new Float64Array([40,0,0,.5]);
  }
 };
 const prev=globalThis.fetch;let fetched=0;
 try{
  globalThis.fetch=async()=>{fetched++;return new Response(new Uint8Array(2000),{
   headers:{'Content-Type':'application/octet-stream'}})};
  const first=await loadNamedAsteroids(mock);
  assert.equal(first.failed.length,1);
  assert.equal(first.failed[0].name,'Psyche');
  assert.ok(unlinks>0,'Failed mounted Swiss binary must be removed before retry');
  assert.equal(files.has('/sweph/ast0/se00016s.se1'),false);
  rejected=false;
  const second=await loadNamedAsteroids(mock);
  assert.equal(second.failed.length,0);
  assert.equal(second.ready,56);
  assert.ok(files.has('/sweph/ast0/se00016s.se1'));
  assert.ok(fetched>=55);
 }finally{globalThis.fetch=prev}
});
