import test from 'node:test';import assert from 'node:assert/strict';
import {calculateHeatmap,heatSummary} from '../src/heatmap.ts';
import {categories} from '../src/math.ts';
const origin=new Date('2026-10-18T12:00:00Z');
test('30-day heatmap samples each same UTC instant offset with inspectable source indices',()=>{
 const cells=calculateHeatmap(origin,30,d=>Object.fromEntries(categories.map(c=>[c,Math.min(99,50+Math.round((+d-(+origin))/86400000))])) as any);
 assert.equal(cells.length,30);assert.equal(+cells[29].instant-(+origin),29*86400000);
 assert.equal(cells[0].average,50);assert.equal(cells[29].average,79);
 assert.equal(heatSummary(cells,'career').highest.indices.career,79);
});
test('heatmap never replaces impossible scores with fabricated numbers',()=>{
 assert.throws(()=>calculateHeatmap(origin,7,()=>({career:110} as any)));
 assert.throws(()=>calculateHeatmap(origin,63,()=>({} as any)));
});

test('90-day and annual heatmaps use genuine spaced samples with explicit gaps',async()=>{
 const {sampledHeatmap}=await import('../src/heatmap.ts');
 const read=()=>Object.fromEntries(categories.map(c=>[c,55])) as any;
 const quarter=sampledHeatmap(origin,90,read),annual=sampledHeatmap(origin,365,read);
 assert.equal(quarter.length,30);assert.equal(annual.length,53);
 assert.equal(+quarter[1].instant-+quarter[0].instant,3*86400000);
 assert.equal(+annual[1].instant-+annual[0].instant,7*86400000);
});
