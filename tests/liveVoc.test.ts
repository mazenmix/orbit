import test from 'node:test';
import assert from 'node:assert/strict';
import {vocPhase,vocColorState,vocRemaining,remainingPercent} from '../src/liveVoc.ts';
test('Void of Course begins and ends at the exact calculated boundaries',()=>{
 const start=Date.UTC(2026,9,18,19,23,0),end=start+77*60*1000;
 assert.equal(vocPhase(start,end,start-1),'upcoming');
 assert.equal(vocPhase(start,end,start),'active');
 assert.equal(vocPhase(start,end,end-1),'active');
 assert.equal(vocPhase(start,end,end),'elapsed');
 assert.equal(vocRemaining(start,end,start-1),1);
 assert.equal(vocRemaining(start,end,start),77*60);
 assert.equal(vocRemaining(start,end,end),0);
});
test('invalid or missing VOC boundaries are not guessed',()=>{
 assert.equal(vocPhase(20,10,15),'elapsed');
 assert.equal(vocPhase(NaN,10,9),'elapsed');
 assert.equal(vocRemaining(NaN,10,9),0);
});

test('remaining percentage is proportional and clamped at the ephemeris boundaries',()=>{
 assert.equal(remainingPercent(1000,9000,1000),100);
 assert.equal(remainingPercent(1000,9000,5000),50);
 assert.equal(remainingPercent(1000,9000,9000),0);
 assert.equal(remainingPercent(1000,9000,12000),0);
 assert.equal(remainingPercent(1000,9000,0),100);
 assert.equal(remainingPercent(10,10,10),0);
 assert.equal(remainingPercent(NaN,9000,1000),0);
});
test('VOC upcoming and active progress measure different calculated intervals',()=>{
 const signStart=0,vocStart=80,vocEnd=100;
 assert.equal(remainingPercent(signStart,vocStart,40),50);
 assert.equal(remainingPercent(vocStart,vocEnd,90),50);
});

test('Today card and both lunar gauges share the exact VOC red interval',()=>{
 const start=Date.UTC(2026,9,23,6,31),end=Date.UTC(2026,9,23,22,53);
 assert.equal(vocColorState(start,end,start-1),'is-clear');
 assert.equal(vocColorState(start,end,start),'is-voc');
 assert.equal(vocColorState(start,end,end-1),'is-voc');
 assert.equal(vocColorState(start,end,end),'is-clear');
 assert.equal(vocColorState(NaN,end,start),'is-clear');
});
