import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {derivedMetrics} from '../src/metrics.ts';
import {travelMetricGroups,travelMetricsByGroup,travelMetricReading} from '../src/travelMode.ts';
import {skyContext} from '../src/skyContext.ts';
import type {Chart} from '../src/engine.ts';
import {gaugeLevel} from '../src/peopleInsights.ts';
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
 assert.ok(src.includes('const calculated=derivedMetrics(liveGaugeSky().scores),groups=travelMetricsByGroup(calculated)'));
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
 assert.match(travel,/group\.rows\.map\(\(\{id,metric\}\)=>quickGaugeCard\(metric,travelSymbol\(id\),undefined,id,seenTravelContacts\)\)/);
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


test('all twelve Travel Mode indicators explain their own activity and show their actual scoring inputs',()=>{
 const chart=(points:Record<string,number>):Chart=>({
  date:new Date('2026-10-25T18:00:00Z'),
  points:Object.entries(points).map(([id,longitude])=>({id,symbol:'*',longitude,speed:1})),
  cusps:[],asc:null,mc:null,missing:[]
 });
 const base=chart({Sun:8,Moon:20,Mercury:45,Venus:72,Mars:130,Jupiter:152,Saturn:204,Uranus:260,Neptune:298,Pluto:335});
 const current=chart({Sun:12,Moon:72,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 const context=skyContext(base,current,true);
 const groups=travelMetricsByGroup(derivedMetrics(context.scores));
 const readings=groups.flatMap(g=>g.rows.map(({metric})=>{
  const ar=travelMetricReading(metric,context);
  const en=travelMetricReading(metric,context,true);
  assert.ok(ar.summary.length>30,metric.id+' needs an activity-specific Arabic explanation');
  assert.ok(en.summary.length>30,metric.id+' needs an English explanation');
  assert.equal(ar.summary,ar.scene,'Compact Travel advice must stay activity-specific');
  assert.doesNotMatch(ar.summary,/بخارطة ميلادك|فارق [0-9]|\b(?:اقتران|تثليث|تسديس|تربيع|مقابلة)\b/u,'Technical astrology belongs inside Why this score');
  assert.equal(ar.basis.split(' · ').length,metric.source.length,'Must disclose all contributing category scores');
  assert.ok(ar.detail.includes(ar.basis));
  assert.match(ar.detail,/اتصال محسوب|ماكو اتصال/);
  assert.ok(!/تربيع.*تربيع/.test(ar.basis),'Card basis is category scores, not the same repeated aspect');
  return ar.summary;
 }));
 assert.equal(new Set(readings).size,12,'All twelve cards must use distinct readings');
 assert.match(src,/travelMetricReading\(m,liveGaugeSky\(\),lang==='en'\)/);
 assert.match(src,/mx-travel-gauge-summary/);
 assert.match(src,/mx-travel-gauge-detail/);
 assert.match(src,/mx-travel-score-direction/);
 const css=readFileSync('src/focus.css','utf8');
 assert.match(css,/\.mx-travel-mode-page \.mx-travel-gauge-summary/);
 assert.match(css,/\.mx-travel-mode-page \.mx-travel-gauge-detail/);
});

test('risk and rest do not reverse the meaning of red, yellow and green',()=>{
 const chart=(points:Record<string,number>):Chart=>({
  date:new Date('2026-10-25T18:00:00Z'),
  points:Object.entries(points).map(([id,longitude])=>({id,symbol:'*',longitude,speed:1})),
  cusps:[],asc:null,mc:null,missing:[]
 });
 const base=chart({Sun:8,Moon:20,Mercury:45,Venus:72,Mars:130,Jupiter:152,Saturn:204,Uranus:260,Neptune:298,Pluto:335});
 const current=chart({Sun:12,Moon:72,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 const sky=skyContext(base,current,true);
 const makeContext=(value:number)=>{
  const scores={...sky.scores,timing:value,emotions:value,recovery:value};
  const domains={...sky.domains,timing:{...sky.domains.timing,score:value},
   emotions:{...sky.domains.emotions,score:value},recovery:{...sky.domains.recovery,score:value}};
  return {...sky,scores,domains};
 };
 const low=makeContext(10),high=makeContext(90);
 for(const id of ['risk','sleep'] as const){
  const l=derivedMetrics(low.scores).find(x=>x.id===id)!;
  const h=derivedMetrics(high.scores).find(x=>x.id===id)!;
  assert.ok(l.value<h.value);
  assert.equal(gaugeLevel(l.value),'low');
  assert.equal(gaugeLevel(h.value),'strong');
  assert.notEqual(travelMetricReading(l,low).summary,travelMetricReading(h,high).summary);
 }
 assert.match(travelMetricReading(derivedMetrics(low.scores).find(x=>x.id==='sleep')!,low).summary,/إذا تعبان ارتاح/);
 assert.match(travelMetricReading(derivedMetrics(low.scores).find(x=>x.id==='risk')!,low).detail,/مو قياس لخطر فعلي/);
 const risk=derivedMetrics(high.scores).find(x=>x.id==='risk')!;
 assert.equal(risk.value,90,'A high readiness score must never be painted red');
});

test('Travel shares one sky contact narration per page and never repeats the global sky description in every card',async()=>{
 const {readFileSync}=await import('node:fs');
 const view=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
 const source=readFileSync(new URL('../src/travelMode.ts',import.meta.url),'utf8');
 assert.match(view,/seenTravelContacts=new Set<string>\(\)/);
 assert.match(view,/repeated\?travel\.conciseDetail:travel\.detail/);
 assert.doesNotMatch(source,/skyText\?' '\+skyText/);
});

test('Travel explanation acknowledges current-sky adjustments without natal contributors',()=>{
 const names=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
 const make=(offset:number):Chart=>({date:new Date('2026-11-02T18:00:00Z'),
  points:names.map((id,i)=>({id,symbol:id,longitude:(i*31+offset)%360,speed:1})),
  cusps:[],asc:null,mc:null,missing:[]});
 const original=skyContext(make(0),make(15),true);
 const scores={...original.scores,love:54,communication:50,timing:50};
 const domains={...original.domains};
 for(const category of ['love','communication','timing'] as const){
  domains[category]={...domains[category],score:scores[category],contributors:[],contacts:0,skyAdjustment:scores[category]-50};
 }
 const sky={...original,scores,domains};
 const metric=derivedMetrics(scores).find(item=>item.id==='dating')!;
 const ar=travelMetricReading(metric,sky),en=travelMetricReading(metric,sky,true);
 assert.match(ar.detail,/السماء الحالية غيّرت/);
 assert.match(en.detail,/current-sky conditions still changed/);
 assert.doesNotMatch(ar.detail,/درجات المجالات باقية على خط الأساس/);
});

test('repeated source contact is shown once per Travel view while each card keeps its own numerical basis',()=>{
 const chart=(points:Record<string,number>):Chart=>({date:new Date('2026-11-02T18:00:00Z'),
  points:Object.entries(points).map(([id,longitude])=>({id,symbol:'*',longitude,speed:1})),
  cusps:[],asc:null,mc:null,missing:[]});
 const natal=chart({Sun:8,Moon:20,Mercury:45,Venus:72,Mars:130,Jupiter:152,Saturn:204,Uranus:260,Neptune:298,Pluto:335});
 const current=chart({Sun:12,Moon:72,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 const sky=skyContext(natal,current,true);
 const readings=travelMetricsByGroup(derivedMetrics(sky.scores))
  .flatMap(group=>group.rows.map(row=>travelMetricReading(row.metric,sky)));
 const duplicates=readings.filter(r=>r.contactKey&&readings.filter(other=>other.contactKey===r.contactKey).length>1);
 assert.ok(duplicates.length>=2,'Fixture should contain reused source contacts');
 for(const reading of duplicates){
  assert.ok(reading.detail.includes(reading.basis));
  assert.ok(reading.conciseDetail.includes(reading.basis));
  assert.doesNotMatch(reading.conciseDetail,/أبرز اتصال محسوب/);
 }
 assert.match(src,/repeated\?travel\.conciseDetail:travel\.detail/);
});

test('Travel Mode presents shared consent context at group level, not as repeated gauge details',()=>{
 const section=travelMetricGroups.find(group=>group.id==='night')!;
 assert.match(section.descriptionAr,/ما تقيس رغبة الطرف الثاني أو موافقته/);
 const chart=(positions:Record<string,number>):Chart=>({date:new Date('2026-11-02T18:00:00Z'),
  points:Object.entries(positions).map(([id,longitude])=>({id,symbol:'*',longitude,speed:1})),
  cusps:[],asc:null,mc:null,missing:[]});
 const natal=chart({Sun:8,Moon:20,Mercury:45,Venus:72,Mars:130,Jupiter:152,Saturn:204,Uranus:260,Neptune:298,Pluto:335});
 const current=chart({Sun:12,Moon:72,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 const sky=skyContext(natal,current,true),all=derivedMetrics(sky.scores);
 for(const id of ['chemistry','sexuality']){
  const reading=travelMetricReading(all.find(metric=>metric.id===id)!,sky);
  assert.match(reading.detail,/المجالات الداخلة بالحساب/);
  assert.doesNotMatch(reading.detail,/الدرجة ما تقيس انجذاب أو موافقة شخص ثاني/);
 }
});

test('Travel evidence follows the composite score direction instead of automatically choosing a contradicting domain',()=>{
 const chart=(positions:Record<string,number>):Chart=>({date:new Date('2026-11-02T18:00:00Z'),
  points:Object.entries(positions).map(([id,longitude])=>({id,symbol:'*',longitude,speed:1})),
  cusps:[],asc:null,mc:null,missing:[]});
 const natal=chart({Sun:8,Moon:20,Mercury:45,Venus:72,Mars:130,Jupiter:152,Saturn:204,Uranus:260,Neptune:298,Pluto:335});
 const current=chart({Sun:12,Moon:72,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 const original=skyContext(natal,current,true);
 const communication={...original.domains.communication,score:20,contributors:[{transit:'Neptune',natal:'Mercury',angle:90,orb:0,strength:1,tone:-1}]};
 const love={...original.domains.love,score:90,contributors:[{transit:'Venus',natal:'Venus',angle:120,orb:0,strength:1,tone:1}]};
 const energy={...original.domains.energy,score:80,contributors:[{transit:'Sun',natal:'Sun',angle:60,orb:0,strength:1,tone:1}]};
 const sky={...original,scores:{...original.scores,communication:20,love:90,energy:80},
  domains:{...original.domains,communication,love,energy}};
 const metric=derivedMetrics(sky.scores).find(m=>m.id==='newpeople')!;
 assert.equal(metric.value,63);
 const reading=travelMetricReading(metric,sky);
 assert.notEqual(reading.contactKey,'Neptune:Mercury:90');
 assert.match(reading.detail,/تثليث الزهرة|تسديس الشمس/);
 assert.doesNotMatch(reading.detail,/نبتون تربيع عطارد/);
});
