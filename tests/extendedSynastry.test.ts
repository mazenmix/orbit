import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import SwissEph from 'swisseph-wasm';
import {birthInstant,chart,compatibility,defaultProfile,setEngineForTests,targets,type Profile} from '../src/engine.ts';
import {synastry} from '../src/math.ts';

const swe=new SwissEph();await swe.initSwissEph();setEngineForTests(swe as never);
const self:Profile={...defaultProfile,id:'source',kind:'self'};
const date:Profile={...defaultProfile,id:'date',kind:'dating'};

test('all minor bodies and defined nodes can take part in computed supplementary synastry',()=>{
 const c=compatibility(self,date);
 assert.ok(c.supplementalEvidence.length>0);
 for(const id of ['Chiron','Ceres','Pallas','Juno','Vesta','Pholus','MeanNorthNode','TrueNorthNode','Descendant','IC']){
  assert.ok(c.supplementalEvidence.some(e=>e.first.id===id||e.second.id===id),id);
 }
 const reverse=compatibility(date,self);
 assert.equal(c.supplementalEvidence.length,reverse.supplementalEvidence.length);
 assert.equal(c.romantic,true);
 assert.equal(reverse.romantic,true);
});

test('original ten-body scoring evidence is untouched by additional synastry geometry',()=>{
 const c=compatibility(self,date);
 const a=chart(birthInstant(self),self),b=chart(birthInstant(date),date);
 const core=synastry(targets(a).filter(p=>p.id!=='MC'),targets(b).filter(p=>p.id!=='MC'));
 assert.deepEqual(c.evidence,core);
 assert.ok(c.supplementalEvidence.every(x=>!core.some(y=>y.first.id===x.first.id&&y.second.id===x.second.id&&y.angle===x.angle)));
});

test('unknown birth hour cannot yield invented minor or angle positions for that person',()=>{
 const missing:Profile={...date,known:false};
 const c=compatibility(self,missing);
 assert.ok(c.supplementalEvidence.every(e=>!['Moon','Ascendant','MC','Descendant','IC','Vertex','Chiron','Ceres','Pallas','Juno','Vesta','Pholus','MeanNorthNode','TrueNorthNode'].includes(e.second.id)));
 assert.deepEqual(c.b.cusps,[]);
});

test('People technical detail panel includes all secondary and primary exact contacts without changing scores',()=>{
 const ui=readFileSync('src/main.ts','utf8');
 const page=ui.slice(ui.indexOf('function peoplePage(){'),ui.indexOf('function aiPayload()'));
 assert.match(page,/c\.evidence\.map/);
 assert.match(page,/c\.supplementalEvidence\.map/);
 assert.match(page,/c\.additionalMissing\.first/);
});
