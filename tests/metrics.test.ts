import test from 'node:test';import assert from 'node:assert/strict';
import {metricSpecs,derivedMetrics,goModes,metricCoverage,observedMetric} from '../src/metrics.ts';
const categories={overview:50,career:70,love:80,communication:60,energy:75,emotions:40,recovery:55,timing:65};
test('29 named symbolic indicators use eight source indices without invented probabilities',()=>{
 const result=derivedMetrics(categories);
 assert.equal(metricSpecs.length,29);
 assert.equal(new Set(result.map(x=>x.id)).size,29);
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

test('new six social, intimacy and risk indices remain symbolic derivations only',()=>{
 const result=derivedMetrics(categories);for(const id of ["sexuality","desire","nightlife","dating","newpeople","risk"])assert.ok(result.some(m=>m.id===id));
 assert.equal(result.find(m=>m.id==='risk')?.value,100-Math.round((65+40+55)/3));
 assert.ok(result.every(m=>m.formula.includes('avg(')));
});

test('Go Mode gives each underlying category one vote instead of double-counting nested indicators',()=>{
 const unbalanced={overview:50,career:98,love:80,communication:20,energy:20,emotions:20,recovery:20,timing:20};
 const metrics=derivedMetrics(unbalanced);
 const work=goModes(metrics).find(row=>row.domain==='work')!;
 // Distinct work sources: career (98), communication (20), recovery (20), timing (20).
 assert.equal(work.value,40);
 assert.equal(work.state,'hold');
 const social=goModes(metrics).find(row=>row.domain==='social')!;
 // Distinct social sources: love (80), communication (20), energy (20).
 assert.equal(social.value,40);
 assert.equal(social.state,'hold');
 assert.throws(()=>goModes(metrics.filter(row=>row.id!=='career')),/Incomplete or invalid indicator set/);
 assert.throws(()=>goModes(metrics.filter(row=>row.id!=='recovery')),/Incomplete or invalid source category indices/);
 assert.throws(()=>goModes([...metrics,metrics[0]]),/Repeated Go Mode indicator/);
});

test('unsupported baseline scores are not described as fully evidenced',()=>{
 const rows=derivedMetrics(categories),find=(id:string)=>rows.find(m=>m.id===id)!;
 assert.equal(metricCoverage(find('career'),[]),'none');
 assert.equal(metricCoverage(find('career'),[{category:'career'}]),'complete');
 assert.equal(metricCoverage(find('focus'),[{category:'career'}]),'partial');
 assert.equal(metricCoverage(find('focus'),[{category:'career'},{category:'communication'},{category:'recovery'}]),'complete');
 assert.equal(metricCoverage(find('focus'),[{category:'career'},{category:'career'}]),'partial');
});

test('observed-only metric does not blend in an unsupported neutral baseline',()=>{
 const specs=metricSpecs,find=(id:string)=>specs.find(x=>x.id===id)!;
 assert.deepEqual(observedMetric(find('dating'),categories,[]).value,null);
 const partial=observedMetric(find('dating'),categories,[{category:'love'}]);
 assert.equal(partial.coverage,'partial');
 assert.equal(partial.value,80);
 assert.equal(partial.present,1);
 assert.equal(partial.total,3);
 const complete=observedMetric(find('dating'),categories,[{category:'love'},{category:'communication'},{category:'timing'}]);
 assert.equal(complete.coverage,'complete');
 assert.equal(complete.value,Math.round((80+60+65)/3));
 const caution=observedMetric(find('risk'),categories,[{category:'emotions'},{category:'recovery'}]);
 assert.equal(caution.value,100-Math.round((40+55)/2));
 assert.equal(caution.coverage,'partial');
});
