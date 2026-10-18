import test from 'node:test';import assert from 'node:assert/strict';
import {partnerInsights,gaugeLevel} from '../src/peopleInsights.ts';
const dims={attraction:76,sexual:64,emotional:52,communication:49,stability:54,conflict:42};
test('people page explains 10 uniquely actionable themes, including date and fantasy dialogue, without mind reading',()=>{
 const insights=partnerInsights(dims,{love:60,communication:55,energy:70});
 assert.equal(insights.length,10);assert.equal(new Set(insights.map(x=>x.arTitle)).size,10);
 assert.ok(insights.every(x=>x.score>=1&&x.score<=99));
 assert.equal(insights.find(x=>x.id==='date')?.enTitle,'Date-night atmosphere today');
 assert.ok(insights.find(x=>x.id==='exploration')?.enText.includes('no secret fetishes'));
 assert.equal(partnerInsights(dims,{love:60,communication:55,energy:70},false).length,0);
});
test('semantic color follows strength, not the other way round',()=>{
 assert.deepEqual([25,45,60,90].map(gaugeLevel),['low','caution','steady','strong']);
});
