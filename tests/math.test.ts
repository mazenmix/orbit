import test from 'node:test';import assert from 'node:assert/strict';
import {normalize,distance,aspects,signals,scores,synastry,compatibilityScore,compatibilityHasEvidence,houseNumber,bodies,angles,type Point} from '../src/math.ts';
import {birthInstant,zonedInstant,defaultProfile,julianDay,annualHouse} from '../src/engine.ts';
const point=(id:string,longitude:number,speed=1):Point=>({id,symbol:id,longitude,speed});
test('Swift normalization vectors and zodiac wraparound',()=>{assert.equal(normalize(-10),350);assert.equal(normalize(370),10);assert.equal(normalize(-720),0);assert.equal(distance(359,1),2);assert.equal(distance(0,180),180)});
test('Public demo epoch resolves to J2000 UTC',()=>{assert.equal(birthInstant(defaultProfile).toISOString(),'2000-01-01T12:00:00.000Z');assert.ok(Math.abs(julianDay(birthInstant(defaultProfile))-2451545)<1e-8)});
test('historical Baghdad summer offset and modern standard time',()=>{assert.equal(zonedInstant('1985-04-01T01:00','Asia/Baghdad').toISOString(),'1985-03-31T21:00:00.000Z');assert.equal(zonedInstant('2026-09-03T15:00','Asia/Baghdad').toISOString(),'2026-09-03T12:00:00.000Z')});
test('rejects nonexistent or ambiguous civil times instead of silently changing birth time',()=>{assert.throws(()=>zonedInstant('1985-04-01T00:30','Asia/Baghdad'));assert.throws(()=>zonedInstant('2026-11-01T01:30','America/New_York'))});
test('exact Sun trine: source weight formula, applying state and score',()=>{const e=aspects([point('Sun',120)],[point('Sun',0)],new Date('2026-01-01Z'));assert.equal(e.length,1);assert.equal(e[0].angle,120);assert.equal(e[0].orb,0);assert.ok(Math.abs(e[0].weight-.9616)<1e-12);assert.equal(e[0].applying,false);assert.equal(e[0].exact,null);const s=signals(e);assert.equal(s[0].tier,'A');assert.equal(s[0].tone,'opportunity');assert.equal(s[0].score,85);assert.equal(scores(s,10).overview,85);assert.equal(scores(s,10).career,50)});
test('instantaneous applying direction never fabricates an exact timestamp',()=>{const date=new Date('2026-01-01T00:00:00Z');const e=aspects([point('Sun',119,1)],[point('Sun',0)],date)[0];assert.equal(e.applying,true);assert.equal(e.exact,null);assert.equal(e.orb,1);assert.equal(aspects([point('Moon',1,13)],[point('Sun',0)],date).length,0)});
test('orb boundary included, just outside omitted; stationary body has no peak',()=>{const at=new Date();assert.equal(aspects([point('Moon',.8,0)],[point('Sun',0)],at).length,1);assert.equal(aspects([point('Moon',.80001,0)],[point('Sun',0)],at).length,0);assert.equal(aspects([point('Saturn',0,.001)],[point('Sun',0)],at)[0].exact,null)});
test('source synastry exact Venus/Mars trine vector',()=>{const evidence=synastry([point('Venus',0)],[point('Mars',120)]);assert.equal(evidence.length,1);assert.equal(evidence[0].influence,1);assert.equal(compatibilityScore('attraction',evidence),63);assert.equal(compatibilityScore('sexual',evidence),64);assert.equal(compatibilityScore('communication',evidence),50)});
test('Moon-Mars synastry contributes to sexual rubric with identical results in both profile directions',()=>{
 const forward=synastry([point('Moon',0)],[point('Mars',120)]);
 const reverse=synastry([point('Mars',120)],[point('Moon',0)]);
 assert.equal(forward.length,1);assert.equal(reverse.length,1);
 assert.equal(compatibilityHasEvidence('sexual',forward),true);
 assert.equal(compatibilityHasEvidence('sexual',reverse),true);
 assert.equal(compatibilityScore('sexual',forward),58);
 assert.equal(compatibilityScore('sexual',reverse),58);
});

test('cyclic unequal-house boundaries include start and exclude end',()=>{const cusps=[350,20,50,80,110,140,170,200,230,260,290,320];assert.equal(houseNumber(350,cusps),1);assert.equal(houseNumber(0,cusps),1);assert.equal(houseNumber(20,cusps),2);assert.equal(houseNumber(349,cusps),12)});
test('annual profection uses completed years at the birth-time anniversary',()=>{assert.equal(annualHouse(defaultProfile,new Date('2026-01-01T11:59:59Z')),2);assert.equal(annualHouse(defaultProfile,new Date('2026-01-01T12:00:00Z')),3)});

test('annual profection cannot create an unsupported category bonus',()=>{
 const empty=scores([],10);
 assert.equal(empty.career,50,'Without an aspect there is no career-specific signal to boost');
 const onlyLove=signals(aspects([point('Venus',120)],[point('Venus',0)],new Date('2026-01-01T00:00:00Z')));
 assert.ok(onlyLove.some(s=>s.category==='love'));
 assert.equal(scores(onlyLove,10).career,50,'Career stays at baseline even while another category has evidence');
 assert.equal(scores(onlyLove,7).love,Math.min(99,onlyLove.find(s=>s.category==='love')!.score+5));
});

test('relationship dimensions without a relevant close aspect have no claimed evidence',()=>{
 const contacts=synastry([point('Venus',0)],[point('Mars',120)]);
 assert.equal(compatibilityHasEvidence('attraction',contacts),true);
 assert.equal(compatibilityHasEvidence('sexual',contacts),true);
 assert.equal(compatibilityHasEvidence('communication',contacts),false);
 assert.equal(compatibilityHasEvidence('emotional',contacts),false);
 assert.equal(compatibilityHasEvidence('attraction',[]),false);
});

test('every configured wheel ephemeris body participates in five major transit aspects',()=>{
 const at=new Date('2026-10-25T09:00:00Z');
 assert.equal(bodies.length,16);
 assert.deepEqual([...angles],[0,60,90,120,180]);
 for(const [,id] of bodies)for(const angle of angles){
  const contacts=aspects([point(id,angle,.25)],[point('Sun',0,0)],at);
  assert.equal(contacts.length,1,id+' at '+angle+' degrees');
  assert.equal(contacts[0].angle,angle);
  assert.equal(contacts[0].orb,0);
  assert.equal(contacts[0].exact,null);
 }
});
test('all configured transiting bodies use measured orbs and direct versus retrograde approach',()=>{
 const at=new Date('2026-10-25T09:00:00Z');
 for(const [,id] of bodies){
  const direct=aspects([point(id,119.75,1)],[point('Venus',0,0)],at);
  const retro=aspects([point(id,119.75,-1)],[point('Venus',0,0)],at);
  assert.equal(direct.length,1,id+' direct');
  assert.equal(retro.length,1,id+' retrograde');
  assert.equal(direct[0].applying,true,id+' direct');
  assert.equal(retro[0].applying,false,id+' retrograde');
  assert.equal(direct[0].orb,.25);
  assert.equal(retro[0].orb,.25);
 }
});
