import test from 'node:test';
import assert from 'node:assert/strict';
import {goLifeGauges,travelChecks,travelCompletion,travelActivity} from '../src/lifeGauges.ts';
import {derivedMetrics} from '../src/metrics.ts';

const sample={overview:52,career:64,love:40,communication:79,energy:48,emotions:38,recovery:73,timing:56};
test('five distinct Go life gauges use current calculated categories',()=>{
 const rows=goLifeGauges(sample);
 assert.equal(rows.length,5);
 assert.equal(new Set(rows.map(r=>r.id)).size,5);
 assert.ok(rows.every(r=>r.value>=1&&r.value<=99));
 assert.ok(rows.every(r=>Math.abs(r.source.reduce((sum,s)=>sum+s.weight,0)-1)<1e-10));
 assert.notDeepEqual(rows.map(x=>x.value),goLifeGauges({...sample,communication:25}).map(x=>x.value));
 assert.throws(()=>goLifeGauges({...sample,recovery:NaN}));
});
test('four practical Travel gauges depend only on verified checkboxes',()=>{
 assert.equal(travelChecks.length,4);
 assert.equal(new Set(travelChecks.map(r=>r.id)).size,4);
 assert.equal(travelCompletion([false,false,false],3),0);
 assert.equal(travelCompletion([true,false,false],3),33);
 assert.equal(travelCompletion([true,true,true],3),100);
 assert.throws(()=>travelCompletion([true],3));
});
test('fifth Travel activity comes from computed, bounded symbolic inputs',()=>{
 const recommendation=travelActivity(derivedMetrics(sample));
 assert.ok(['social','adventure','nightlife','sleep'].includes(recommendation.id));
 assert.ok(recommendation.value>=1&&recommendation.value<=99);
 assert.notEqual(recommendation.name.ar,'');
 assert.throws(()=>travelActivity([]));
});
