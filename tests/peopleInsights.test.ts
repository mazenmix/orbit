import test from 'node:test';import assert from 'node:assert/strict';
import {partnerInsights,partnerInsightAvailable,gaugeLevel} from '../src/peopleInsights.ts';
const dims={attraction:76,sexual:64,emotional:52,communication:49,stability:54,conflict:42};
test('people page explains 16 uniquely actionable themes, including date and fantasy dialogue, without mind reading',()=>{
 const insights=partnerInsights(dims,{love:60,communication:55,energy:70});
 assert.equal(insights.length,16);assert.equal(new Set(insights.map(x=>x.arTitle)).size,16);
 assert.ok(insights.every(x=>x.score>=1&&x.score<=99));
 assert.equal(insights.find(x=>x.id==='date')?.enTitle,'Date-night atmosphere today');
 assert.ok(insights.find(x=>x.id==='exploration')?.enText.includes('no secret fetishes'));
 assert.equal(partnerInsights(dims,{love:60,communication:55,energy:70},false).length,0);
 assert.ok(insights.some(x=>x.id==='contactTiming'));
 assert.notEqual(insights.find(x=>x.id==='contactTiming')?.score,partnerInsights(dims,{love:60,communication:90,energy:70}).find(x=>x.id==='contactTiming')?.score);
});
test('semantic color follows strength, not the other way round',()=>{
 assert.deepEqual([25,45,60,90].map(gaugeLevel),['low','caution','steady','strong']);
});
test('timed partner cards require observed sources for scores AND their narrative comparisons',()=>{
 for(const id of ['date','initiative','contactTiming'] as const)assert.equal(partnerInsightAvailable(id,[]),false);
 assert.equal(partnerInsightAvailable('date',[{category:'love'}]),false,'communication comparison is unobserved');
 assert.equal(partnerInsightAvailable('initiative',[{category:'energy'}]),false,'communication comparison is unobserved');
 assert.equal(partnerInsightAvailable('date',[{category:'love'},{category:'communication'}]),true);
 assert.equal(partnerInsightAvailable('initiative',[{category:'energy'},{category:'communication'}]),true);
 assert.equal(partnerInsightAvailable('contactTiming',[{category:'love'},{category:'communication'}]),true);
 assert.equal(partnerInsightAvailable('desire',[]),true,'static synastry does not need timed domains');
});
