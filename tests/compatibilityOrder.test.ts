import test from 'node:test';
import assert from 'node:assert/strict';
import {compatibility,defaultProfile,setEngineForTests,type Profile} from '../src/engine.ts';

// Deterministic Swiss facade: isolate the classification and orientation logic
// from ephemeris I/O while exercising the real compatibility() code path.
setEngineForTests({
 calc_ut(jd:number,id:number){
  return new Float64Array([((jd*.37+id*28)%360+360)%360,0,0,.2]);
 },
 houses(){
  return {cusps:[0,...Array.from({length:12},(_,i)=>i*30)],ascmc:[0,270]};
 }
} as never);

const person=(id:string,kind:Profile['kind'],date:string):Profile=>({
 ...defaultProfile,id,name:id,kind,date,known:true
});

test('the same romantic pair is romantic in either profile order',()=>{
 const self=person('self','self','2000-01-01');
 const partner=person('dating','dating','2000-05-01');
 const ab=compatibility(self,partner);
 const ba=compatibility(partner,self);
 assert.equal(ab.romantic,true);
 assert.equal(ba.romantic,true);
 assert.deepEqual(ab.dimensions,ba.dimensions);
 assert.deepEqual(ab.coverage,ba.coverage);
 assert.equal(ab.overall,ba.overall);
 assert.equal(ab.overallCovered,ba.overallCovered);
});

test('non-dating pairs never inherit romantic dimensions from a reorder',()=>{
 const self=person('self','self','2000-01-01');
 const friend=person('friend','friend','2000-05-01');
 for(const result of [compatibility(self,friend),compatibility(friend,self)]){
  assert.equal(result.romantic,false);
  assert.equal(result.dimensions.attraction,0);
  assert.equal(result.dimensions.sexual,0);
  assert.equal(result.coverage.attraction,false);
  assert.equal(result.coverage.sexual,false);
 }
});
