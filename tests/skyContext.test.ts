import test from 'node:test';
import assert from 'node:assert/strict';
import {skyContext,contextGaugeBasis,contextGaugeContactKey,contextGaugeNarrative,contextScore} from '../src/skyContext.ts';
import {derivedMetrics,goModes} from '../src/metrics.ts';
import type {Chart} from '../src/engine.ts';
const base=(degrees:Record<string,number>,at='2026-11-01T11:32:00Z'):Chart=>({
 date:new Date(at),points:Object.entries(degrees).map(([id,longitude])=>({id,symbol:'*',longitude,speed:id==='Moon'?13:0.3})),
 cusps:[],asc:null,mc:null,missing:[]
});
const natal=base({Sun:8,Moon:20,Mercury:45,Venus:72,Mars:130,Jupiter:152,Saturn:204,Uranus:260,Neptune:298,Pluto:335});
test('all eight domains including recovery receive real ephemeris-based context',()=>{
 const transit=base({Sun:12,Moon:72,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 const sky=skyContext(natal,transit,true);
 assert.equal(Object.keys(sky.scores).length,8);
 assert.ok(Object.values(sky.domains).every(x=>x.primary&&Number.isFinite(x.primary.orb)));
 assert.equal(sky.domains.recovery.primary.orb,0);
 assert.equal(sky.domains.recovery.scope,'tight');
 assert.ok(Object.values(sky.domains).every(domain=>domain.contacts===domain.contributors.length&&domain.contributors.length<=2));
 assert.ok(Object.values(sky.domains).every(domain=>contextScore(domain.contributors,domain.skyAdjustment)===domain.score));
 const metrics=derivedMetrics(sky.scores);
 assert.equal(metrics.length,33);
 assert.ok(metrics.every(x=>x.value>=1&&x.value<=99));
 assert.equal(goModes(metrics).length,4);
 assert.match(contextGaugeBasis(sky,['recovery']),/اتصال قريب/);
});
test('distant geometry is neutral context, not invented exact strength',()=>{
 const nadir=base({Sun:10,Mercury:10,Venus:10,Mars:10,Jupiter:10,Saturn:10,Uranus:10,Neptune:10,Pluto:10});
 const sky=base({Sun:25,Moon:25,Mercury:25,Venus:25,Mars:25,Jupiter:25,Saturn:25,Uranus:25,Neptune:25,Pluto:25});
 const result=skyContext(nadir,sky,false);
 assert.ok(Object.values(result.domains).every(x=>x.scope==='background'&&x.score===contextScore([],x.skyAdjustment)&&x.contacts===0));
 assert.ok(Object.values(result.domains).every(x=>x.contributors.length===0));
 assert.match(contextGaugeBasis(result,['career']),/بعيدة|محايد/);
});
test('time-varying transits change contextual values, while a fixed instant is deterministic',()=>{
 const t1=base({Sun:10,Moon:42,Mercury:20,Venus:80,Mars:130,Jupiter:260,Saturn:210,Uranus:290,Neptune:310,Pluto:340});
 const t2=base({Sun:28,Moon:53,Mercury:53,Venus:86,Mars:140,Jupiter:276,Saturn:240,Uranus:310,Neptune:320,Pluto:350},'2026-11-02T11:32:00Z');
 const a=skyContext(natal,t1,true),b=skyContext(natal,t2,true);
 assert.deepEqual(skyContext(natal,t1,true),a);
 assert.notDeepEqual(a.scores,b.scores);
 assert.match(contextGaugeBasis(a,['love'],true),/aspect|context|geometry/i);
});
test('unknown birth time excludes estimated natal Moon and angles',()=>{
 const input=base({Sun:8,Moon:20,Mercury:45,Venus:72,Mars:130,Jupiter:152,Saturn:204,Uranus:260,Neptune:298,Pluto:335});
 input.mc=144;input.asc=20;
 const transit=base({Sun:12,Moon:20,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 const result=skyContext(input,transit,false);
 assert.notEqual(result.domains.emotions.primary.natal,'Moon');
 assert.notEqual(result.domains.career.primary.natal,'MC');
 assert.ok(result.domains.recovery.primary.natal==='Saturn');
});
test('fails explicitly on missing required planetary ephemerides',()=>{
 assert.throws(()=>skyContext(natal,base({Sun:1,Moon:2}),true),/Insufficient principal/);
});

test('contextual contribution scoring rejects invalid strengths instead of making a verdict',()=>{
 assert.throws(()=>contextScore([{transit:'Venus',natal:'Moon',angle:120,orb:0,strength:NaN,tone:1}]),/Invalid contextual contribution/);
});

test('GO repetition control tracks exact planetary aspect identity instead of source-score label',()=>{
 const current=base({Sun:12,Moon:72,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 const sky=skyContext(natal,current,true);
 const candidate=Object.values(sky.domains).find(d=>d.scope!=='background');
 assert.ok(candidate);
 const contributors=candidate!.contributors.filter(p=>p.strength>0&&p.tone!==0).sort((a,b)=>Math.abs(b.tone*b.strength)-Math.abs(a.tone*a.strength)||a.orb-b.orb);
 assert.equal(contextGaugeContactKey(sky,[candidate!.category]),contributors[0]?.transit+':'+contributors[0]?.natal+':'+contributors[0]?.angle);
 assert.equal(contextGaugeContactKey(sky,[candidate!.category,candidate!.category]),contextGaugeContactKey(sky,[candidate!.category]));
});

test('GO narrative and duplicate key use an actual positive-weight contributor, never a zero-weight nearest label',()=>{
 const current=base({Sun:12,Moon:72,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 const sky=skyContext(natal,current,true),original=sky.domains.love;
 assert.ok(original.contributors.length>0);
 const ignored={transit:'Mercury',natal:'Venus',angle:90,orb:8,strength:0,tone:-1};
 const changed={...original,primary:ignored,scope:'wide' as const};
 const context={...sky,domains:{...sky.domains,love:changed}};
 const main=[...original.contributors].sort((a,b)=>Math.abs(b.tone*b.strength)-Math.abs(a.tone*a.strength)||a.orb-b.orb)[0];
 assert.equal(contextGaugeContactKey(context,['love']),main.transit+':'+main.natal+':'+main.angle);
 assert.ok(contextGaugeBasis(context,['love']).includes(main.orb.toFixed(1)+'°'));
 const empty={...changed,contributors:[],contacts:0,skyAdjustment:0,score:50};
 const neutral={...context,domains:{...context.domains,love:empty},scores:{...context.scores,love:50}};
 assert.equal(contextGaugeContactKey(neutral,['love']),null);
 assert.match(contextGaugeBasis(neutral,['love']),/محايد/);
 assert.match(contextGaugeNarrative(neutral,['love']),/ماكو اتصال ميلادي مؤثر/);
});
test('GO context refuses missing, repeated or nonfinite principal planets',()=>{
 const current=base({Sun:12,Moon:72,Mercury:46,Venus:194,Mars:137,Jupiter:256,Saturn:200,Uranus:260,Neptune:300,Pluto:334});
 assert.throws(()=>skyContext(natal,{...current,points:current.points.slice(1)},true),/Insufficient/);
 assert.throws(()=>skyContext(natal,{...current,points:[...current.points,current.points[0]]},true),/Insufficient/);
 assert.throws(()=>skyContext(natal,{...current,points:current.points.map(p=>p.id==='Venus'?{...p,longitude:NaN}:p)},true),/invalid/);
});
