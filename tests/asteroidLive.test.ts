import test from 'node:test';import assert from 'node:assert/strict';import SwissEph from 'swisseph-wasm';
import {mountAsteroid,namedAsteroidPositions,type AsteroidSwiss} from '../src/asteroidRuntime.ts';
const run=process.env.MX_ORBIT_LIVE_TEST==='1'?test:test.skip;
run('remote public MX Orbit proxy returns valid Swiss Eros/Psyche SE1 data that computes actual positions',async()=>{
 const swe=new SwissEph();await swe.initSwissEph();const runtime=swe as unknown as AsteroidSwiss;
 const samples=[{number:433,name:'Eros'},{number:16,name:'Psyche'}];
 for(const body of samples){
  const res=await fetch('https://mxastro.pages.dev/api/asteroid?number='+body.number,{signal:AbortSignal.timeout(20000)});
  assert.equal(res.status,200,'HTTP for '+body.name);
  assert.match(res.headers.get('content-type')??'',/application\/octet-stream/);
  const bytes=new Uint8Array(await res.arrayBuffer());
  assert.ok(bytes.length>1000,'genuine SE1 file '+body.name);
  mountAsteroid(runtime,body.number,bytes);
  const now=namedAsteroidPositions(runtime,new Date('2026-10-18T10:00:00Z')).find(p=>p.id===body.name);
  assert.ok(now,'calculated '+body.name+' using mounted real ephemeris');
  assert.ok(Number.isFinite(now.longitude)&&now.longitude>=0&&now.longitude<360);
  const yearLater=namedAsteroidPositions(runtime,new Date('2027-10-18T10:00:00Z')).find(p=>p.id===body.name);
  assert.ok(yearLater,'future real coordinate '+body.name);
  assert.notEqual(now.longitude,yearLater.longitude,'positions move with time');
 }
});
