import test from 'node:test';import assert from 'node:assert/strict';import SwissEph from 'swisseph-wasm';
import {mountAsteroid,namedAsteroidPositions,type AsteroidSwiss} from '../src/asteroidRuntime.ts';
import {namedAsteroids} from '../src/asteroids.ts';
const run=process.env.MX_ORBIT_LIVE_TEST==='1'?test:test.skip;
run('live MX Orbit SE1 proxy and Swiss WASM perform actual asteroid calculations',async()=>{
 const swe=new SwissEph();await swe.initSwissEph();const runtime=swe as unknown as AsteroidSwiss;
 const samples=process.env.MX_ORBIT_LIVE_FULL==='1'?namedAsteroids:namedAsteroids.filter(x=>[433,16].includes(x.number));
 const failed:string[]=[];
 for(let i=0;i<samples.length;i+=4){
  await Promise.all(samples.slice(i,i+4).map(async body=>{
   try{
    const res=await fetch('https://mxastro.pages.dev/api/asteroid?number='+body.number,{signal:AbortSignal.timeout(25000)});
    if(!res.ok)throw Error('HTTP '+res.status);
    if(!res.headers.get('content-type')?.includes('application/octet-stream'))throw Error('Not binary SE1');
    const bytes=new Uint8Array(await res.arrayBuffer());if(bytes.length<1000)throw Error('Short SE1 data');
    mountAsteroid(runtime,body.number,bytes);
   }catch(e){failed.push(body.name+' MPC '+body.number+': '+String(e))}
  }));
  if(process.env.MX_ORBIT_LIVE_FULL==='1')console.log('Mounted batch '+(i+1)+'..'+Math.min(i+4,samples.length)+' of '+samples.length);
 }
 const at=new Date('2026-10-18T10:00:00Z'),future=new Date('2027-10-18T10:00:00Z');
 const current=new Map(namedAsteroidPositions(runtime,at).map(x=>[x.id,x]));
 const later=new Map(namedAsteroidPositions(runtime,future).map(x=>[x.id,x]));
 for(const item of samples){
  const a=current.get(item.name),b=later.get(item.name);
  if(!a||!b)failed.push(item.name+': invalid Swiss longitude at 2026/2027');
  else if(!Number.isFinite(a.longitude)||!Number.isFinite(b.longitude)||a.longitude===b.longitude)failed.push(item.name+': invalid or frozen ephemeris');
 }
 assert.deepEqual(failed,[],'Real SE1 downloads and positions failed: '+failed.join(' | '));
 console.log('Live numbered asteroid ephemerides verified: '+samples.length+' of '+samples.length);
});
