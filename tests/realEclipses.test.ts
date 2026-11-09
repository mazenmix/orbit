import test from 'node:test';import assert from 'node:assert/strict';
import SwissEph from 'swisseph-wasm';
import {calculateEclipses,eclipseType,jdToDate,type EclipseAPI} from '../src/realEclipses.ts';
const ORIGIN=2440587.5;const jd=(iso:string)=>Date.parse(iso)/86400000+ORIGIN;
const mock:EclipseAPI={
 sol_eclipse_when_glob(start){const first=jd('2027-02-06T16:00:00Z');const next=first+177;const peak=start<first?first:next;return {retFlag:8,tret:[peak,0,peak-.1,peak+.1,peak-.04,peak+.04,0,0,0,0]}},
 lun_eclipse_when(start){const first=jd('2027-02-20T23:00:00Z');const peak=start<first?first:first+178;return {retFlag:64,tret:[peak,0,peak-.08,peak+.08,0,0,peak-.12,peak+.12,0,0]}},
 sol_eclipse_when_loc(start,flags,location){const target=jd('2027-02-06T16:10:00Z');return {retFlag:8,tret:[start<target?target:target+177],attr:[0]}},
 lun_eclipse_when_loc(start,flags,location){const target=jd('2027-02-20T23:05:00Z');return {retFlag:64,tret:[start<target?target:target+178],attr:[0]}}
};
test('solar/lunar Swiss eclipse routines drive actual search with UTC global maximum',()=>{
 const events=calculateEclipses(mock,new Date('2026-10-18T00:00:00Z'),1);
 assert.equal(events.length,2);assert.deepEqual(events.map(x=>x.kind),['solar','lunar']);
 assert.equal(events[0].type,'annular');assert.equal(events[1].type,'penumbral');
 assert.ok(Math.abs(+events[0].maximum-Date.parse('2027-02-06T16:00:00Z'))<1000);
});
test('optional local maximum is accepted only for matching global event',()=>{
 const events=calculateEclipses(mock,new Date('2026-10-18T00:00:00Z'),1,{lat:33.3,lon:44.4},true);
 assert.ok(events.every(x=>x.local?.visible));assert.equal(events[0].local?.location.lon,44.4);
});
test('global event stays independent of observer and local searches are not performed by default',()=>{
 const events=calculateEclipses(mock,new Date('2026-10-18T00:00:00Z'),1,{lat:33.3,lon:44.4});
 assert.equal(events[0].local,null);
});
test('eclipse flag types and invalid geometries reject',()=>{
 assert.equal(eclipseType(4|1),'total');assert.equal(eclipseType(32),'hybrid');assert.equal(eclipseType(16),'partial');
 assert.throws(()=>calculateEclipses(mock,new Date('2026-10-18T00:00:00Z'),13));
 assert.throws(()=>calculateEclipses(mock,new Date('2026-10-18T00:00:00Z'),1,{lat:100,lon:0}));
 assert.throws(()=>jdToDate(NaN));
});
test('real Swiss WASM local visibility methods retain their owning instance',async()=>{
 const swiss=new SwissEph();await swiss.initSwissEph();
 const events=calculateEclipses(swiss as any,new Date('2026-11-09T12:00:00Z'),1,{lat:33.3152,lon:44.3661},true);
 assert.equal(events.length,2);
 assert.ok(events.every(e=>e.local!==null&&typeof e.local.visible==='boolean'));
 for(const e of events){
  if(e.local!.visible)assert.ok(e.local!.maximum&&Math.abs(+e.local!.maximum-+e.maximum)<86400000);
  else assert.equal(e.local!.maximum,null);
 }
});
test('failed local ephemeris is not misreported as a non-visible eclipse',()=>{
 for(const failure of [null,{retFlag:-1,tret:[],attr:[]},{retFlag:8,tret:[NaN],attr:[]}]){
  const bad={...mock,sol_eclipse_when_loc:()=>failure};
  assert.throws(()=>calculateEclipses(bad,new Date('2026-11-09T00:00:00Z'),1,{lat:33,lon:44},true),/Local eclipse calculation unavailable/);
 }
});
