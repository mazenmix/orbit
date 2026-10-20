import test from 'node:test';
import assert from 'node:assert/strict';
import {moonPersonalSummary} from '../src/moonPersonal.ts';
import {houseNumber} from '../src/math.ts';
import type {Chart,Report} from '../src/engine.ts';

// Contract: people see a brief, personal reflection. House numbers, exact
// degrees, ephemeris jargon and supposed event probabilities stay outside
// the compact Moon card, even though its topic uses the actual natal cusps.
const focusAr=[
 '', 'اهتم بنفسك','راجع مصاريفك','إذا عندك رسالة','رتّب مساحة الراحة',
 'إذا تريد تتقرب','خفف زحمة المهام','بعلاقة أو شراكة مهمة','إذا موضوع الثقة',
 'إذا بالك بخطة سفر','بالشغل، خلّ أولويتك','التواصل ويا صديق','خلي عندك وقت هدوء'
];
const focusEn=[
 '', 'Pay attention to how','Review your spending','If a message',
 'Make some room for comfort','If you want to connect','Ease your workload',
 'In a close relationship','If trust or shared obligations',
 'If travel or learning','At work, set one clear priority',
 'Reach out to a friend','Give yourself some quiet time'
];
const banned=/\b(?:houses?|transits?|natal moon|orb|aspects?|degrees?)\s*\d*|\b\d+(?:\.\d+)?\s*\/\s*100\b|°|\b(?:trine|square|sextile|opposition|conjunction)\b|(?:البيت|بيوت|الدرجة|الدرجات|العبور|تربيع|تثليث|اقتران|تسديس|مقابلة)\s*\d*|\d+\s*%/iu;
const mod=(n:number)=>((n%360)+360)%360;
const cuspsFor=(lon:number,house:number):number[]=>{
 const start=mod(lon-15-(house-1)*30);
 return Array.from({length:12},(_,index)=>mod(start+index*30));
};
const chart=(date:string,moonLongitude:number,cusps:number[]):Chart=>({
 date:new Date(date),
 points:[{id:'Moon',symbol:'☾',longitude:moonLongitude,speed:12}],
 cusps,asc:cusps.length?cusps[0]:null,mc:cusps.length?cusps[9]:null,missing:[]
});
function reportFor(sign:number,personalHouse:number,natalMoonHouse=11,known=true):Report{
 const now=sign*30+15,cusps=cuspsFor(now,personalHouse);
 const natalMoon=mod(cusps[natalMoonHouse-1]+15);
 return {natal:chart('1985-03-29T16:20:00Z',natalMoon,cusps),
  current:chart('2026-10-20T12:30:00Z',now,cusps),
  evidence:[],complete:true} as unknown as Report;
}

test('288 Arabic/English Moon combinations keep personal topics accurate, brief and jargon-free',()=>{
 let cases=0;
 for(let sign=0;sign<12;sign++)for(let personalHouse=1;personalHouse<=12;personalHouse++){
  const report=reportFor(sign,personalHouse);
  const actual=houseNumber(report.current.points[0].longitude,report.natal.cusps);
  assert.equal(actual,personalHouse,'fixture calculated house '+personalHouse);
  for(const lang of ['ar','en'] as const){
   const text=moonPersonalSummary(report,true,lang);
   assert.ok(text.includes((lang==='ar'?focusAr:focusEn)[personalHouse]),`Incorrect personalized topic ${sign}/${personalHouse}/${lang}: ${text}`);
   assert.doesNotMatch(text,banned,`Technical leakage ${sign}/${personalHouse}/${lang}`);
   assert.ok(text.length>=75&&text.length<=480,`Excessive/empty ${lang} reading: ${text.length}`);
   assert.ok(text.split(/[.!?؟]/u).filter(x=>x.trim()).length<=3,`More than 3 sentences: ${text}`);
   assert.equal(text,text.replace(/\s{2,}/gu,' '),'No repeated whitespace');
   cases++;
  }
 }
 assert.equal(cases,288);
});

test('current sky chart cusps never override the selected persons natal overlay',()=>{
 const sample=reportFor(10,10,11);
 const before=moonPersonalSummary(sample,true,'ar');
 // Deliberately point the current sky chart at a contradictory house.
 sample.current.cusps=cuspsFor(sample.current.points[0].longitude,4);
 const after=moonPersonalSummary(sample,true,'ar');
 assert.equal(after,before);
 assert.match(after,/بالشغل/);
 assert.doesNotMatch(after,/رتّب مساحة الراحة/);
});

test('unknown birth time never yields inferred natal-house advice even if cusps are present',()=>{
 const sample=reportFor(6,10,11);
 const unknown=moonPersonalSummary(sample,false,'ar');
 assert.doesNotMatch(unknown,/بالشغل، خلّ أولويتك|صديق قريب/);
 sample.natal.cusps=[];
 assert.equal(moonPersonalSummary(sample,false,'ar'),unknown);
 assert.doesNotMatch(unknown,banned);
});

test('selected birth chart changes guidance without changing the global Moon position',()=>{
 const first=reportFor(10,10,11);
 const second=reportFor(10,5,7);
 assert.equal(first.current.points[0].longitude,second.current.points[0].longitude);
 const a=moonPersonalSummary(first,true,'ar'),b=moonPersonalSummary(second,true,'ar');
 assert.notEqual(a,b);
 assert.match(a,/بالشغل/); assert.match(a,/صديق قريب/);
 assert.match(b,/إذا تريد تتقرب/); assert.doesNotMatch(b,/بالشغل، خلّ أولويتك/);
});

test('invalid or missing lunar ephemeris yields an honest fallback instead of a crash',()=>{
 const sample=reportFor(5,4);
 sample.current.points=[];
 assert.match(moonPersonalSummary(sample,true,'ar'),/معلومات كافية/);
 sample.current.points=[{id:'Moon',longitude:Number.NaN,speed:0,symbol:'☾'}];
 assert.match(moonPersonalSummary(sample,true,'en'),/not enough current information/i);
});
