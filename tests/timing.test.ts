import test from 'node:test';
import assert from 'node:assert/strict';
import {bisectAngle,exactCrossings,lunarWindow,type SkyReader} from '../src/timing.ts';
const start=Date.parse('2026-10-18T00:00:00Z'),day=86400000;
const mock:SkyReader=at=>[{id:'Moon',longitude:5+(+at-start)/day*12},{id:'Sun',longitude:20}];
test('sub-minute lunar aspect root is found from sampled signs',()=>{
 const events=exactCrossings(mock,'Moon','Sun',0,new Date(start),new Date(start+2*day));
 assert.equal(events.length,1);
 assert.ok(Math.abs(+events[0].time-(start+1.25*day))<=60000);
});
test('lunar VOC begins after final exact classical aspect, ends at ingress',()=>{
 const before=lunarWindow(new Date(start+day),mock),after=lunarWindow(new Date(start+1.5*day),mock);
 assert.equal(before.isVoid,false);assert.equal(after.isVoid,true);
 assert.ok(Math.abs(+after.vocStartsAt-(start+1.25*day))<=60000);
 assert.ok(Math.abs(+after.ingressAt-(start+25/12*day))<=60000);
 assert.equal(after.lastAspect?.target,'Sun');
});
test('lunar sign and aspect geometry wrap across 360 degrees',()=>{
 const read:SkyReader=d=>[{id:'Moon',longitude:350+(+d-start)/day*12},{id:'Sun',longitude:358}];
 const r=lunarWindow(new Date(start),read);
 assert.equal(r.sign,11);
 assert.ok(+r.ingressAt>start&&+r.ingressAt<start+day);
 assert.equal(r.lastAspect?.target,'Sun');
});
test('angular bisection refuses discontinuous circular wrap and non-brackets',()=>{
 assert.equal(bisectAngle(x=>x<5?-179:179,0,10),null);
 assert.equal(bisectAngle(x=>x+1,0,10),null);
});
test('search refuses invalid spans and unsupported aspect types',()=>{
 assert.throws(()=>exactCrossings(mock,'Moon','Sun',45,new Date(start),new Date(start+day)));
 assert.throws(()=>exactCrossings(mock,'Moon','Sun',90,new Date(start+day),new Date(start)));
});
