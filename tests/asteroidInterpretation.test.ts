import test from 'node:test';import assert from 'node:assert/strict';import {namedAsteroids} from '../src/asteroids.ts';import {meanings,asteroidReading,namedAsteroidContacts} from '../src/asteroidInterpretation.ts';
test('all 56 native named asteroids have distinct two-line interpretations and useful actions',()=>{
 assert.equal(namedAsteroids.length,56);
 for(const a of namedAsteroids){const c=meanings[a.name];assert.ok(c,'missing '+a.name);assert.ok(c.arTheme.length>16&&c.arAction.length>25);assert.ok(c.enTheme.length>10&&c.enAction.length>30);}
 assert.equal(new Set(Object.values(meanings).map(x=>x.arTheme)).size,56);
 assert.equal(new Set(Object.values(meanings).map(x=>x.arAction)).size,56);
});
test('actual extra named asteroid contacts are calculated rather than skipped by the core planet aspect registry',()=>{
 const d=new Date('2026-10-18T12:00:00Z');
 const a=namedAsteroidContacts([{id:'Eros',symbol:'✧',longitude:121,speed:.12}],[{id:'Venus',symbol:'♀',longitude:120,speed:0}],d);
 assert.ok(a.some(x=>x.transit.id==='Eros'&&x.natal.id==='Venus'&&x.angle===0));
 assert.ok(asteroidReading(namedAsteroids[0],a[0]).emphasis.includes('زهرتك'));
 assert.equal(namedAsteroidContacts([{id:'Eros',symbol:'✧',longitude:300,speed:0}],[{id:'Venus',symbol:'♀',longitude:10,speed:0}],d).length,0);
});
