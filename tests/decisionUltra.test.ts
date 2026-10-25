import test from 'node:test';import assert from 'node:assert/strict';
import {resolveDecisions,decisionExplanation,trustworthyPeak} from '../src/decisionUltra.ts';
import type {Evidence,Signal} from '../src/math.ts';
const factor=(planet:string,target:string,angle:number,weight:number,exact:string|null=null):Evidence=>({id:planet+'-'+angle+'-'+target,transit:{id:planet,symbol:'?',longitude:100,speed:1},natal:{id:target,symbol:'?',longitude:90,speed:0},angle,orb:.3,maximumOrb:2,applying:true,weight,exact});
test('opposing career contacts are classified as mixed with the actual supportive/challenging sources',()=>{
 const sources=[factor('Venus','MC',120,.85),factor('Saturn','MC',90,.8)];
 const signal:Signal={category:'career',score:65,factors:sources,tier:'A',tone:'supportive'};
 const memo=resolveDecisions(sources,[signal]).find(d=>d.category==='career')!;
 assert.equal(memo.resolution,'balanced');assert.equal(memo.mixed,true);
 assert.equal(memo.supportFactor?.transit.id,'Venus');assert.equal(memo.challengeFactor?.transit.id,'Saturn');
 assert.equal(memo.score,65);assert.match(decisionExplanation(memo,true),/داعمة ومعاكسة/);
});
test('no astro evidence yields explicit absent reading rather than invented interpretation',()=>{
 const memo=resolveDecisions([],[]);assert.equal(memo.length,8);
 assert.ok(memo.every(m=>m.quality==='none'&&m.score===null&&m.resolution==='insufficient'));
});
test('review direction is invariant under contradictory ordering and does not fabricate exact peaks',()=>{
 const a=factor('Saturn','Mercury',90,.62),b=factor('Jupiter','Mercury',120,.68);
 assert.deepEqual(resolveDecisions([a,b],[]).find(x=>x.category==='communication')?.notes,resolveDecisions([b,a],[]).find(x=>x.category==='communication')?.notes);
 assert.equal(trustworthyPeak({...a,applying:false,exact:'2026-10-20T00:00:00Z'},new Date('2026-10-18T00:00:00Z')),null);
 assert.equal(trustworthyPeak({...a,exact:'2026-10-20T00:00:00Z'},new Date('2026-10-18T00:00:00Z'))?.toISOString(),'2026-10-20T00:00:00.000Z');
});
