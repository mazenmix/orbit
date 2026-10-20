import test from 'node:test';
import assert from 'node:assert/strict';
import {natalPortrait} from '../src/natalPortrait.ts';
import {moonPersonalSummary} from '../src/moonPersonal.ts';
import {readFileSync} from 'node:fs';
import type {Chart,Report} from '../src/engine.ts';

const planets=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const chart=(shift:number,known=true):Chart=>({
 date:new Date('2026-10-20T10:00:00Z'),
 points:planets.map((id,i)=>({id,longitude:(shift+i*37.63+i*(shift%11))%360,speed:1,symbol:'●'})),
 cusps:known?Array.from({length:12},(_,i)=>(shift+15+30*i)%360):[],
 asc:(shift+15)%360,mc:(shift+105)%360,missing:[]
} as Chart);
const r=(natal:Chart,current:Chart,natalTarget:string,contactAngle:number):Report=>({
 natal,current,evidence:[{transit:{id:'Moon',longitude:current.points[1].longitude},natal:{id:natalTarget,longitude:natal.points.find(p=>p.id===natalTarget)?.longitude??20},angle:contactAngle,orb:0.27,weight:0.86,applying:true}],complete:true
} as unknown as Report);
const banned=/\b(?:square|sextile|trine|conjunction|opposition|orb)\b|اقتران|تربيع|تثليث|تسديس|مقابلة|\d+(?:\.\d+)?°/iu;
test('changing birth chart changes all four real-life natal portrait paragraphs',()=>{
 const profiles=[chart(22),chart(117),chart(266)];
 for(const lang of ['ar','en'] as const){
  const readings=profiles.map(c=>natalPortrait(c,true,lang));
  readings.forEach(lines=>{assert.equal(lines.length,4);for(const line of lines){assert.ok(line.length>85);assert.doesNotMatch(line,banned)}});
  for(let a=0;a<readings.length;a++)for(let b=a+1;b<readings.length;b++){
   assert.notDeepEqual(readings[a],readings[b]);
   assert.ok(readings[a].filter((x,i)=>x!==readings[b][i]).length>=3,'At least three of four personal domains must respond to different natal inputs');
  }
 }
});
test('renaming a profile without changing birth data does not fabricate a different personality',()=>{
 const c=chart(100);
 assert.deepEqual(natalPortrait(c,true,'ar'),natalPortrait({...c},true,'ar'));
});
test('unknown birth time omits invented Moon-based personality and house placement',()=>{
 const c=chart(75,false),reading=natalPortrait(c,false,'ar');
 assert.ok(reading.join(' ').includes('بدون ساعة ولادة مؤكدة'));
 assert.doesNotMatch(reading.join(' '),/البيت\s+\d+|بخارطتك بالبيت/);
});
test('Moon in the same sign affects different people differently through their own natal house and contact',()=>{
 const sky=chart(303),a=r(chart(15),sky,'Venus',120),b=r(chart(202),sky,'Saturn',90);
 for(const language of ['ar','en'] as const){
  const x=moonPersonalSummary(a,true,language),y=moonPersonalSummary(b,true,language);
  assert.notEqual(x,y);
  assert.ok(x.length>110);assert.ok(y.length>110);
  assert.doesNotMatch(x,banned);assert.doesNotMatch(y,banned);
 }
});
test('Moon summary changes when current sign changes while natal chart stays constant',()=>{
 const natal=chart(132),a=r(natal,chart(19),'Mercury',90),b=r(natal,chart(160),'Mercury',90);
 assert.notEqual(moonPersonalSummary(a,true,'ar'),moonPersonalSummary(b,true,'ar'));
});
test('Moon summary is transparent about missing time and never guesses houses',()=>{
 const natal=chart(63,false),report=r(natal,chart(110),'Venus',120),text=moonPersonalSummary(report,false,'ar');
 assert.match(text,/وقت ولادتك مو مؤكد/);
 assert.doesNotMatch(text,/بيت\s+\d+|البيت\s+\d+/);
});
test('user profile selection drives selected chart not active profile',()=>{
 const main=readFileSync('src/main.ts','utf8');
 assert.match(main,/const person=chartOwnerProfile\(\)/);
 assert.match(main,/const r=person\.id===active\.id\?data!:report\(person,selected\)/);
 assert.match(main,/soulPersonId=soulPerson\.value/);
 assert.match(main,/const natalPortraitLines=natalPortrait\(r\.natal,person\.known,lang\)/);
 assert.match(main,/data-chart-owner/);
 assert.match(main,/moonPersonalSummary\(r,active\.known,lang\)/);
});

test('Moon house labels distinguish natal house 11, current sky house 10 and transit over natal house 4',()=>{
 const natal=chart(0);
 natal.cusps=Array.from({length:12},(_,i)=>i*30);
 natal.points.find(p=>p.id==='Moon')!.longitude=315; // Natal 11th.
 const sky=chart(0);
 sky.cusps=Array.from({length:12},(_,i)=>(170+i*30)%360);
 sky.points.find(p=>p.id==='Moon')!.longitude=95; // Transit sky 10th, natal overlay 4th.
 const value=r(natal,sky,'Venus',120);
 const ar=moonPersonalSummary(value,true,'ar');
 const en=moonPersonalSummary(value,true,'en');
 assert.match(ar,/خارطة العبور الحالية القمر بالبيت 10/);
 assert.match(ar,/قمرك الولادي بالبيت 11/);
 assert.match(ar,/القمر العابر.*بيوت ميلادك.*البيت 4/);
 assert.match(ar,/بيت العبور الحالي يختلف/);
 assert.match(en,/current transit chart the Moon is in house 10/);
 assert.match(en,/natal Moon is in house 11/);
 assert.match(en,/natal house cusps.*house 4/);
});
test('Moon summary never invents family from a natal Moon in house 11 or a transit Moon in house 10',()=>{
 const natal=chart(0),sky=chart(0);
 natal.cusps=Array.from({length:12},(_,i)=>i*30);
 sky.cusps=[...natal.cusps];
 natal.points.find(p=>p.id==='Moon')!.longitude=315; // Natal 11th.
 sky.points.find(p=>p.id==='Moon')!.longitude=285; // Current 10th, overlay 10th.
 const ar=moonPersonalSummary(r(natal,sky,'Venus',120),true,'ar');
 assert.match(ar,/القمر بالبيت 10/);
 assert.match(ar,/قمرك الولادي بالبيت 11/);
 assert.match(ar,/على بيوت ميلادك، فيقع بالبيت 10/);
 assert.doesNotMatch(ar,/البيت والعائلة/);
});
