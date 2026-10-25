import test from 'node:test';
import assert from 'node:assert/strict';
import {skyContext,contextGaugeBasis,contextScore} from '../src/skyContext.ts';
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
 assert.ok(Object.values(sky.domains).every(domain=>contextScore(domain.contributors)===domain.score));
 const metrics=derivedMetrics(sky.scores);
 assert.equal(metrics.length,29);
 assert.ok(metrics.every(x=>x.value>=1&&x.value<=99));
 assert.equal(goModes(metrics).length,4);
 assert.match(contextGaugeBasis(sky,['recovery']),/اتصال قريب/);
});
test('distant geometry is neutral context, not invented exact strength',()=>{
 const nadir=base({Sun:10,Mercury:10,Venus:10,Mars:10,Jupiter:10,Saturn:10,Uranus:10,Neptune:10,Pluto:10});
 const sky=base({Sun:25,Moon:25,Mercury:25,Venus:25,Mars:25,Jupiter:25,Saturn:25,Uranus:25,Neptune:25,Pluto:25});
 const result=skyContext(nadir,sky,false);
 assert.ok(Object.values(result.domains).every(x=>x.scope==='background'&&x.score===50&&x.contacts===0));
 assert.ok(Object.values(result.domains).every(x=>x.contributors.length===0));
 assert.match(contextGaugeBasis(result,['career']),/محايد/);
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
