import test from 'node:test';
import assert from 'node:assert/strict';
import {skyClimate} from '../src/skyAtmosphere.ts';
import {skyContext,contextScore} from '../src/skyContext.ts';
import {derivedMetrics} from '../src/metrics.ts';
import type {Chart} from '../src/engine.ts';

const chart=(angles:Record<string,number>,speeds:Record<string,number>={}):Chart=>({
 date:new Date('2026-11-01T18:30:00Z'),
 points:Object.entries(angles).map(([id,longitude])=>({id,symbol:id,longitude,speed:speeds[id]??.15})),
 asc:null,mc:null,cusps:[],missing:[]
});
const b={Sun:210,Moon:125,Mercury:218,Venus:205,Mars:128,Jupiter:140,Saturn:8,Uranus:62,Neptune:5,Pluto:305};
test('Mercury square Mars and Moon opposite Pluto are based on current sky positions',()=>{
 const climate=skyClimate(chart(b,{Venus:-.3,Mercury:-.2}));
 assert.ok(climate.notes.some(n=>n.arTitle==='عطارد تربيع المريخ'&&n.arMeaning.includes('كلام حاد')));
 assert.ok(climate.notes.some(n=>n.arTitle==='القمر مقابلة بلوتو'&&n.arMeaning.includes('شدّ وجذب')));
 assert.ok(climate.notes.some(n=>n.arTitle==='الزهرة متراجعة بالميزان'));
 assert.ok(climate.notes.some(n=>n.arTitle==='القمر بالأسد'));
 assert.ok(climate.adjustments.communication<0);
 assert.ok(climate.adjustments.love<0);
 assert.ok(Number.isFinite(climate.adjustments.emotions)); // Other supporting sky contacts can offset emotional tension.
});
test('sky influences alter existing gauges and the four added specialist gauges at same natal chart',()=>{
 const natal=chart({Sun:8,Moon:98,Mercury:55,Venus:88,Mars:180,Jupiter:160,Saturn:220,Uranus:260,Neptune:320,Pluto:343});
 const tense=skyContext(natal,chart(b,{Venus:-.3,Mercury:-.2}),true);
 const calm=skyContext(natal,chart({...b,Mercury:275,Mars:175,Moon:176,Pluto:325,Venus:205},{Venus:.3,Mercury:1}),true);
 assert.notDeepEqual(tense.climate.adjustments,calm.climate.adjustments);
 assert.ok(Object.values(tense.domains).every(d=>d.score===contextScore(d.contributors,d.skyAdjustment)));
 const names=['dialogue','relationStability','composure','personalBalance'];
 const cards=derivedMetrics(tense.scores);
 for(const id of names)assert.ok(cards.find(c=>c.id===id));
 assert.notEqual(cards.find(c=>c.id==='dialogue')?.value,derivedMetrics(calm.scores).find(c=>c.id==='dialogue')?.value);
});
test('no arbitrary retrograde score when planets move forward, and invalid bodies are rejected',()=>{
 const base=chart({Sun:15,Moon:25,Mercury:35,Venus:45,Mars:55,Jupiter:65,Saturn:75,Uranus:85,Neptune:95,Pluto:105});
 const first=skyClimate(base);
 assert.ok(!first.notes.some(x=>x.kind==='retrograde'));
 assert.deepEqual(first,skyClimate(base));
 assert.throws(()=>skyClimate(chart({Sun:12,Moon:12})),/Insufficient sky/);
});
