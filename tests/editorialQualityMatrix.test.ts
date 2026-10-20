import test from 'node:test';
import assert from 'node:assert/strict';
import {humanSoul,humanPlanet,humanPartner} from '../src/humanReading.ts';
import {signalStory} from '../src/readingNarrative.ts';
import {soulReading} from '../src/soulEngine.ts';
import {soulTopics} from '../src/soulData.ts';
import {moonHumanReading} from '../src/moonHuman.ts';
import {reviewGeneratedAdvice} from '../src/aiQuality.ts';
import {precisionChartStories} from '../src/chartPrecisionNarrative.ts';
import type {Evidence,Signal,Category,SynastryEvidence} from '../src/math.ts';

const names=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','Ceres','Pallas','Juno','Vesta','Pholus'];
const pt=(id:string,longitude:number,speed=1)=>({id,longitude,speed,symbol:'•'});
const chart=(shift:number,known=true)=>({
 date:new Date('2000-01-01T12:00:00Z'),
 points:names.map((id,i)=>pt(id,(((i*27.17+shift*(5+i*.71))%360)+360)%360,i%7===0?-1:1)),
 asc:known?((120+shift)%360):null,mc:known?((210+shift)%360):null,
 cusps:known?Array.from({length:12},(_,i)=>(120+shift+i*30)%360):[],missing:[]
});
const forbidden=/(?:\b(?:conjunction|square|trine|sextile|opposition|orb|applying|separating)\b|اقتران|تربيع|تثليث|تسديس|مقابلة|أورب|اورب|\d+(?:[.,]\d+)?\s*°)/iu;
const clean=(text:string)=>{assert.ok(text.trim().length>12);assert.doesNotMatch(text,forbidden);assert.doesNotMatch(text,/\b(?:NaN|undefined|null)\b/);};
const factor=(a:string,b:string,angle:number):Evidence=>({
 id:a+':'+b+':'+angle,transit:pt(a,180),natal:pt(b,90),angle,
 orb:.35,maximumOrb:2,applying:true,weight:.84,exact:null
});
const signal=(category:Category,e:Evidence):Signal=>({category,score:68,tier:'A',tone:'opportunity',factors:[e]});
const areas:Category[]=['overview','career','love','communication','energy','emotions','recovery','timing'];

test('professional QA: 8 life areas x 10 natal targets x 5 aspect patterns are fluent, domain-specific and calculation-free',()=>{
 const realChart=chart(53);
 let combinations=0;
 for(const area of areas)for(const natal of names.slice(0,10))for(const angle of [0,60,90,120,180]){
  const row=signalStory(signal(area,factor('Venus',natal,angle)),realChart as any,true,'ar')!;
  assert.ok(row,area+' '+natal+' '+angle);
  for(const text of [row.title,row.good,row.careful,row.action])clean(text);
  assert.ok(row.good.length>85);
  assert.ok(row.action.length>35);
  assert.match(row.basis,/°/); // Auditability lives in technical evidence, not prose.
  combinations++;
 }
 assert.equal(combinations,400);
 for(const natal of names.slice(0,10)){
  const e=factor('Venus',natal,90);
  const romance=signalStory(signal('love',e),realChart as any,true,'ar')!;
  const work=signalStory(signal('career',e),realChart as any,true,'ar')!;
  assert.match(romance.action,/اهتمام|علاقة|دعوة|طرف|خطوة/);
  assert.match(work.action,/المطلوب|العمل|موعد|التسليم/);
  assert.notEqual(romance.action,work.action);
 }
});

test('professional QA: 4 natal fixtures x 200 topics maintain distinctive and honest bilingual interpretations',()=>{
 const variants=[chart(0),chart(44),chart(117),chart(241)];
 const summaries:string[][]=[];
 for(const natal of variants){
  const output=soulTopics.map(topic=>humanSoul(soulReading(natal as any,topic)));
  assert.equal(output.length,200);
  const list:string[]=[];
  for(let i=0;i<output.length;i++){
   for(const content of [output[i].summary.ar,output[i].summary.en,output[i].deep.ar,output[i].deep.en])clean(content);
   assert.ok(output[i].deep.ar.includes(soulTopics[i].ar),'topic '+(i+1)+' must be explicitly addressed');
   list.push(output[i].summary.ar);
  }
  assert.equal(new Set(list).size,200,'Each subject needs a distinct reader-facing summary');
  summaries.push(list);
 }
 for(let j=1;j<summaries.length;j++){
  const changed=summaries[j].filter((v,i)=>v!==summaries[0][i]).length;
  assert.ok(changed>=150,'A different calculated birth chart must change a substantial majority of 200 analyses; changed '+changed);
 }
});

test('professional QA: no known birth time means no fictitious house placement or exact time dependent inference',()=>{
 const natal=chart(78,false),e=factor('Saturn','Moon',90);
 for(const cat of areas){
  const row=signalStory(signal(cat,e),natal as any,false,'ar')!;
  assert.doesNotMatch(row.good,/البيت\s+\d|موضعه الولادي بالبيت/);
  clean(row.good);
 }
 for(const topic of soulTopics){
  const raw=soulReading(natal as any,topic,{knownTime:false});
  const story=humanSoul(raw);
  for(const v of [story.summary.ar,story.deep.ar])clean(v);
  if(raw.basisStatus!=='available')assert.doesNotMatch(story.deep.ar,/°|اقتران|تربيع|الشمس|القمر|عطارد|نبتون/);
 }
});

test('professional QA: missing or corrupt natal indicator cannot become an invented personality assessment',()=>{
 const minimal={...chart(35,false),points:[pt('Sun',60)]};
 for(const topic of soulTopics){
  const source=soulReading(minimal as any,topic,{knownTime:false}),plain=humanSoul(source);
  assert.notEqual(source.basisStatus,'available','Fixture must be insufficient for all tested topics');
  clean(plain.summary.ar);clean(plain.deep.ar);
  assert.match(plain.deep.ar,/ما تكفي|ماكو بيانات/);
  assert.doesNotMatch(plain.deep.ar,/بفارق|°|برج|الشمس|القمر|زحل|تربيع/);
 }
});

test('professional QA: personal meaning and actions do not repeat as one category-blind template',()=>{
 const natal=chart(111),e=factor('Neptune','Mercury',90);
 const results=areas.map(c=>signalStory(signal(c,e),natal as any,true,'ar')!);
 assert.equal(new Set(results.map(x=>x.careful)).size,areas.length);
 assert.equal(new Set(results.map(x=>x.action)).size,areas.length);
 assert.equal(new Set(results.map(x=>x.good)).size,areas.length);
});

test('professional QA: Moon five-line output varies with sign and computed natal target',()=>{
 const chart0=chart(20);
 const natalTargets=['Mercury','Venus','Mars','Saturn'];
 const seen=new Set<string>();
 for(let sign=0;sign<12;sign++)for(const target of natalTargets){
  const report={natal:chart0,evidence:[factor('Moon',target,90)]};
  const lines=moonHumanReading(sign,report as any,true,'ar');
  assert.equal(lines.length,5);
  for(const l of lines)clean(l);
  seen.add(lines.join('|'));
 }
 assert.equal(seen.size,48,'The twelve signs and four personal targets must not collapse to repeated readings');
});

test('professional QA: sexual compatibility and romantic attraction do not claim private consent or guaranteed outcomes',()=>{
 const kinds=['attraction','sexual','harmony','challenge'] as const;
 for(const a of names.slice(0,10))for(const b of names.slice(0,10))for(const angle of [0,60,90,120,180]){
  const contact={first:pt(a,10),second:pt(b,33),angle,orb:.41,influence:.76} as SynastryEvidence;
  for(const kind of kinds){
   const result=humanPartner(contact,kind);
   clean(result.ar);clean(result.en);
   assert.doesNotMatch(result.ar,/(?:أكيد تحبك|راح تتزوج|تحبك سرا|تريدك جنسياً بدون ما تعرف|موافقتها مضمونة)/);
  }
 }
});

test('professional QA: AI rejects invented destiny claims and technical explanations without leaking them through the fallback',()=>{
 for(const target of ['Moon','Venus','Mercury','Saturn','Mars']){
  const ctx={language:'ar' as const,support:null,challenge:{transit:'Saturn',natal:target,angle:90,orb:.32,applying:true},evidence:[{transit:'Saturn',natal:target,angle:90,orb:.32,applying:true}],events:[],strict:true,plainLanguage:true};
  for(const suspicious of ['زحل تربيع القمر اليوم','راح ترجع حبيبتك أكيد','العلاقة نجاحها 98%','راح يصير زواج بتاريخ 2027-03-04','هذي الزاوية بدرجة 90°']){
   const result=reviewGeneratedAdvice(suspicious,ctx);
   assert.equal(result.fallback,true,suspicious);
   clean(result.text);
   assert.doesNotMatch(result.text,/أكيد راح|90°|تربيع/);
  }
 }
});

test('professional QA: calculated natal planet stories change with the placement and its linked body',()=>{
 const a=precisionChartStories(chart(27) as any),b=precisionChartStories(chart(183) as any);
 const byId=new Map(b.map(x=>[x.id,x]));
 const changed=a.filter(x=>{
  const before=humanPlanet(x).summary.ar,other=byId.get(x.id);
  if(!other)return false;
  return before!==humanPlanet(other).summary.ar;
 });
 assert.ok(changed.length>=5,'At least five natal sections should change between distinct charts');
 for(const x of a){clean(humanPlanet(x).summary.ar);}
});
