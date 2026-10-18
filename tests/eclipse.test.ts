import test from 'node:test';import assert from 'node:assert/strict';
import {scanLunations} from '../src/eclipse.ts';
const start=new Date('2026-10-18T00:00:00Z'),D=86400000;
test('new/full Moon dates are rooted from real relative longitude, not approximated phase cycles',()=>{
 const read=(at:Date)=>({sunLongitude:50,moonLongitude:(+at-(+start))/D*10,moonLatitude:1.25});
 const phases=scanLunations(start,30,read);
 assert.deepEqual(phases.map(x=>x.phase),['new','full']);
 assert.ok(Math.abs(+phases[0].at-(+start+5*D))<60000);
 assert.ok(Math.abs(+phases[1].at-(+start+23*D))<60000);
 assert.ok(phases.every(x=>x.nearNode&&x.screeningThresholdDegrees===2));
});
test('lunation outside node proximity is not labelled an eclipse candidate',()=>{
 const r=scanLunations(start,10,at=>({sunLongitude:50,moonLongitude:(+at-(+start))/D*10,moonLatitude:4}));
 assert.equal(r[0].phase,'new');assert.equal(r[0].nearNode,false);
});
test('invalid ephemeris and huge scan range fail closed',()=>{
 assert.throws(()=>scanLunations(start,181,()=>({sunLongitude:0,moonLongitude:0,moonLatitude:0})));
 assert.throws(()=>scanLunations(start,3,()=>({sunLongitude:0,moonLongitude:NaN,moonLatitude:0})));
});
