import test from 'node:test';import assert from 'node:assert/strict';
import {refineNatalTransit} from '../src/precision.ts';
import type {Evidence} from '../src/math.ts';
const start=Date.parse('2026-10-18T00:00:00Z'),DAY=86400000;
const ev=(transit='Mars',angle=90)=>({transit:{id:transit,longitude:45,speed:1,symbol:'♂'},natal:{id:'Sun',longitude:0,speed:0,symbol:'☉'},angle} as Evidence);
test('exact natal root is sampled from true changing position rather than linear prediction',()=>{
 const read=(t:Date)=>[{id:'Mars',longitude:70+(+t-start)/DAY*5}];
 const res=refineNatalTransit(ev(),new Date(start+4*DAY),read,7);
 assert.ok(res.nearest);
 assert.ok(Math.abs(+res.nearest!.time-(start+4*DAY))<=60000);
 assert.equal(res.nearest!.angle,90);
});
test('retrograde return can produce more than one exact crossing',()=>{
 const read=(t:Date)=>{const d=(+t-start)/DAY;return [{id:'Mars',longitude:90+(d-2)*(d-5)}]};
 const r=refineNatalTransit(ev(),new Date(start+3*DAY),read,7);
 assert.equal(r.events.length,2);
 assert.ok(Math.abs(+r.events[0].time-(start+2*DAY))<=60000);
 assert.ok(Math.abs(+r.events[1].time-(start+5*DAY))<=60000);
});
test('no crossing is accurately reported as unavailable in bounded window',()=>{
 const res=refineNatalTransit(ev(),new Date(start),()=>[{id:'Mars',longitude:10}],5);
 assert.equal(res.nearest,null);assert.equal(res.events.length,0);
});
test('missing Swiss body and invalid intervals fail closed',()=>{
 assert.throws(()=>refineNatalTransit(ev(),new Date(start),()=>[],5));
 assert.throws(()=>refineNatalTransit(ev(),new Date(start),()=>[],91));
});
