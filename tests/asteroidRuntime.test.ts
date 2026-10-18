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
