import test from 'node:test';
import assert from 'node:assert/strict';
import {vocPhase,vocRemaining} from '../src/liveVoc.ts';
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
