import test from 'node:test';import assert from 'node:assert/strict';
import {soulReading,soulBasis,soulProfileSummary,soulEvidenceText} from '../src/soulEngine.ts';
import {soulTopics} from '../src/soulData.ts';
const p=(id:string,longitude:number,speed=1)=>({id,longitude,speed,symbol:'●'});
const chart={date:new Date('1985-03-29T16:20:00Z'),asc:179,mc:90,cusps:Array.from({length:12},(_,i)=>(179+i*30)%360),missing:[],points:[p('Sun',9),p('Moon',110),p('Mercury',12),p('Venus',38),p('Mars',62),p('Saturn',219),p('Jupiter',305),p('Uranus',255),p('Neptune',274),p('Pluto',215),p('Juno',88)]};
test('every topic derives at least two chart placements and a unique question from actual natal data',()=>{
 const list=soulTopics.map(t=>soulReading(chart as any,t));
 assert.equal(list.length,200);
 assert.ok(list.every(x=>x.basis.length>=2&&x.summary.ar.includes(x.topic.ar)&&x.advice.ar));
 assert.equal(new Set(list.map(x=>x.question.ar)).size,200);
 assert.ok(list.every(x=>!x.limitations.en.includes('guarantee')));
});
test('unknown birth-time never manufactures Ascendant or house placements',()=>{
 const unset={...chart,asc:null,mc:null,cusps:[]};
 const r=soulReading(unset as any,soulTopics[0]);
 assert.ok(r.basis.every(x=>x.house===null));
 assert.ok(soulEvidenceText(r.basis,true).length>0);
});
test('changing actual natal longitude changes descriptive sign without changing topic identity',()=>{
 const a=soulReading(chart as any,soulTopics[0]);
 const change={...chart,points:chart.points.map(x=>x.id==='Sun'?{...x,longitude:211}:x)};
 const b=soulReading(change as any,soulTopics[0]);
 assert.notEqual(a.summary.ar,b.summary.ar);
});
test('all 200 topics with missing natal indicators return no personality traits or example event',()=>{
 const empty={...chart,points:[],asc:null,mc:null,cusps:[]};
 for(const topic of soulTopics){
  const r=soulReading(empty,topic);
  assert.equal(r.basisStatus,'unavailable',String(topic.id));
  assert.deepEqual(r.strengths,{ar:[],en:[]});
  assert.deepEqual(r.weaknesses,{ar:[],en:[]});
  assert.deepEqual(r.example,{ar:'',en:''});
  assert.match(r.summary.en,/Insufficient data/);
 }
});
test('one usable indicator does not authorize personal conclusions when time-sensitive points are excluded',()=>{
 const unknown=soulReading(chart,soulTopics[0],{knownTime:false});
 assert.deepEqual(unknown.basis.map(x=>x.planet),['Sun']);
 assert.equal(unknown.basisStatus,'limited');
 assert.equal(unknown.basis[0].house,null);
 assert.deepEqual(unknown.strengths.ar,[]);
 assert.equal(unknown.example.en,'');
 const corrupt={...chart,points:[p('Sun',9),p('Moon',110,NaN)],asc:720,mc:-1,cusps:[]};
 const rejected=soulReading(corrupt,soulTopics[0]);
 assert.equal(rejected.basisStatus,'limited');
 assert.deepEqual(rejected.basis.map(x=>x.planet),['Sun']);
});
