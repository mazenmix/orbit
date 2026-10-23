import test from 'node:test';
import assert from 'node:assert/strict';
import {lunarMansionNumber,lunarMansionWindow,LUNAR_MANSIONS,MANSION_SECTOR_DEGREES} from '../src/moonMansions.ts';

const day=86400000;
test('All 28 tropical lunar mansions are present and ordered',()=>{
 assert.equal(LUNAR_MANSIONS.length,28);
 assert.equal(LUNAR_MANSIONS[25].arName,'الفرغ الأول');
 assert.equal(LUNAR_MANSIONS[26].enName,'Al Fargh al-Thani');
 assert.equal(LUNAR_MANSIONS[27].arName,'بطن الحوت');
 for(let n=0;n<28;n++){
  assert.equal(lunarMansionNumber(n*MANSION_SECTOR_DEGREES+1e-7),n+1);
 }
 assert.equal(lunarMansionNumber(-0.1),28);
 assert.equal(lunarMansionNumber(360),1);
 assert.throws(()=>lunarMansionNumber(NaN),/Invalid/);
});
test('Precise mansion ingress is refined with the supplied ephemeris, not a mean-time forecast',()=>{
 const at=new Date('2026-10-22T09:00:00.000Z'),base=335,speed=13.2;
 const read=(d:Date)=>base+speed*(+d-+at)/day;
 const actual=lunarMansionWindow(at,read);
 assert.equal(actual.number,27);
 const entering=(26*MANSION_SECTOR_DEGREES-base)/speed*day+ +at;
 const leaving=(27*MANSION_SECTOR_DEGREES-base)/speed*day+ +at;
 assert.ok(Math.abs(+actual.enteredAt-entering)<2000);
 assert.ok(Math.abs(+actual.exitsAt-leaving)<2000);
 assert.ok(+actual.enteredAt<+at&&+actual.exitsAt>+at);
});
test('The 28 → 1 mansion crossing works at tropical Aries zero',()=>{
 const at=new Date('2026-10-24T00:00:00.000Z'),base=359.7,speed=14.1;
 const read=(d:Date)=>base+speed*(+d-+at)/day;
 const current=lunarMansionWindow(at,read);
 assert.equal(current.number,28);
 assert.ok(Math.abs(+current.exitsAt-(+at+(360-base)/speed*day))<2000);
 const after=new Date(+current.exitsAt+10000);
 assert.equal(lunarMansionWindow(after,read).number,1);
});

test('Mansion interpretations do not append editorial parentheticals to unfavorable activities',()=>{
 for(const mansion of LUNAR_MANSIONS){
  assert.doesNotMatch(mansion.arAvoid,/بحسب الموروث فقط|بالموروث التقليدي/);
  assert.doesNotMatch(mansion.enAvoid,/traditional belief(?: only)?/i);
 }
 assert.equal(LUNAR_MANSIONS[27].arAvoid,'الشؤون الصحية.');
});
