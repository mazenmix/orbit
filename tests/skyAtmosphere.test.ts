import test from 'node:test';
import assert from 'node:assert/strict';
import {skyClimate,moonSignExplanation,skyAspectExplanation} from '../src/skyAtmosphere.ts';
import {skyContext,contextScore} from '../src/skyContext.ts';
import {derivedMetrics} from '../src/metrics.ts';
import type {Chart} from '../src/engine.ts';

const chart=(angles:Record<string,number>,speeds:Record<string,number>={}):Chart=>({
 date:new Date('2026-11-01T18:30:00Z'),
 points:Object.entries(angles).map(([id,longitude])=>({id,symbol:id,longitude,speed:speeds[id]??.15})),
 asc:null,mc:null,cusps:[],missing:[]
});
const b={Sun:210,Moon:125,Mercury:218,Venus:205,Mars:128,Jupiter:140,Saturn:8,Uranus:62,Neptune:5,Pluto:305};
test('Mercury square Mars and Moon opposite Pluto are based on current sky positions',()=>{
 const climate=skyClimate(chart(b,{Venus:-.3,Mercury:-.2}));
 assert.ok(climate.notes.some(n=>n.arTitle==='عطارد تربيع المريخ'&&n.arMeaning.includes('كلام حاد')));
 assert.ok(climate.notes.some(n=>n.arTitle==='القمر مقابلة بلوتو'&&n.arMeaning.includes('شدّ وجذب')));
 assert.ok(climate.notes.some(n=>n.arTitle==='الزهرة متراجعة بالميزان'));
 assert.ok(climate.notes.some(n=>n.arTitle==='القمر بالأسد'));
 assert.ok(climate.adjustments.communication<0);
 assert.ok(climate.adjustments.love<0);
 assert.ok(Number.isFinite(climate.adjustments.emotions)); // Other supporting sky contacts can offset emotional tension.
});
test('sky influences alter existing gauges and the four added specialist gauges at same natal chart',()=>{
 const natal=chart({Sun:8,Moon:98,Mercury:55,Venus:88,Mars:180,Jupiter:160,Saturn:220,Uranus:260,Neptune:320,Pluto:343});
 const tense=skyContext(natal,chart(b,{Venus:-.3,Mercury:-.2}),true);
 const calm=skyContext(natal,chart({...b,Mercury:275,Mars:175,Moon:176,Pluto:325,Venus:205},{Venus:.3,Mercury:1}),true);
 assert.notDeepEqual(tense.climate.adjustments,calm.climate.adjustments);
 assert.ok(Object.values(tense.domains).every(d=>d.score===contextScore(d.contributors,d.skyAdjustment)));
 const names=['dialogue','relationStability','composure','personalBalance'];
 const cards=derivedMetrics(tense.scores);
 for(const id of names)assert.ok(cards.find(c=>c.id===id));
 assert.notEqual(cards.find(c=>c.id==='dialogue')?.value,derivedMetrics(calm.scores).find(c=>c.id==='dialogue')?.value);
});
test('no arbitrary retrograde score when planets move forward, and invalid bodies are rejected',()=>{
 const base=chart({Sun:15,Moon:25,Mercury:35,Venus:45,Mars:55,Jupiter:65,Saturn:75,Uranus:85,Neptune:95,Pluto:105});
 const first=skyClimate(base);
 assert.ok(!first.notes.some(x=>x.kind==='retrograde'));
 assert.deepEqual(first,skyClimate(base));
 assert.throws(()=>skyClimate(chart({Sun:12,Moon:12})),/Insufficient sky/);
});

test('all twelve Moon signs have distinct, real-time interpretations',()=>{
 const base={Sun:11,Moon:1,Mercury:41,Venus:85,Mars:151,Jupiter:177,Saturn:217,Uranus:250,Neptune:288,Pluto:337};
 const notes=Array.from({length:12},(_,index)=>{
  const climate=skyClimate(chart({...base,Moon:index*30+12}));
  const moon=climate.notes.find(note=>note.id==='moon:sign');
  assert.ok(moon,'Moon note available for zodiac sign '+index);
  assert.ok(moon.arMeaning.length>50);
  assert.ok(!moon.arMeaning.includes('لون القمر الحالي'),'No general fallback');
  return moon.arMeaning;
 });
 assert.equal(new Set(notes).size,12,'Moon narratives change with Moon sign');
});
test('changing sky aspect produces a new specific explanation, without stale November wording',()=>{
 const sample={Sun:12,Moon:31,Mercury:0,Venus:160,Mars:90,Jupiter:210,Saturn:225,Uranus:260,Neptune:300,Pluto:340};
 const harsh=skyClimate(chart(sample));
 const mercurySquare=harsh.notes.find(n=>n.id==='aspect:Mercury:Mars:90');
 assert.ok(mercurySquare);
 assert.match(mercurySquare.arMeaning,/كلام حاد/);
 const helpful=skyClimate(chart({...sample,Mars:60}));
 const mercurySextile=helpful.notes.find(n=>n.id==='aspect:Mercury:Mars:60');
 assert.ok(mercurySextile);
 assert.notEqual(mercurySextile.arMeaning,mercurySquare.arMeaning);
 assert.match(mercurySextile.arMeaning,/الكلام وسوء الفهم|المواجهة/);
 assert.ok(!helpful.notes.some(n=>n.id==='aspect:Mercury:Mars:90'));
});
test('Saturn and outer planet retrogrades get their own real-motion readings',()=>{
 const base={Sun:17,Moon:52,Mercury:71,Venus:103,Mars:134,Jupiter:169,Saturn:188,Uranus:251,Neptune:282,Pluto:314};
 const climate=skyClimate(chart(base,{Saturn:-.04,Neptune:-.005}));
 const saturn=climate.notes.find(n=>n.id==='retro:Saturn');
 const neptune=climate.notes.find(n=>n.id==='retro:Neptune');
 assert.ok(saturn&&neptune);
 assert.ok(saturn.arMeaning.includes('المسؤوليات'));
 assert.ok(neptune.arMeaning.includes('التصورات'));
 assert.notEqual(saturn.arMeaning,neptune.arMeaning);
 assert.ok(climate.adjustments.career!==0);
});

test('all supported natal planets, angles and minor bodies have a specific description for each aspect',async()=>{
 const {skyAspectExplanation}=await import('../src/skyAtmosphere.ts');
 const bodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Ascendant','MC','Chiron','Ceres','Pallas','Juno','Vesta','Pholus'];
 for(const body of bodies)for(const angle of [0,60,90,120,180]){
  const ar=skyAspectExplanation('Venus',body,angle);
  const en=skyAspectExplanation('Venus',body,angle,true);
  assert.ok(ar.length>55&&en.length>45,'Missing explanation for '+body+' '+angle);
  assert.doesNotMatch(ar,/راجع نوع الاتصال والجرمين|ماكو تفسير موثوق/);
  assert.doesNotMatch(ar,/(?:تربيع|تثليث|تسديس|مقابلة|اقتران)/);
 }
 assert.notEqual(skyAspectExplanation('Mercury','Chiron',90),skyAspectExplanation('Mercury','MC',90));
 assert.notEqual(skyAspectExplanation('Moon','Moon',120),skyAspectExplanation('Moon','Moon',90));
});

test('progressed Moon sign narratives differ across twelve signs',()=>{
 const narratives=Array.from({length:12},(_,i)=>moonSignExplanation(12+30*i));
 assert.equal(new Set(narratives).size,12);
 for(const s of narratives)assert.ok(s.length>35);
 assert.match(moonSignExplanation(168),/التدقيق|ملاحظة/);
});

test('forty-five distinct planetary pairs describe real scenarios, without generic aspect filler',()=>{
 const bodies=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
 const descriptions:string[]=[];
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
  const risk=skyAspectExplanation(bodies[i],bodies[j],90);
  const aid=skyAspectExplanation(bodies[i],bodies[j],120);
  assert.ok(risk.length>75&&aid.length>75,bodies[i]+' '+bodies[j]);
  assert.doesNotMatch(risk+aid,/انسجام بين .* و.*؛ سهولة أكبر|تأكد شنو حسّيت وشنو صار فعلاً|فرصة للتعاون وخطوة صغيرة عملية/);
  assert.notEqual(risk,aid);
  descriptions.push(risk+'|'+aid);
 }
 assert.equal(descriptions.length,45);
 assert.equal(new Set(descriptions).size,45);
 const moonSaturn=skyAspectExplanation('Moon','Saturn',120);
 const moonMercury=skyAspectExplanation('Moon','Mercury',90);
 const moonVenus=skyAspectExplanation('Moon','Venus',60);
 const sunMoon=skyAspectExplanation('Sun','Moon',90);
 assert.match(moonSaturn,/مسؤولية مأجلة/);
 assert.match(moonMercury,/كلمة عابرة/);
 assert.match(moonVenus,/رسالة اهتمام/);
 assert.match(sunMoon,/قرار تريد تحسمه/);
 assert.equal(new Set([moonSaturn,moonMercury,moonVenus,sunMoon]).size,4);
});
