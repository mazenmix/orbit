import test from 'node:test';import assert from 'node:assert/strict';
import {calculateHeatmap,heatSummary,sampledHeatmap} from '../src/heatmap.ts';
import {categories,aspects,signals,scores,type Category} from '../src/math.ts';
const origin=new Date('2026-10-18T12:00:00Z');
const covered=categories.map(category=>({category}));
const indices=(value:number)=>Object.fromEntries(categories.map(c=>[c,value])) as Record<Category,number>;
test('30-day heatmap samples each same UTC instant offset with inspectable source indices',()=>{
 const cells=calculateHeatmap(origin,30,d=>({scores:indices(Math.min(99,50+Math.round((+d-(+origin))/86400000))),signals:covered}));
 assert.equal(cells.length,30);assert.equal(+cells[29].instant-(+origin),29*86400000);
 assert.equal(cells[0].average,50);assert.equal(cells[29].average,79);
 const summary=heatSummary(cells,'career');assert.ok(summary.highest);
 assert.equal(summary.highest.indices.career,79);
});
test('heatmap never replaces impossible scores with fabricated numbers',()=>{
 assert.throws(()=>calculateHeatmap(origin,7,()=>({scores:{...indices(50),career:110},signals:covered})));
 assert.throws(()=>calculateHeatmap(origin,63,()=>({} as any)));
 assert.throws(()=>calculateHeatmap(origin,1,()=>indices(50) as any),/coverage/);
});

test('90-day and annual heatmaps use genuine spaced samples with explicit gaps',()=>{
 const read=()=>({scores:indices(55),signals:covered});
 const quarter=sampledHeatmap(origin,90,read),annual=sampledHeatmap(origin,365,read);
 assert.equal(quarter.length,30);assert.equal(annual.length,53);
 assert.equal(+quarter[1].instant-+quarter[0].instant,3*86400000);
 assert.equal(+annual[1].instant-+annual[0].instant,7*86400000);
});

test('unavailable recovery never becomes a 50-point heatmap or enters its average',()=>{
 const point=(id:string,longitude:number)=>({id,symbol:id,longitude,speed:1});
 const factors=aspects([point('Venus',120),point('Jupiter',120)],[point('Mercury',0)],origin);
 const measured=signals(factors),reading={scores:scores(measured,0),signals:measured};
 assert.equal(reading.scores.recovery,50,'The report still carries its internal placeholder');
 const cells=calculateHeatmap(origin,30,()=>reading);
 assert.ok(cells.every(cell=>cell.indices.recovery===null));
 assert.ok(cells.every(cell=>cell.average===reading.scores.communication));
 assert.deepEqual(cells[0].coverage,{present:1,total:8,missing:categories.filter(c=>c!=='communication')});
 const summary=heatSummary(cells,'recovery');
 assert.deepEqual(summary,{highest:null,lowest:null,mean:null,considered:0,total:30});
 for(const span of [90,365] as const)assert.ok(sampledHeatmap(origin,span,()=>reading).every(cell=>cell.indices.recovery===null));
});

test('measured neutral scores survive while absent scores and no-evidence days stay unavailable',()=>{
 const cells=calculateHeatmap(origin,3,at=>{
  const offset=(+at-+origin)/86400000;
  return {scores:{...indices(50),career:offset===2?80:50},signals:offset===1?[]:[{category:'career'}]};
 });
 assert.equal(cells[0].indices.career,50);assert.equal(cells[0].average,50);
 assert.equal(cells[1].average,null);assert.ok(Object.values(cells[1].indices).every(value=>value===null));
 const summary=heatSummary(cells,'career');
 assert.equal(summary.mean,65);assert.equal(summary.considered,2);assert.equal(summary.total,3);
 assert.equal(summary.highest?.indices.career,80);assert.equal(summary.lowest?.indices.career,50);
});
