import test from 'node:test';import assert from 'node:assert/strict';import SwissEph from 'swisseph-wasm';
import {calculateEclipses} from '../src/realEclipses.ts';
const swe=new SwissEph();await swe.initSwissEph();
test('Swiss ephemeris finds NASA 2027 February annular solar eclipse',()=>{
 const events=calculateEclipses(swe,new Date('2026-10-18T00:00:00Z'),1);
 const solar=events.find(x=>x.kind==='solar')!,lunar=events.find(x=>x.kind==='lunar')!;
 assert.ok(solar);assert.ok(lunar);
 assert.equal(solar.type,'annular');assert.equal(lunar.type,'penumbral');
 const expected=Date.parse('2027-02-06T16:00:00Z');
 assert.ok(Math.abs(+solar.maximum-expected)<90*60000,'solar maximum '+solar.maximum.toISOString());
 assert.ok(Math.abs(+lunar.maximum-Date.parse('2027-02-20T23:13:00Z'))<90*60000,'lunar max '+lunar.maximum.toISOString());
});
test('actual global solar eclipse geometry supplies valid greatest-eclipse coordinates',()=>{
 const data=calculateEclipses(swe,new Date('2026-10-18T00:00:00Z'),1);
 const sol=data.find(x=>x.kind==='solar')!;
 assert.ok(sol.globalCoordinates);
 assert.ok(Math.abs(sol.globalCoordinates!.lon)<=180&&Math.abs(sol.globalCoordinates!.lat)<=90);
});
