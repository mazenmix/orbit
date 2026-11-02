import test from 'node:test';
import assert from 'node:assert/strict';
import SwissEph from 'swisseph-wasm';
import {chart,defaultProfile,setEngineForTests} from '../src/engine.ts';
import {exactCrossings,lunarWindow} from '../src/timing.ts';

const swiss=new SwissEph();
await swiss.initSwissEph();
setEngineForTests(swiss as any);
const read=(d:Date)=>chart(d,defaultProfile,false,false).points;
const UTC=(x:string)=>Date.parse(x);
const tolerance=3*60*1000;
function nearActual(actual:Date,reference:string,label:string){
 assert.ok(Number.isFinite(+actual));
 const delta=Math.abs(+actual-UTC(reference));
 assert.ok(delta<=tolerance,label+': actual '+actual.toISOString()+' differs by '+delta+'ms from independent Swiss Ephemeris reference '+reference);
}

test('independent 2026 reference: exact Moon–Jupiter and Moon–Venus events (UTC)',()=>{
 // Independent reference roots obtained from a separate Swiss Ephemeris
 // calculation (PySwissEph v2.10.03), not from these browser scanners.
 const from=new Date('2026-11-02T20:00:00Z'),to=new Date('2026-11-03T04:00:00Z');
 const jupiter=exactCrossings(read,'Moon','Jupiter',0,from,to,2);
 const venus=exactCrossings(read,'Moon','Venus',60,from,to,2);
 assert.equal(jupiter.length,1,'one exact Moon–Jupiter conjunction in the verified window');
 assert.equal(venus.length,1,'one exact Moon–Venus sextile in the verified window');
 nearActual(jupiter[0].time,'2026-11-02T22:50:34.107Z','Moon/Jupiter conjunction');
 nearActual(venus[0].time,'2026-11-03T00:10:29.891Z','Moon/Venus sextile');
});

test('independent 2026 reference: Moon Virgo ingress and VOC window are well ordered',()=>{
 const at=new Date('2026-11-03T07:00:00Z');
 const win=lunarWindow(at,read);
 assert.equal(win.sign,4,'Moon remains in Leo until the upcoming Virgo ingress');
 nearActual(win.ingressAt,'2026-11-03T08:27:45.062Z','Moon enters Virgo');
 assert.ok(+win.enteredAt<+at&&+at<+win.ingressAt);
 assert.ok(+win.vocStartsAt>=+win.enteredAt&&+win.vocStartsAt<=+win.ingressAt);
 for(const event of win.events){
  assert.ok(+event.time>=+win.enteredAt&&+event.time<=+win.ingressAt,
   'Lunar aspect must lie inside the exact Moon-sign window');
 }
});

test('geocentric tropical planetary longitudes do not change with a different observer city',()=>{
 const at=new Date('2026-11-03T00:00:00Z');
 const a=chart(at,defaultProfile,false,false).points;
 const b=chart(at,{...defaultProfile,lat:14.5995,lon:120.9842,zone:'Asia/Manila'},false,false).points;
 for(const planet of a){
  const other=b.find(x=>x.id===planet.id);
  assert.ok(other,planet.id+' body must persist across locations');
  assert.ok(Math.abs(planet.longitude-other.longitude)<1e-8,
   planet.id+' geocentric longitude should be location-independent');
 }
});
