import test from 'node:test';
import assert from 'node:assert/strict';
import SwissEph from 'swisseph-wasm';
import {calendarMomentEvidence,calendarDaySynthesis,calendarColorForScore,CALENDAR_SAMPLE_HOURS} from '../src/astroCalendar.ts';
import {chart,report,setEngineForTests,zonedInstant,localValue,defaultProfile} from '../src/engine.ts';
import {distance} from '../src/math.ts';
const bodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const vec=(lon:number,speed=1)=>({points:bodies.map((id,i)=>({id,symbol:'◉',longitude:(lon+i*9)%360,speed}))});
const known={...defaultProfile,id:'audit',name:'Audit',date:'1985-03-29',time:'19:20',zone:'Asia/Baghdad',lat:33.3,lon:44.4,city:'Baghdad',known:true};
const swe=new SwissEph();await swe.initSwissEph();setEngineForTests(swe as any);
test('real Swiss ephemeris returns complete and valid vectors at 04/12/20 local time',()=>{
 const when='2027-03-14',samples=CALENDAR_SAMPLE_HOURS.map(hour=>{
  const local=when+'T'+String(hour).padStart(2,'0')+':00';
  const at=zonedInstant(local,known.zone);
  assert.equal(localValue(at,known.zone).slice(0,16),local);
  const natal=chart(zonedInstant(known.date+'T'+known.time,known.zone),known);
  const current=chart(at,known,false,false);
  const contacts=calendarMomentEvidence(current,natal,at,true);
  assert.equal(current.points.length,10);
  assert.ok(contacts.length>0);
  for(const e of contacts){
   assert.ok(e.orb<=e.maximumOrb);
   assert.ok(Math.abs(e.orb-Math.abs(distance(e.transit.longitude,e.natal.longitude)-e.angle))<1e-10);
   assert.equal(e.exact,null,'linear exact timestamp is NOT mistaken for a computed crossing');
   assert.ok(Number.isFinite(e.weight));
  }
  return {hour,evidence:contacts};
 });
 const r=calendarDaySynthesis(samples);
 assert.equal(r.sampleScores.length,3);
 assert.equal(r.sampleHours.join(','),'4,12,20');
 assert.equal(r.minimum,Math.min(...r.sampleScores));
 assert.equal(r.maximum,Math.max(...r.sampleScores));
 assert.equal(r.value,Math.round(r.sampleScores.reduce((a,b)=>a+b)/3));
 assert.equal(r.color,calendarColorForScore(r.value));
 assert.ok(r.value>=1&&r.value<=99);
});
test('unknown birth time never introduces fictitious natal Moon or ascendant',()=>{
 const p={...known,known:false};
 const birth=chart(zonedInstant(p.date+'T12:00',p.zone),p);
 const now=new Date('2027-10-18T11:00:00Z');
 const contacts=calendarMomentEvidence(chart(now,p,false,false),birth,now,false);
 assert.ok(contacts.length>0);
 assert.ok(contacts.every(e=>!['Moon','Ascendant','MC'].includes(e.natal.id)));
 assert.ok(chart(now,p,false,false).points.some(e=>e.id==='Moon')); // A transiting Moon need not aspect a natal planet at every instant.
});
test('planetary omissions and corrupt coordinates fail closed instead of making false lucky days',()=>{
 const at=new Date('2027-11-01T06:00:00Z'),natal=vec(3),now=vec(1);
 assert.throws(()=>calendarMomentEvidence({...now,points:now.points.slice(1)},natal,at,true),/Missing required/);
 assert.throws(()=>calendarMomentEvidence({...now,points:[...now.points,{...now.points[0]}]},natal,at,true),/Duplicate/);
 assert.throws(()=>calendarMomentEvidence({...now,points:now.points.map(p=>p.id==='Moon'?{...p,speed:NaN}:p)},natal,at,true),/Invalid ephemeris/);
 assert.throws(()=>calendarMomentEvidence(now,{...natal,points:natal.points.filter(p=>p.id!=='Venus')},at,true),/Missing required/);
 assert.doesNotThrow(()=>calendarMomentEvidence({...now,points:[...now.points,{id:'Ceres',longitude:NaN,speed:NaN,symbol:'x'}]},natal,at,true));
});
test('full contact vector has no 48-item truncation from generic report engine',()=>{
 const at=new Date('2027-01-01T06:00:00Z');
 const natal={points:bodies.map(id=>({id,symbol:'◉',longitude:100,speed:0}))};
 const transits={points:bodies.map(id=>({id,symbol:'◉',longitude:100.1,speed:1}))};
 const all=calendarMomentEvidence(transits,natal,at,false);
 assert.ok(all.length>48,'each major transit contributes all eligible natal aspects, without top-48 truncation');
 assert.ok(all.every(x=>x.natal.id!=='Moon'));
});
test('lunar applying direction near exact contact uses one minute, not 6h overshoot',()=>{
 const at=new Date('2027-04-01T09:00:00Z');
 const natal=vec(0);const current=vec(39);
 const target={...natal,points:natal.points.map(p=>p.id==='Sun'?{...p,longitude:0}:p)};
 const transit={...current,points:current.points.map(p=>p.id==='Moon'?{...p,longitude:359.8,speed:13}:p)};
 const contact=calendarMomentEvidence(transit,target,at,true).find(e=>e.transit.id==='Moon'&&e.natal.id==='Sun'&&e.angle===0);
 assert.ok(contact);
 assert.equal(contact.applying,true);
});
test('retrograde bodies use the direction of actual signed velocity',()=>{
 const at=new Date('2027-06-05T09:00:00Z');
 const c={...vec(60),points:vec(60).points.map(p=>p.id==='Venus'?{...p,longitude:.2,speed:-.4}:p)};
 const natal={...vec(0),points:vec(0).points.map(p=>p.id==='Sun'?{...p,longitude:0}:p)};
 const e=calendarMomentEvidence(c,natal,at,true).find(x=>x.transit.id==='Venus'&&x.natal.id==='Sun'&&x.angle===0);
 assert.ok(e);
 assert.equal(e.applying,true);
});
test('DST transition dates retain genuine local sampling on both sides of leap seconds and DST',()=>{
 for(const [date,zone] of [['2027-03-14','America/Denver'],['2027-11-07','America/Denver'],['2028-02-29','Asia/Baghdad'],['2028-04-02','Australia/Sydney']]){
  const stamps=CALENDAR_SAMPLE_HOURS.map(hour=>{
   const local=date+'T'+String(hour).padStart(2,'0')+':00';
   const t=zonedInstant(local,zone);
   assert.equal(localValue(t,zone).slice(0,16),local);
   return +t;
  });
  assert.ok(stamps[0]<stamps[1]&&stamps[1]<stamps[2]);
 }
});
test('no partial multi-sample days or fabricated outcome when any sample is missing',()=>{
 const sample=[{hour:4,evidence:[]},{hour:12,evidence:[]},{hour:20,evidence:[]}];
 const r=calendarDaySynthesis(sample);
 assert.deepEqual(r.sampleScores,[50,50,50]);assert.equal(r.value,50);
 assert.equal(r.minimum,50);assert.equal(r.maximum,50);
 assert.equal(r.strongestSupport,null);assert.equal(r.strongestChallenge,null);
 assert.throws(()=>calendarDaySynthesis(sample.slice(1)),/Incomplete/);
 assert.throws(()=>calendarDaySynthesis([{hour:12,evidence:[]},sample[0],sample[2]]),/Incomplete/);
});
