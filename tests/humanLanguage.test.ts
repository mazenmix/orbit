import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {signalStory} from '../src/readingNarrative.ts';
import {humanSoul,humanPlanet,humanPartner} from '../src/humanReading.ts';
import {moonHumanReading} from '../src/moonHuman.ts';
import {soulReading} from '../src/soulEngine.ts';
import {soulTopics} from '../src/soulData.ts';
import {precisionChartStories} from '../src/chartPrecisionNarrative.ts';
import {reviewGeneratedAdvice} from '../src/aiQuality.ts';
import type {Evidence,Signal,SynastryEvidence} from '../src/math.ts';

const point=(id:string,longitude:number,speed=1)=>({id,longitude,speed,symbol:'·'});
const natal={date:new Date('1985-03-29T16:20:00Z'),points:['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus'].map((id,i)=>point(id,(i*24+7)%360)),asc:189,mc:94,cusps:Array.from({length:12},(_,i)=>(189+i*30)%360),missing:[]};
const banned=/(?:اقتران|تثليث|تربيع|تسديس|مقابلة|اورب|أورب|\b(?:trine|square|sextile|conjunction|opposition|orb|applying|separating)\b|\d+(?:[.,]\d+)?\s*°)/iu;
const clean=(x:string)=>assert.doesNotMatch(x,banned,x.slice(0,120));
const factor=(transit:string,natalId:string,angle:number):Evidence=>({id:transit+':'+natalId+':'+angle,transit:point(transit,190),natal:point(natalId,16),angle,orb:.34,maximumOrb:2,applying:true,weight:.9,exact:null});
const signal=(e:Evidence):Signal=>({category:'love',score:70,tier:'A',tone:'opportunity',factors:[e]});

test('daily narrative is direct, contains no ephemeris jargon and changes with calculated factors',()=>{
 const a=signalStory(signal(factor('Venus','Venus',120)),natal,true,'ar')!;
 const b=signalStory(signal(factor('Saturn','Venus',90)),natal,true,'ar')!;
 for(const s of [a,b]){clean(s.title);clean(s.good);clean(s.careful);clean(s.action);assert.ok(s.good.length>70);assert.ok(s.action.length>30);}
 assert.notEqual(a.good,b.good);
 assert.match(a.basis,/°/); // Underlying math is retained for the optional evidence view only.
});

test('all 200 natal topics display specific human meaning without raw angles',()=>{
 const values=soulTopics.map(topic=>humanSoul(soulReading(natal as any,topic)));
 assert.equal(values.length,200);
 for(const v of values){clean(v.summary.ar);clean(v.deep.ar);assert.ok(v.summary.ar.length>50);assert.ok(v.deep.ar.length>60);}
 assert.equal(new Set(values.map(v=>v.summary.ar)).size,200);
});

test('natal planet panel uses practical scenes and no exposed orbital prose',()=>{
 const list=precisionChartStories(natal as any);
 for(const item of list){const value=humanPlanet(item);clean(value.summary.ar);assert.ok(value.summary.ar.length>50)}
});

test('relationship panels keep consent separate from astrology and do not display aspect labels',()=>{
 const syn=(a:string,b:string,angle:number):SynastryEvidence=>({first:point(a,13),second:point(b,42),angle,orb:.5,influence:.9});
 for(const e of [syn('Venus','Mars',120),syn('Venus','Pluto',90),syn('Sun','Neptune',90),syn('Mercury','Mercury',60)]){
  for(const mode of ['attraction','sexual','harmony','challenge'] as const){const reading=humanPartner(e,mode);clean(reading.ar);clean(reading.en);assert.ok(reading.ar.length>45)}
 }
 assert.match(humanPartner(syn('Venus','Mars',120),'sexual').ar,/الرغبة المتبادلة/);
});

test('all 12 Moon signs get five human lines and lunar-target-specific interpretation',()=>{
 const e=factor('Moon','Venus',90);const report={natal,evidence:[e]};
 for(let s=0;s<12;s++)for(const language of ['ar','en'] as const){
  const lines=moonHumanReading(s,report as any,true,language);
  assert.equal(lines.length,5);for(const line of lines){clean(line);assert.ok(line.length>25)}
 }
 const b={natal,evidence:[factor('Moon','Mercury',90)]};
 assert.notEqual(moonHumanReading(3,report as any,true,'ar')[3],moonHumanReading(3,b as any,true,'ar')[3]);
});

test('AI reader path rejects any mathematical vocabulary and offers personalized direct fallback',()=>{
 const ctx={language:'ar' as const,support:null,challenge:{transit:'Saturn',natal:'Moon',angle:90,orb:.35,applying:true},events:[],evidence:[{transit:'Saturn',natal:'Moon',angle:90,orb:.35,applying:true}],strict:true,plainLanguage:true};
 const checked=reviewGeneratedAdvice('زحل تربيع القمر وراح يصير شي باجر',ctx);
 assert.equal(checked.fallback,true);clean(checked.text);
 assert.match(checked.text,/راحتك/);
});

test('reader interfaces keep exact calculations inside optional disclosures',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const soul=readFileSync('src/soulUI.ts','utf8');
 assert.ok(main.includes('moonHumanReading(sign,r,active.known,lang)'));
 assert.ok(main.includes('humanPartner(brief.attractionContact'));
 assert.ok(main.includes('humanPlanet(x)'));
 assert.ok(main.includes('mx-focus-technical'));
 assert.ok(soul.includes('humanSoul(reading)'));
 assert.ok(soul.includes('soul-evidence'));
});

test('human relationship pair matching works independent of person order',()=>{
 const sun={first:point('Sun',12),second:point('Neptune',80),angle:90,orb:.3,influence:.9} as SynastryEvidence;
 const swapped={...sun,first:sun.second,second:sun.first};
 const a=humanPartner(sun,'challenge'),b=humanPartner(swapped,'challenge');
 assert.match(a.ar,/الصورة المثالية/);
 assert.equal(a.ar,b.ar);
 clean(a.ar);
});

test('attraction and intimacy adapt to ease versus friction rather than repeating a generic card',()=>{
 const easy={first:point('Venus',12),second:point('Mars',81),angle:120,orb:.5,influence:.9} as SynastryEvidence;
 const hard={...easy,angle:90};
 for(const category of ['attraction','sexual'] as const){
  const a=humanPartner(easy,category),b=humanPartner(hard,category);
  assert.notEqual(a.ar,b.ar,category);
  assert.match(b.ar,/اختلاف|الإيقاع/);
  clean(a.ar);clean(b.ar);
 }
});

test('natal deep reading does not copy its separately displayed strength and challenge cards',()=>{
 for(const topic of soulTopics){
  const source=soulReading(natal as any,topic);
  const reading=humanSoul(source);
  if(source.basisStatus!=='available')continue;
  assert.ok(!reading.deep.ar.includes(source.strengths.ar[0]),String(topic.id));
  assert.ok(!reading.deep.ar.includes(source.weaknesses.ar[0]),String(topic.id));
  assert.ok(reading.deep.ar.includes(topic.ar),String(topic.id));
  clean(reading.deep.ar);
 }
});

test('daily examples adapt to the actual category even with the same astrological factor',()=>{
 const e=factor('Saturn','Venus',90);
 const romance=signalStory(signal(e),natal,true,'ar')!;
 const work=signalStory({...signal(e),category:'career'},natal,true,'ar')!;
 assert.notEqual(romance.careful,work.careful);
 assert.notEqual(romance.good,work.good);
 assert.match(romance.careful,/يعجبك/);
 assert.match(work.careful,/مسؤول/);
 for(const row of [romance,work]){clean(row.good);clean(row.careful);}
});

test('natal signature interprets a real linked second point without repeating the same text',()=>{
 const chart=precisionChartStories(natal as any);
 const pointReading=chart.find(x=>x.id==='Sun')!;
 assert.ok(pointReading);
 const withLink=humanPlanet({...pointReading,aspect:'Saturn'});
 const withoutLink=humanPlanet({...pointReading,aspect:null});
 assert.notEqual(withLink.summary.ar,withoutLink.summary.ar);
 assert.match(withLink.summary.ar,/الالتزام/);
 clean(withLink.summary.ar);
});
