import test from 'node:test';
import assert from 'node:assert/strict';
import {skyContext} from '../src/skyContext.ts';
import {derivedMetrics,goModes,reviewContextGoMode,reviewGoMode} from '../src/metrics.ts';
import {aspects,signals} from '../src/math.ts';
import {resolveDecisions} from '../src/decisionUltra.ts';
import {targets,type Chart} from '../src/engine.ts';

const names=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const at=new Date('2026-10-25T12:00:00Z');
const chart=(values:Record<string,number>,fallback:number):Chart=>({date:at,
 points:names.map(id=>({id,symbol:id,longitude:values[id]??fallback,speed:1})),cusps:[],asc:0,mc:0,missing:[]});
const natal=chart({},0);

test('work and travel GO use their observed contextual recovery instead of unreachable tight recovery evidence',()=>{
 const current=chart({Venus:120,Jupiter:120},15);
 const narrow=aspects(current.points,targets(natal),at),narrowSignals=signals(narrow);
 assert.ok(!narrowSignals.some(signal=>signal.category==='recovery'));
 const context=skyContext(natal,current,true),metrics=derivedMetrics(context.scores);
 assert.equal(context.domains.recovery.contributors.length,2);
 for(const mode of goModes(metrics)){
  const reviewed=reviewContextGoMode(mode,metrics,context);
  assert.equal(mode.state,'go');assert.equal(reviewed.state,'go');
  assert.equal(reviewed.complete,true);assert.equal(reviewed.mixed,false);assert.equal(reviewed.sensitive,false);
  assert.equal(reviewed.coverage.present,reviewed.coverage.total);
  if(mode.domain==='work'||mode.domain==='travel'){
   assert.equal(reviewGoMode(mode,metrics,resolveDecisions(narrow,narrowSignals)).state,'check',
    'Mixing the unrelated tight-contact model was the original false CHECK');
  }
 }
});

test('a supportive contextual number cannot authorize GO from one fragile transit source',()=>{
 const context=skyContext(natal,chart({Venus:120},15),true),metrics=derivedMetrics(context.scores);
 for(const mode of goModes(metrics)){
  assert.equal(mode.state,'go');
  const reviewed=reviewContextGoMode(mode,metrics,context);
  assert.equal(reviewed.complete,true);assert.equal(reviewed.sensitive,true);assert.equal(reviewed.state,'check');
 }
});

test('contextual review keeps real mixed factors and identifies absent source coverage',()=>{
 const context=skyContext(natal,chart({Venus:120,Saturn:97.6},15),true),metrics=derivedMetrics(context.scores);
 const mode=goModes(metrics).find(value=>value.domain==='work')!;
 const mixed=reviewContextGoMode(mode,metrics,context);
 assert.equal(mode.state,'go');assert.equal(mixed.state,'check');
 assert.equal(mixed.mixed,true);assert.ok(mixed.supportFactor);assert.ok(mixed.challengeFactor);
 const distant=skyContext(natal,chart({},15),true),distantMetrics=derivedMetrics(distant.scores);
 const unobserved=reviewContextGoMode(goModes(distantMetrics)[0],distantMetrics,distant);
 assert.equal(unobserved.complete,false);assert.equal(unobserved.coverage.present,0);
 assert.equal(unobserved.state,'check');assert.equal(unobserved.strongest,null);
});

test('a missing contextual recovery source keeps an otherwise high work score from authorizing GO',()=>{
 const incompleteNatal=chart({Moon:15,Saturn:15},0);
 const context=skyContext(incompleteNatal,chart({Venus:120,Jupiter:120},50),true),metrics=derivedMetrics(context.scores);
 assert.equal(context.domains.recovery.contributors.length,0);
 const mode=goModes(metrics).find(value=>value.domain==='work')!;
 assert.equal(mode.state,'go');assert.equal(mode.value,80);
 const reviewed=reviewContextGoMode(mode,metrics,context);
 assert.equal(reviewed.state,'check');assert.equal(reviewed.complete,false);
 assert.deepEqual(reviewed.coverage,{present:3,total:4,missing:['recovery']});
});

test('GO review rejects mismatched numeric sources and tampered contextual contributions',()=>{
 const context=skyContext(natal,chart({Venus:120,Jupiter:120},15),true),metrics=derivedMetrics(context.scores);
 const mode=goModes(metrics)[0];
 assert.throws(()=>reviewContextGoMode({...mode,value:mode.value-1},metrics,context),/does not match/);
 const changed={...context,domains:{...context.domains,career:{...context.domains.career,contributors:context.domains.career.contributors.slice(0,1)}}};
 assert.throws(()=>reviewContextGoMode(mode,metrics,changed),/contributors/);
});
