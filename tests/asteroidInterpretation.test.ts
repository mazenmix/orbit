import test from 'node:test';import assert from 'node:assert/strict';import {namedAsteroids} from '../src/asteroids.ts';import {meanings,asteroidReading,currentAsteroidReading,namedAsteroidContacts} from '../src/asteroidInterpretation.ts';
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

test('catalogue themes do not issue individualized advice without an exact computed contact',()=>{
 const entry=namedAsteroids.find(x=>x.name==='Eros')!;
 const generic=asteroidReading(entry,undefined);
 assert.equal(generic.action,'');
 assert.match(generic.emphasis,/ماكو اتصال ولادي قريب/);
 const contact=namedAsteroidContacts([{id:'Eros',symbol:'✧',longitude:121,speed:.12}],[{id:'Venus',symbol:'♀',longitude:120,speed:0}],new Date('2026-10-18T12:00:00Z'))[0];
 assert.ok(contact);
 assert.ok(asteroidReading(entry,contact).action.length>15);
});

test('current asteroid cards distinguish verified positions, natal aspects and missing files',()=>{
 const item=namedAsteroids.find(x=>x.name==='Eros')!;
 const position={id:'Eros',symbol:'✧',longitude:121,speed:.12};
 const at=new Date('2026-10-25T11:00:00Z');
 const noContact=currentAsteroidReading(item,position,undefined);
 assert.match(noContact.theme,/الأسد|°/);
 assert.match(noContact.action,/ماكو اتصال قريب/);
 const closest=namedAsteroidContacts([position],[{id:'Venus',symbol:'♀',longitude:120,speed:0}],at)[0];
 const personalized=currentAsteroidReading(item,position,closest);
 assert.match(personalized.emphasis,/زهرتك/);
 assert.ok(personalized.action.length>15);
 const noFile=currentAsteroidReading(item,undefined,undefined);
 assert.match(noFile.theme,/غير محسوب/);
 assert.equal(noFile.action,'');
 assert.match(currentAsteroidReading(item,position,closest,true).theme,/Leo/);
});

test('asteroid zodiac wording is natural Iraqi Arabic without duplicated article',()=>{
 const asteroid=namedAsteroids.find(item=>item.name==='Eros')!;
 const ar=currentAsteroidReading(asteroid,{id:'Eros',symbol:'✧',longitude:259.44,speed:.1},undefined);
 assert.match(ar.theme,/بالقوس/);
 assert.doesNotMatch(ar.theme,/بالـالقوس/);
});

test('asteroid contacts display only precise unique evidence, never repeated generic analysis',()=>{
 const date=new Date('2026-11-02T18:00:00Z');
 const a=namedAsteroids.find(item=>item.name==='Psyche')!;
 const contact=namedAsteroidContacts([{id:a.name,symbol:'✧',longitude:120.1,speed:.12}],
  [{id:'MC',symbol:'MC',longitude:120,speed:0}],date)[0];
 assert.ok(contact);
 const row=asteroidReading(a,contact);
 assert.match(row.emphasis,/Psyche/);
 assert.match(row.emphasis,/مهنتك/);
 assert.match(row.emphasis,/فارق 0.10°/);
 assert.doesNotMatch(row.emphasis,/تعاون أسهل بين|جرّب خطوة محددة|هالمعنى يرتبط بموضوع/);
 assert.ok(row.action.length>20);
});

test('named asteroid contact scanner rejects corrupted and duplicated coordinates instead of fabricating an aspect',()=>{
 const at=new Date('2026-11-02T18:00:00Z');
 const asteroid={id:'Eros',symbol:'✧',longitude:120,speed:.1};
 const natal={id:'Venus',symbol:'♀',longitude:120,speed:0};
 assert.throws(()=>namedAsteroidContacts([{...asteroid,longitude:NaN}],[natal],at),/Invalid or repeated asteroid/);
 assert.throws(()=>namedAsteroidContacts([asteroid],[{...natal,longitude:NaN}],at),/Invalid or repeated natal/);
 assert.throws(()=>namedAsteroidContacts([asteroid,asteroid],[natal],at),/repeated asteroid/);
 assert.throws(()=>namedAsteroidContacts([asteroid],[natal,natal],at),/repeated natal/);
 assert.throws(()=>namedAsteroidContacts([asteroid],[natal],new Date(NaN)),/Invalid asteroid contact instant/);
 assert.ok(namedAsteroidContacts([asteroid],[natal],at).some(e=>e.angle===0&&e.orb===0));
});
