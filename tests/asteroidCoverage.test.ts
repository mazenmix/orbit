import test from 'node:test';
import assert from 'node:assert/strict';
import {namedAsteroids} from '../src/asteroids.ts';
import {namedAsteroidContacts} from '../src/asteroidInterpretation.ts';
import type {Point} from '../src/math.ts';

const body=(id:string,longitude=0):Point=>({id,longitude,speed:1,symbol:'✧'});
test('complete 56-body calculated set is not silently truncated at 100 factors',()=>{
 const transits=namedAsteroids.map(x=>body(x.name));
 const natal=['Sun','Moon','Mercury'].map(x=>body(x));
 const all=namedAsteroidContacts(transits,natal,new Date('2026-10-25T00:00:00Z'));
 assert.equal(all.length,56*3);
 assert.equal(new Set(all.map(e=>e.transit.id)).size,56);
 assert.ok(all.some(e=>e.transit.id===namedAsteroids.at(-1)!.name));
 assert.ok(all.every(e=>e.angle===0&&e.orb===0));
});
