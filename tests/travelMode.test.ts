import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {derivedMetrics} from '../src/metrics.ts';
import {travelMetricGroups,travelMetricsByGroup} from '../src/travelMode.ts';
import type {Category} from '../src/math.ts';
const src=readFileSync('src/main.ts','utf8');
const nums:Record<Category,number>={overview:56,career:78,love:81,communication:63,energy:52,emotions:61,recovery:45,timing:72};

test('Travel Mode has exactly 12 nonduplicated, relevant indicators within three groups',()=>{
 const metrics=derivedMetrics(nums),groups=travelMetricsByGroup(metrics),ids=groups.flatMap(g=>g.rows.map(r=>r.id));
 assert.equal(groups.length,3);
 assert.deepEqual(groups.map(g=>g.rows.length),[6,3,3]);
 assert.equal(ids.length,12);
 assert.equal(new Set(ids).size,12);
 assert.deepEqual(ids,['dating','newpeople','social','attraction','romance','chemistry','sexuality','desire','nightlife','travel','risk','sleep']);
 assert.ok(ids.every(id=>metrics.some(m=>m.id===id)));
 assert.ok(travelMetricGroups.every(g=>g.descriptionAr.length>40&&g.descriptionEn.length>40));
});
test('Travel Mode values always match original calculated Go Mode values',()=>{
 const inputs=[nums,{...nums,love:12,energy:33},{...nums,communication:91,timing:27}];
 for(const record of inputs){
  const source=derivedMetrics(record),groups=travelMetricsByGroup(source);
  for(const row of groups.flatMap(g=>g.rows)){
   const original=source.find(x=>x.id===row.id)!;
   assert.equal(row.metric.value,original.value);
  }
 }
});
test('Travel Mode refuses fabricated or incomplete index data',()=>{
 const all=derivedMetrics(nums);
 assert.throws(()=>travelMetricsByGroup(all.filter(x=>x.id!=='dating')),/Missing calculated/);
 assert.throws(()=>travelMetricsByGroup(all.map(x=>x.id==='sleep'?{...x,value:NaN}:x)),/Invalid Travel Mode/);
});
test('Travel Mode is a main navigation option immediately below Go Mode, not a submenu',()=>{
 assert.match(src,/const primaryRoutes=\['today','chart','people','go','travelmode','calendar','more'\]/);
 assert.match(src,/travelmode:\(\)=>t\('Travel Mode','Travel Mode'\)/);
 assert.match(src,/travelmode:'<svg class="mx-plane-icon"/);
 const navCss=readFileSync('src/navAlignment.css','utf8');
 assert.match(navCss,/\.mobile-nav \.nav-item > span/);
 assert.match(navCss,/place-items: center/);
 assert.match(src,/case 'travelmode':inner=travelModePage\(\)/);
 assert.match(src,/function travelModePage\(\)/);
 assert.match(src,/data-section="travelmode"/);
 assert.ok(!src.includes("card('travelmode'"));
 assert.ok(src.includes('const calculated=derivedMetrics(data!.scores),groups=travelMetricsByGroup(calculated)'));
});
test('Travel Mode does not replace all-29 Go Mode',()=>{
 const travel=src.slice(src.indexOf('function travelModePage(){'),src.indexOf('function asteroidsPage(){'));
 const go=src.slice(src.indexOf('function goModePage(){'),src.indexOf('function travelModePage(){'));
 assert.match(travel,/mx-focus-metrics mx-travel-grid/);
 assert.match(travel,/travelMetricsByGroup/);
 assert.match(travel,/group\.rows\.map/);
 assert.doesNotMatch(travel,/renderTravelPractical/,'Practical readiness must not appear in Travel Mode');
 assert.match(src,/aria-valuenow/);
 assert.match(go,/indicators\.map/);
 assert.match(go,/go\.map/);
});

test('Travel cards reuse the exact Sex/Love/Emotions/Work quick gauge component, not the 29-index design',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const css=readFileSync('src/focus.css','utf8');
 const today=main.slice(main.indexOf('function todayQuickGauges('),main.indexOf('/** A single, source-grounded view'));
 const travel=main.slice(main.indexOf('function travelModePage(){'),main.indexOf('function asteroidsPage(){'));
 const go=main.slice(main.indexOf('function goModePage(){'),main.indexOf('function travelSymbol('));
 assert.match(main,/function quickGaugeCard\(m:MetricResult,symbol:string/);
 assert.match(today,/quickGaugeCard\(found,item.symbol,\[item.ar,item.en\]\)/);
 assert.match(travel,/group\.rows\.map\(\(\{id,metric\}\)=>quickGaugeCard\(metric,travelSymbol\(id\),undefined,id\)\)/);
 assert.match(travel,/class="mx-focus-metrics mx-travel-grid"/);
 assert.match(travel,/mx-quick-gauges/);
 assert.match(go,/indicators\.map\(m=>indicatorGaugeCard\(m\)\)/);
 assert.match(main,/data-travel-metric/);
 assert.match(main,/data-today-gauge/);
 assert.match(main,/mx-today-gauge-track/);
 assert.ok(!travel.includes('indicatorGaugeCard(metric,id)'), 'Travel must not use the 29 metric-card layout');
 for(const part of ['.mx-focus-metrics','.mx-focus-metric','.mx-today-gauge-icon','.mx-today-gauge-track']){
  assert.ok(css.includes('.mx-quick-gauges '+part), 'Shared quick card style missing: '+part);
 }
 assert.match(css,/\.mx-travel-group\{padding:15px 18px!important/);
 assert.match(css,/\.mx-travel-group\{padding:12px!important/);
 assert.ok(!css.includes('Travel Mode uniform turquoise'),'Superseded color-only patch should be removed');
});
