import test from 'node:test';
import assert from 'node:assert/strict';
import {soulBasis,soulReading,soulAspectPairs,soulProfileSummary} from '../src/soulEngine.ts';
import {soulTopicRules} from '../src/soulTopicRules.ts';
import {soulTopics} from '../src/soulData.ts';
import {detectInventedNatalText} from '../src/soulGrounding.ts';
import {repeatedSoulPassage} from '../src/soulQuality.ts';
import type {Chart,Profile} from '../src/engine.ts';
const point=(id:string,longitude:number)=>({id,longitude,speed:1,symbol:'●'});
const chart:Chart={date:new Date('2000-01-01T12:00:00Z'),points:[point('Sun',0),point('Moon',90),point('Venus',0),point('Saturn',120),point('Mercury',30),point('Mars',60)],asc:190,mc:95,cusps:Array.from({length:12},(_,i)=>(190+i*30)%360),missing:[]};

test('attachment pace uses Venus, Moon and Saturn; communication uses Mercury rather than topic-slot rotation',()=>{
 assert.deepEqual(soulBasis(chart,soulTopics[66]).map(p=>p.planet),['Venus','Moon','Saturn']);
 assert.equal(soulBasis(chart,soulTopics[28])[0].planet,'Mercury');
 assert.equal(soulBasis(chart,soulTopics[137])[0].planet,'Mercury');
 assert.ok(soulTopicRules.every(r=>r.planets.length===3&&new Set(r.planets).size===3));
});
test('unknown time excludes Moon, angles and all their aspects even if a caller supplies a timed chart',()=>{
 for(const topic of soulTopics){
  const reading=soulReading(chart,topic,{knownTime:false});
  assert.ok(reading.basis.every(p=>!['Moon','Ascendant','MC'].includes(p.planet)&&p.house===null));
  assert.ok(reading.basis.every(p=>!p.angle||!['Moon','Ascendant','MC'].includes(p.angle.planet)));
 }
 const text=soulProfileSummary(chart,{known:false} as Profile);
 assert.ok(!text.ar.includes('القمر في السرطان'));
 const polar=soulProfileSummary({...chart,asc:null,mc:null,cusps:[]},{known:true} as Profile);
 assert.ok(polar.ar.includes('الطالع غير متاح'));
 assert.ok(!polar.ar.includes('وقت الولادة غير معروف'));
});
test('a challenging aspect alone is not labeled mixed or contradictory evidence',()=>{
 const single={...chart,points:[point('Venus',0),point('Moon',90)]};
 const reading=soulReading(single,soulTopics[66]);
 assert.equal(reading.contradictory,false);
 assert.match(reading.deep.ar,/تربيع/);
 const mixed={...chart,points:[point('Venus',0),point('Moon',90),point('Saturn',120)]};
 assert.equal(soulReading(mixed,soulTopics[66]).contradictory,true);
 assert.deepEqual(soulAspectPairs(soulBasis(mixed,soulTopics[66])).map(a=>a.type),[90,120]);
});
test('aspects use actual longitude across zero degrees, with bounded orb and no unrelated bodies',()=>{
 assert.equal(soulAspectPairs([{planet:'Venus',longitude:359},{planet:'Moon',longitude:1}])[0].orb,2);
 assert.equal(soulAspectPairs([{planet:'Venus',longitude:0},{planet:'Moon',longitude:93.001}]).length,0);
 const basis=soulBasis({...chart,points:[...chart.points,point('Pluto',0.01)]},soulTopics[66]);
 assert.ok(basis.every(p=>p.angle?.planet!=='Pluto'));
 assert.equal(soulBasis({...chart,points:[point('Venus',NaN)]},soulTopics[66]).length,0);
});
test('resources and challenges are independently authored even after removing all topic names',()=>{
 for(const language of ['ar','en'] as const)for(const field of ['resource','risk'] as const){
  const values=soulTopicRules.map(r=>r[field][language]);
  assert.equal(new Set(values).size,200);
  assert.ok(values.every(v=>v.length>25));
 }
});
test('numerical house attribution and aspect claims cannot borrow an allowed value from another planet',()=>{
 const placements=[{planet:'Venus',longitude:0,sign:0,house:7},{planet:'Moon',longitude:90,sign:3,house:10}];
 assert.ok(detectInventedNatalText(['الزهرة في البيت ١٠'],placements).some(e=>e.startsWith('wrong-planet-house:Venus')));
 assert.ok(detectInventedNatalText(['الزهرة تثليث القمر'],placements).some(e=>e.startsWith('invented-aspect:')));
 assert.ok(detectInventedNatalText(['Venus trine Moon'],placements).some(e=>e.startsWith('invented-aspect:')));
 assert.deepEqual(detectInventedNatalText(['الزهرة تربيع القمر'],placements),[]);
});
test('copied passages wrapped in new text are detected without rejecting different short topic points',()=>{
 const sentence='يمكن مقارنة نمط العلاقة من خلال مواقف متكررة واضحة في الحياة اليومية';
 assert.ok(repeatedSoulPassage([sentence,'للتوضيح: '+sentence+' قبل اتخاذ قرار جديد']));
 assert.ok(!repeatedSoulPassage(['المبادرة بالتواصل','الإنصات أثناء التواصل','ملاحظة الاختلاف']));
});
