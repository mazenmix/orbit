import test from 'node:test';
import assert from 'node:assert/strict';
import SwissEph from 'swisseph-wasm';
import {chart,defaultProfile,setEngineForTests} from '../src/engine.ts';

/** Distinct from fixed native reference vectors: property/invariant regression
 * across the ENTIRE advertised 1800–2399 support interval, including wrap
 * boundaries, cities/time zones, geocentric observer independence, and
 * numerical derivative consistency with Swiss-reported longitude velocity. */
const swe=new SwissEph();
await swe.initSwissEph();
setEngineForTests(swe as any);
const epochs=[
 '1800-01-05T12:00:00Z','1850-06-15T00:30:00Z',
 '1900-01-01T12:00:00Z','1950-04-20T07:45:00Z',
 '2000-01-01T12:00:00Z','2026-11-03T00:00:00Z',
 '2030-06-15T18:30:00Z','2100-10-15T12:00:00Z',
 '2200-07-04T02:10:00Z','2399-12-20T23:00:00Z'
];
const cities=[
 {...defaultProfile,lat:33.3152,lon:44.3661,zone:'Asia/Baghdad',city:'Baghdad'},
 {...defaultProfile,lat:14.5995,lon:120.9842,zone:'Asia/Manila',city:'Manila'},
 {...defaultProfile,lat:39.7392,lon:-104.9903,zone:'America/Denver',city:'Denver'}
];
const delta=(a:number,b:number)=>((a-b+540)%360)-180;
test('all principal ephemeris bodies are finite and consistent in 10 historical/future epochs and 3 cities',()=>{
 for(const iso of epochs){
  const time=new Date(iso);
  const baseline=chart(time,cities[0],false,false);
  assert.equal(baseline.points.length,10,'all ten principal bodies '+iso);
  assert.deepEqual(baseline.missing,[],'missing core bodies '+iso);
  for(const p of baseline.points){
   assert.ok(Number.isFinite(p.longitude)&&p.longitude>=0&&p.longitude<360,p.id+' longitude at '+iso);
   assert.ok(Number.isFinite(p.speed),p.id+' velocity at '+iso);
  }
  for(const city of cities.slice(1)){
   const other=chart(time,city,false,false);
   for(const p of baseline.points){
    const match=other.points.find(x=>x.id===p.id);
    assert.ok(match,p.id+' missing in '+city.city+' '+iso);
    assert.ok(Math.abs(delta(match.longitude,p.longitude))<1e-7,p.id+' geocentric location invariance '+iso);
    assert.ok(Math.abs(match.speed-p.speed)<1e-7,p.id+' velocity invariance '+iso);
   }
  }
 }
});
test('Swiss longitude velocities agree with centered numerical differences over 1800–2399',()=>{
 for(const iso of epochs){
  const t=Date.parse(iso),hour=3600000;
  const before=chart(new Date(t-hour),defaultProfile,false,false).points;
  const now=chart(new Date(t),defaultProfile,false,false).points;
  const after=chart(new Date(t+hour),defaultProfile,false,false).points;
  for(const body of now){
   const b=before.find(p=>p.id===body.id)!,a=after.find(p=>p.id===body.id)!;
   const measured=12*delta(a.longitude,b.longitude);
   assert.ok(Math.abs(measured-body.speed)<.12,
    body.id+' at '+iso+': finite-difference speed '+measured+' vs Swiss '+body.speed);
  }
 }
});
test('invalid out-of-support epochs fail closed, not fabricate planetary coordinates',()=>{
 for(const iso of ['1799-12-31T23:59:00Z','2400-01-01T00:00:00Z'])
  assert.throws(()=>chart(new Date(iso),defaultProfile,false,false),/Supported dates/);
});
