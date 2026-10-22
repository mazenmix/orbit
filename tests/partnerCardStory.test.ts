import test from 'node:test';
import assert from 'node:assert/strict';
import {partnerInsights} from '../src/peopleInsights.ts';
import {partnerCardStory} from '../src/partnerCardStory.ts';
const d={attraction:82,sexual:55,emotional:65,communication:73,stability:46,conflict:39};
const today={love:63,communication:74,energy:53};
const items=partnerInsights(d,today);
test('sixteen topics produce distinct, score-based explanations without a repeated action template',()=>{
 const s=items.map(x=>partnerCardStory(x,d,today,[]));
 assert.equal(new Set(s.map(x=>x.ar)).size,16;
 assert.ok(s.every(x=>x.ar.length>30&&!x.ar.includes('التصرف المفيد')));
 assert.notEqual(partnerCardStory(items[0],d,today,[]).ar,partnerCardStory(items[0],{...d,attraction:40,sexual:85},today,[]).ar);
});
test('synastry pair is only named when present in computed evidence',()=>{
 const e={first:{id:'Venus',symbol:'♀',longitude:45,speed:0},second:{id:'Mars',symbol:'♂',longitude:165,speed:0},angle:120,orb:1.4,influence:.88};
 const one=partnerCardStory(items[0],d,today,[]);
 const two=partnerCardStory(items[0],d,today,[e]);
 assert.equal(one.factorAr,'');
 assert.match(two.factorAr,/الزهرة/);
 assert.match(two.factorEn,/trine/);
});
