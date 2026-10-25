import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {namedAsteroids} from '../src/asteroids.ts';
import {asteroidReading,namedAsteroidContacts} from '../src/asteroidInterpretation.ts';
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

test('corrupt, duplicate or stale asteroid evidence cannot produce a narrative',()=>{
 const Eros=body('Eros');
 const Sun=body('Sun');
 const at=new Date('2026-10-25T00:00:00Z');
 assert.throws(()=>namedAsteroidContacts([{...Eros,longitude:NaN}],[Sun],at),/Invalid named asteroid/);
 assert.throws(()=>namedAsteroidContacts([Eros],[{...Sun,speed:Infinity}],at),/Invalid named asteroid/);
 assert.throws(()=>namedAsteroidContacts([Eros,Eros],[Sun],at),/Duplicate ephemeris/);
 assert.throws(()=>namedAsteroidContacts([Eros],[Sun,Sun],at),/Duplicate ephemeris/);
 assert.throws(()=>namedAsteroidContacts([Eros],[Sun],new Date(NaN)),/Invalid named asteroid/);
});

test('six built-in minor natal targets have authored descriptions for named-asteroid interpretations',()=>{
 const minor=['Chiron','Ceres','Pallas','Juno','Vesta','Pholus'];
 const eros=namedAsteroids.find(a=>a.name==='Eros')!;
 for(const target of minor){
  const e=namedAsteroidContacts([body('Eros')],[body(target)],new Date('2026-10-25T00:00:00Z'))[0];
  assert.ok(e,target);
  const ar=asteroidReading(eros,e,false),en=asteroidReading(eros,e,true);
  assert.match(ar.emphasis,/هالمعنى يرتبط بموضوع/);
  assert.doesNotMatch(ar.emphasis,/بموضوع أولوياتك/);
  assert.doesNotMatch(en.emphasis,/a natal priority/);
 }
});
test('asteroid UI uses complete supplemental targets and shows both birth and selected-time longitudes',()=>{
 const ui=readFileSync('src/main.ts','utf8');
 const part=ui.slice(ui.indexOf('function asteroidsPage(){'),ui.indexOf('const eclipseCountryNames=',ui.indexOf('function asteroidsPage(){')));
 assert.match(part,/\.\.\.data!\.supplementalNatal/);
 assert.match(part,/\.\.\.data!\.auxiliaryNatal/);
 assert.doesNotMatch(part,/contacts\.slice\(0,60\)/);
 assert.match(part,/natalAsteroidsForActive\(\)/);
 assert.match(part,/natalPoint\.longitude/);
});
