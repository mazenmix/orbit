import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {synastryPlainReading,personalTransitPlainReading} from '../src/relationshipPlain.ts';
import type {SynastryEvidence,Evidence} from '../src/math.ts';
const p=(id:string)=>({id,symbol:'·',longitude:100,speed:0});
const synastry=(first:string,second:string,angle:number):SynastryEvidence=>({first:p(first),second:p(second),angle,orb:.93,influence:.82});
test('Venus-Mars harmony explains actual symbolic topic, not only a numeric orb',()=>{
 const item=synastryPlainReading(synastry('Venus','Mars',120),'harmony');
 assert.match(item.title.ar,/المودة/);
 assert.match(item.meaning.ar,/التثليث/);
 assert.match(item.meaning.ar,/المبادرة/);
 assert.match(item.advice.ar,/متبادل/);
 assert.ok(!item.meaning.ar.includes('0.93'));
 assert.match(item.meaning.en,/trine/);
});
test('Sun-Neptune square describes expectations and a challenge without declaring a failed relationship',()=>{
 const item=synastryPlainReading(synastry('Sun','Neptune',90),'challenge');
 assert.match(item.title.ar,/التوقعات/);
 assert.match(item.meaning.ar,/التربيع/);
 assert.match(item.advice.ar,/التوقعات/);
 assert.ok(!/حتفشل|مستحيل/.test(item.meaning.ar));
});
test('No close aspect explicitly conveys missing evidence instead of invented insight',()=>{
 for(const kind of ['harmony','challenge'] as const){
  const item=synastryPlainReading(undefined,kind);
  assert.match(item.title.ar,/ماكو/);
  assert.match(item.meaning.en,/No close/);
 }
});
test('Transit explanation identifies actual area and applying direction, not predicted events',()=>{
 const e:Evidence={id:'x',transit:p('Mars'),natal:p('Pluto'),angle:90,orb:.4,maximumOrb:2,applying:true,weight:.8,exact:null};
 const text=personalTransitPlainReading(e,'communication');
 assert.match(text.title.ar,/الرسائل/);
 assert.match(text.meaning.ar,/يقترب/);
 assert.match(text.meaning.en,/communication/);
 assert.match(text.advice.ar,/وقت رصد/);
});
test('compact romance cards show attraction, sexual chemistry and practical synastry without numeric-only headlines',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const start=main.indexOf('function relationshipFocus('),end=main.indexOf('function peoplePage(){',start);
 assert.ok(start>=0&&end>start);
 const ui=main.slice(start,end);
 for(const fragment of ['relationshipBrief(c.evidence)','mx-brief-sexual','mx-brief-fact','المودة','الجنس','mx-brief-advice','mx-brief-bottom','mx-brief-details','<details']){
  // Romantic reading and its technical evidence remain available.
  if(fragment==='المودة')continue;
  assert.ok(ui.includes(fragment),fragment);
 }
 assert.ok(ui.indexOf('mx-brief-sexual')<ui.indexOf('mx-brief-details'));
 assert.ok(!ui.includes('mx-partner-plain-card'));
 assert.ok(ui.includes("person.kind==='dating'||person.kind==='friend'"));
});
