import test from 'node:test';
import assert from 'node:assert/strict';
import {eclipseEventPhase,eclipseEventBounds,eclipseEndHms,lunarSubpoint,lunarViewingCountries} from '../src/eclipseVisibility.ts';
const maximum=new Date('2027-02-06T16:00:00Z');
const event={maximum,contacts:{first:new Date('2027-02-06T13:00:00Z'),fourth:new Date('2027-02-06T19:00:00Z'),second:null,third:null}};
const start=+event.contacts.first,end=+event.contacts.fourth;
test('warning starts six hours before first contact, never six hours before maximum',()=>{
 assert.equal(eclipseEventPhase(event,start-21600001),'upcoming');
 assert.equal(eclipseEventPhase(event,start-21600000),'warning');
 assert.equal(eclipseEventPhase(event,start-1),'warning');
 assert.equal(eclipseEventPhase(event,start),'live');
 assert.equal(eclipseEventPhase(event,end-1),'live');
 assert.equal(eclipseEventPhase(event,end),'finished');
 assert.deepEqual(eclipseEventBounds(event),{start,end});
});
test('end countdown is real HMS, round up seconds to avoid premature zero',()=>{
 assert.deepEqual(eclipseEndHms(0,3661001),{hours:1,minutes:1,seconds:2});
 assert.deepEqual(eclipseEndHms(0,0),{hours:0,minutes:0,seconds:0});
});
test('Moon overhead point is finite and lunar viewing countries are bounded to visible high-elevation sky',()=>{
 const at=new Date('2027-02-20T23:13:00Z');
 const p=lunarSubpoint(at,151.2,3.7);
 assert.ok(p.lat>=-90&&p.lat<=90&&p.lon>=-180&&p.lon<=180);
 const countries=lunarViewingCountries(at,151.2,3.7);
 assert.ok(countries.length>0&&countries.length<=5);
 assert.ok(countries.every(c=>c.elevation>=25));
 assert.equal(new Set(countries.map(c=>c.region)).size,countries.length);
});
