import test from 'node:test';import assert from 'node:assert/strict';
import {metricSpecs,derivedMetrics,goModes} from '../src/metrics.ts';
const categories={overview:50,career:70,love:80,communication:60,energy:75,emotions:40,recovery:55,timing:65};
test('23 named symbolic indicators use eight source indices without invented probabilities',()=>{
 const result=derivedMetrics(categories);
 assert.equal(metricSpecs.length,23);
 assert.equal(new Set(result.map(x=>x.id)).size,23);
 assert.ok(result.every(x=>x.value>=1&&x.value<=99));
 assert.equal(result.find(x=>x.id==='career')?.value,70);
 assert.equal(result.find(x=>x.id==='caution')?.value,40);
 assert.match(result.find(x=>x.id==='luck')?.formula??'',/overview, timing, love/);
});
test('go mode is a deterministic reversible-activity indicator, not a probability',()=>{
 const go=goModes(derivedMetrics(categories));
 assert.deepEqual(go.map(x=>x.domain),['work','social','relationships','travel']);
 assert.ok(go.every(x=>['go','check','hold'].includes(x.state)));
});
test('missing or impossible calculated indices fail closed rather than fabricating values',()=>{
 assert.throws(()=>derivedMetrics({...categories,career:NaN}));
 assert.throws(()=>derivedMetrics({...categories,energy:110}));
});
test('fixed indices produce stable derived rankings',()=>{
 const a=derivedMetrics(categories),b=derivedMetrics({...categories});
 assert.deepEqual(a,b);
});
