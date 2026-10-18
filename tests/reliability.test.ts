import test from 'node:test';
import assert from 'node:assert/strict';
import SwissEph from 'swisseph-wasm';
import {aspects,scores,signals,type Evidence,type Point} from '../src/math.ts';
import {chart,report,defaultProfile,setEngineForTests,birthInstant,annualHouse} from '../src/engine.ts';
import {calendarMomentEvidence,astroCalendarDays} from '../src/astroCalendar.ts';
import {narrativeEvidence} from '../src/narrativeEvidence.ts';
const at=new Date('2026-10-19T00:00:00Z');
const p=(id:string,longitude:number,speed=1):Point=>({id,longitude,speed,symbol:id});
const sw=new SwissEph();await sw.initSwissEph();
setEngineForTests(sw as any);

test('Moon near exact contact and retrograde transit cannot overshoot into a false separating label',()=>{
 for(const [id,lon,speed] of [['Moon',359.98,13],['Moon',119.98,14],['Venus',.001,-.4],['Saturn',90.0001,-.001]] as const){
  const e=aspects([p(id,lon,speed)],[p('Sun',0)],at)[0];
  assert.ok(e);assert.equal(e.applying,true,id);assert.equal(e.exact,null);
 }
 assert.equal(aspects([p('Moon',.02,13)],[p('Sun',0)],at)[0].applying,false);
 assert.equal(aspects([p('Saturn',.02,0)],[p('Sun',0)],at)[0].applying,false);
});
test('actual ephemeris applying direction agrees between calendar and report at twelve monthly snapshots',()=>{
 for(let month=0;month<12;month++){
  const time=new Date(Date.UTC(2027,month,15,9));
  const r=report(defaultProfile,time);
  const calendar=calendarMomentEvidence(r.current,r.natal,time,true);
  for(const e of calendar){
   const same=r.evidence.find(v=>v.id===e.id);assert.ok(same,e.id);
   assert.equal(same.applying,e.applying);assert.equal(same.orb,e.orb);
   const next=chart(new Date(+time+1000),defaultProfile,false,false).points.find(v=>v.id===e.transit.id)!;
   const actual=aspects([next],[e.natal],new Date(+time+1000)).find(v=>v.id===e.id);
   if(actual&&Math.abs(actual.orb-e.orb)>1e-9)assert.equal(e.applying,actual.orb<e.orb,e.id+' '+time.toISOString());
  }
 }
});
test('all eligible contacts survive beyond the former global top-48 cutoff',()=>{
 const names=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
 const evidence=aspects(names.map(id=>p(id,.1)),names.map(id=>p(id,0)),at);
 assert.equal(evidence.length,100);
});
test('calculated contacts reject nonfinite inputs before they can contaminate scores',()=>{
 assert.throws(()=>aspects([p('Venus',NaN)],[p('Sun',0)],at),/Invalid/);
 assert.throws(()=>aspects([p('Venus',0,NaN)],[p('Sun',0)],at),/Invalid/);
 assert.throws(()=>aspects([p('Venus',0)],[p('Sun',0)],new Date(NaN)),/Invalid/);
});
const f=(id:string,weight:number,angle=120):Evidence=>({id,transit:p('Venus',0),natal:p('Sun',0),angle,orb:.2,maximumOrb:1.4,weight,applying:true,exact:null});
test('narrative and domain signals preserve the strongest counter-evidence below many supporting contacts',()=>{
 const support=Array.from({length:15},(_,i)=>f('support-'+i,.99-i*.01));
 const challenge={...f('counter',.7,90),transit:p('Saturn',90)};
 const all=[...support,challenge];
 const packet=narrativeEvidence(all);assert.equal(packet.length,12);
 assert.ok(packet.some(e=>e.id==='counter'));
 const signal=signals(all).find(s=>s.category==='career')!;
 assert.equal(signal.factors.length,4);assert.ok(signal.factors.some(e=>e.id==='counter'));
 assert.deepEqual(narrativeEvidence([...all].reverse()),packet);
 assert.equal(new Set(packet.map(e=>e.id)).size,packet.length);
});
test('no fabricated profection bonus for unknown birth time, unavailable angles or pre-birth instants',()=>{
 assert.ok(Object.values(scores([],0)).every(v=>v===50));
 const unknown={...defaultProfile,known:false};
 assert.equal(annualHouse(unknown,at),0);assert.equal(report(unknown,at).house,0);
 assert.equal(annualHouse(defaultProfile,new Date(+birthInstant(defaultProfile)-1)),0);
 assert.equal(report({...defaultProfile,lat:80},at).house,0);
});
test('calendar anniversary from leap day stops at constrained Feb 28, without a spurious March day',()=>{
 const days=astroCalendarDays('2028-02-29');assert.equal(days.length,365);
 assert.equal(days.at(-1)?.iso,'2029-02-27');
});

// Simulated upstream faults must fail closed. Restore the real engine even if
// an assertion fails, so unrelated real ephemeris checks stay meaningful.
const fake=(override:Record<string,unknown>={})=>({calc_ut:()=>new Float64Array([10,0,1,1,0,0]),houses:()=>({cusps:[0,...Array.from({length:12},(_,i)=>i*30)],ascmc:[0,90]}),...override}) as any;
test('missing or corrupt required planet prevents every report instead of a plausible partial score',()=>{
 for(const mode of ['throw','speed','longitude']){
  setEngineForTests(fake({calc_ut:(_jd:number,id:number)=>{
   if(id===3){if(mode==='throw')throw Error('No Venus data');return new Float64Array([mode==='longitude'?NaN:10,0,1,mode==='speed'?NaN:1])}
   return new Float64Array([10,0,1,1]);
  }}));
  try{assert.throws(()=>report(defaultProfile,at),/Required ephemeris unavailable: Venus/)}finally{setEngineForTests(sw as any)}
 }
});
test('unavailable optional minor bodies are omitted and marked incomplete while the core remains usable',()=>{
 setEngineForTests(fake({calc_ut:(_jd:number,id:number)=>{if(id>=10)throw Error('Optional file unavailable');return new Float64Array([10,0,1,1])}}));
 try{
  const r=report(defaultProfile,at);assert.equal(r.complete,false);
  assert.equal(r.current.points.length,10);assert.equal(r.current.missing.length,6);
  assert.ok(Object.values(r.scores).every(Number.isFinite));
 }finally{setEngineForTests(sw as any)}
});
test('invalid house angles and incomplete cusp vectors cannot produce a chart',()=>{
 for(const houses of [()=>({cusps:[0,NaN,...Array(11).fill(20)],ascmc:[0,90]}),()=>({cusps:[0,10,20],ascmc:[0,90]}),()=>({cusps:[0,...Array(12).fill(10)],ascmc:[0,90]})]){
  setEngineForTests(fake({houses}));
  try{assert.throws(()=>chart(at,defaultProfile),/Invalid|Degenerate/)}finally{setEngineForTests(sw as any)}
 }
 assert.throws(()=>chart(at,{...defaultProfile,lat:NaN}),/Invalid chart/);
});
