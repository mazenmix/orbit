import test from 'node:test';import assert from 'node:assert/strict';
import {secondaryInstant,solarArcDegrees,directedNatal,solarReturnNear,anniversaryInstant} from '../src/progressions.ts';
test('secondary progression advances one ephemeris day per 365.2422 lived days',()=>{
 const born=new Date('1985-03-29T16:20:00Z');
 const r=secondaryInstant(born,new Date(+born+365.2422*86400000));
 assert.ok(Math.abs(r.ageYears-1)<1e-9);
 assert.ok(Math.abs(+r.ephemerisTime-(+born+86400000))<10);
});
test('solar arc direction wraps the zodiac without altering the natal record',()=>{
 const p=[{id:'Sun',symbol:'☉',longitude:355,speed:1}];
 const advanced=directedNatal(p,solarArcDegrees(355,6));
 assert.equal(advanced[0].longitude,6);
 assert.equal(advanced[0].speed,0);
 assert.equal(p[0].longitude,355);
});
test('solar return root follows Sun crossing natal solar longitude',()=>{
 const start=Date.parse('2026-03-29T00:00:00Z');
 const read=(at:Date)=>[{id:'Sun',longitude:10+(+at-start)/86400000}];
 const when=solarReturnNear(new Date(start),12,read);
 assert.ok(when);
 assert.ok(Math.abs(+when!-(start+2*86400000))<60000);
});
test('invalid and prebirth progressions reject instead of inventing results',()=>{
 const b=new Date('2000-01-01T00:00:00Z');
 assert.throws(()=>secondaryInstant(b,new Date('1999-12-31T23:00:00Z')));
 assert.throws(()=>solarArcDegrees(NaN,90));
});
test('solar-return anniversary respects local birthday across UTC year boundaries',()=>{
 assert.equal(anniversaryInstant(new Date('1999-12-31T16:30:00Z'),2026,'Asia/Manila').toISOString(),'2025-12-31T16:30:00.000Z');
 assert.equal(anniversaryInstant(new Date('2001-01-01T09:30:00Z'),2026,'Pacific/Honolulu').toISOString(),'2027-01-01T09:30:00.000Z');
 assert.equal(anniversaryInstant(new Date('2000-02-29T12:00:00Z'),2026,'Etc/UTC').toISOString(),'2026-02-28T12:00:00.000Z');
 assert.throws(()=>anniversaryInstant(new Date(),2400,'Etc/UTC'),/Invalid anniversary/);
});
