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
 assert.match(src,/travelmode:'✈'/);
 assert.match(src,/case 'travelmode':inner=travelModePage\(\)/);
 assert.match(src,/function travelModePage\(\)/);
 assert.match(src,/data-section="travelmode"/);
 assert.ok(!src.includes("card('travelmode'"));
 assert.ok(src.includes('travelMetricsByGroup(derivedMetrics(data!.scores))'));
});
test('Travel Mode does not replace all-29 Go Mode',()=>{
 const travel=src.slice(src.indexOf('function travelModePage(){'),src.indexOf('function asteroidsPage(){'));
 const go=src.slice(src.indexOf('function goModePage(){'),src.indexOf('function travelModePage(){'));
 assert.match(travel,/mx-travel-metric/);
 assert.match(travel,/travelMetricsByGroup/);
 assert.match(travel,/group\.rows\.map/);
 assert.match(travel,/aria-valuenow/);
 assert.match(go,/indicators\.map/);
 assert.match(go,/go\.map/);
});

test('Go Mode and Travel Mode reuse exactly one indicator card renderer and identical grid classes',()=>{
 const main=readFileSync('src/main.ts','utf8');
 const css=readFileSync('src/focus.css','utf8');
 const go=main.slice(main.indexOf('function goModePage(){'),main.indexOf('function travelModePage(){'));
 const travel=main.slice(main.indexOf('function travelModePage(){'),main.indexOf('function asteroidsPage(){'));
 assert.match(main,/function indicatorGaugeCard\(m:MetricResult,travelId\?:string\)/);
 assert.match(go,/indicators\.map\(m=>indicatorGaugeCard\(m\)\)/);
 assert.match(travel,/group\.rows\.map\(\(\{id,metric\}\)=>indicatorGaugeCard\(metric,id\)\)/);
 assert.match(travel,/class="metrics-grid mx-travel-grid"/);
 assert.match(main,/data-indicator-id/);
 assert.match(main,/data-travel-metric/);
 assert.ok(!css.includes('#live-view-body .mx-travel-mode-page .mx-travel-metric{'),
  'Travel cards must not have a separate visual theme or dimensions');
 assert.ok(!css.includes('grid-template-columns:repeat(3,minmax(0,1fr));gap:10px'),
  'Travel cannot override Go grid columns');
 for(const level of ['strong','steady','caution','low']){
  assert.match(css,new RegExp('\\.metric-card\\.'+level+'\\{'),'shared '+level+' color');
 }
 assert.match(css,/\.metric-card>b\{/);
 assert.match(css,/\.metric-card \.meter>i\{/);
});
