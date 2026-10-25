import test from 'node:test';import assert from 'node:assert/strict';
import {soulReading} from '../src/soulEngine.ts';
import {soulTopics} from '../src/soulData.ts';
import {soulThemes} from '../src/soulThemes.ts';
import {soulDeep} from '../src/soulDeep.ts';
const p=(id:string,longitude:number,speed=1)=>({id,longitude,speed,symbol:'✧'});
const chart={date:new Date('1990-06-01T11:00:00Z'),asc:143,mc:59,cusps:Array.from({length:12},(_,i)=>(143+i*30)%360),missing:[],points:['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus'].map((id,i)=>p(id,((i+2)*25.4)%360))};
test('200 readings have original deep content, summaries and actions, not reworded boilerplate',()=>{
 const list=soulTopics.map(t=>soulReading(chart as any,t));
 assert.equal(list.length,200);
 const unique=(key:'ar'|'en',field:'summary'|'deep'|'advice'|'example')=>{
  const values=list.map(x=>x[field][key]);assert.equal(new Set(values).size,200,field+' '+key+' should never repeat');
  assert.ok(values.every(v=>v.length>28),field+' '+key+' should contain substantive prose');
 };
 for(const key of ['ar','en'] as const)for(const field of ['summary','deep','advice','example'] as const)unique(key,field);
 assert.ok(list.every((x,i)=>x.summary.ar.startsWith(soulThemes[i].focusAr)));
 assert.ok(list.every((x,i)=>x.example.ar.startsWith(soulDeep[i].ar)));
 assert.ok(list.every((x,i)=>!x.deep.ar.includes(soulDeep[i].ar)),'the illustrative example must not be copied into deep analysis');
 assert.ok(list.every((x,i)=>x.advice.ar.startsWith(soulThemes[i].actionAr.replace(/[.؟!\s]+$/u,''))));
 assert.ok(list.every((x,i)=>x.advice.ar.length>soulThemes[i].actionAr.length+70),'topic actions must include a substantive chart-specific execution plan');
 const different=soulTopics.map(t=>soulReading({...chart,points:chart.points.map(p=>({...p,longitude:(p.longitude+137)%360}))} as any,t));
 assert.ok(list.every((x,i)=>x.advice.ar!==different[i].advice.ar),'actions must respond to the relevant placements instead of remaining fixed topic constants');
 assert.ok(list.every((x,i)=>!x.deep.ar.includes('المفتاح العملي هو')));
});
test('source astrological symbolism changes with natal positions, not topic title alone',()=>{
 const original=soulReading(chart as any,soulTopics[0]),shifted=soulReading({...chart,points:chart.points.map(p=>p.id==='Sun'?{...p,longitude:301}:p)} as any,soulTopics[0]);
 assert.notEqual(original.summary.ar,shifted.summary.ar);
 assert.notEqual(original.deep.ar,shifted.deep.ar);
 assert.deepEqual(original.topic,shifted.topic);
});
test('an unknown birth time never gets imaginary house or ascendant statements in readings',()=>{
 const unset={...chart,asc:null,mc:null,cusps:[]};
 const list=soulTopics.map(t=>soulReading(unset as any,t));
 assert.equal(list.length,200);
 assert.ok(list.every(x=>x.basis.every(b=>b.house===null)));
 assert.ok(list.every(x=>!x.deep.ar.includes('موضع الكوكب بالبيت')));
});

test('strength and challenge points are not verbatim recycled across the 200 displayed topics',()=>{
 const list=soulTopics.map(t=>soulReading(chart as any,t));
 for(const language of ['ar','en'] as const){
  for(const field of ['strengths','weaknesses'] as const){
   const lines=list.flatMap(x=>x[field][language]);
   assert.equal(lines.length,200); // One authored point beats a second boilerplate bullet.
   assert.equal(new Set(lines).size,lines.length,field+' '+language+' has repeated bullet paragraphs');
  }
 }
});
