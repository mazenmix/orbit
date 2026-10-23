import test from 'node:test';
import assert from 'node:assert/strict';
import {focusEventReading,type FocusReadingInput} from '../src/focusEventReading.ts';
const read=(event:FocusReadingInput,lang:'ar'|'en'='ar')=>focusEventReading(event,lang);
test('Every lunar sign has its own actionable reading',()=>{
 const all=Array.from({length:12},(_,nextSign)=>read({kind:'moon-ingress',nextSign}));
 assert.equal(new Set(all.map(x=>x.effect)).size,12);
 assert.equal(new Set(all.map(x=>x.action)).size,12);
 for(const item of all)assert.ok(item.effect.length>25&&item.action.length>20);
 assert.throws(()=>read({kind:'moon-ingress',nextSign:12}),/Invalid/);
});
test('Void starts and ends receive different descriptions and actions',()=>{
 const start=read({kind:'voc-start'}),end=read({kind:'voc-end'});
 assert.notEqual(start.effect,end.effect);
 assert.notEqual(start.action,end.action);
 assert.match(start.effect,/خلو مسار/);
 assert.match(end.effect,/ينتهي خلو المسار/);
});
test('Real aspect components change the reading, rather than repeating boilerplate',()=>{
 const venus=read({kind:'moon-aspect',target:'Venus',angle:120});
 const mercury=read({kind:'moon-aspect',target:'Mercury',angle:90});
 assert.match(venus.effect,/العلاقات/);
 assert.match(mercury.effect,/الكلام/);
 assert.notEqual(venus.action,mercury.action);
 assert.match(mercury.effect,/تربيع/);
 const personal=read({kind:'personal-aspect',transit:'Mars',target:'Venus',angle:90});
 assert.match(personal.effect,/المبادرة/);
 assert.match(personal.effect,/العلاقات/);
 assert.match(personal.effect,/تربيع/);
 assert.notEqual(personal.effect,venus.effect);
 assert.notEqual(read({kind:'personal-aspect',transit:'Saturn',target:'Venus',angle:90}).effect,personal.effect);
});
test('English and unsupported input safely cover calculated event types',()=>{
 assert.match(read({kind:'moon-aspect',target:'Saturn',angle:180},'en').effect,/opposition/);
 assert.match(read({kind:'personal-aspect',transit:'Sun',target:'MC',angle:0},'en').action,/work deliverable/);
 assert.throws(()=>read({kind:'moon-aspect',target:'Foo',angle:90}),/Invalid/);
});
