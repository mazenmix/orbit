import test from 'node:test';import assert from 'node:assert/strict';
import {secondaryInstant,solarArcDegrees,directedNatal,solarReturnNear} from '../src/progressions.ts';
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
 const read=at=>[{id:'Sun',longitude:10+(+at-start)/86400000}];
 const when=solarReturnNear(new Date(start),12,read);
 assert.ok(when);
 assert.ok(Math.abs(+when!-(start+2*86400000))<60000);
});
test('invalid and prebirth progressions reject instead of inventing results',()=>{
 const b=new Date('2000-01-01T00:00:00Z');
 assert.throws(()=>secondaryInstant(b,new Date('1999-12-31T23:00:00Z')));
 assert.throws(()=>solarArcDegrees(NaN,90));
});
