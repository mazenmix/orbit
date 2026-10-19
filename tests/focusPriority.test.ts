import test from 'node:test';
import assert from 'node:assert/strict';
import {priorityWeight,rankPrioritySignals,distinctPriority,conciseInterpretation} from '../src/focusPriority.ts';
import type {Evidence,Signal} from '../src/math.ts';
const sample=(id:string,opts:Partial<Evidence>={}):Evidence=>({
 id,transit:{id:'Venus',symbol:'♀',longitude:122,speed:1.2},
 natal:{id:'Sun',symbol:'☉',longitude:120,speed:0},
 angle:0,orb:.4,maximumOrb:2.0,applying:true,weight:.8,exact:null,
 ...opts,
});
const signal=(category:Signal['category'],factors:Evidence[]):Signal=>({category,score:70,tier:'A',tone:'supportive',factors});
const context=(signals:Signal[],knownBirthTime=true,complete=true)=>({
 signals,natal:{cusps:[0,30,60,90,120,150,180,210,240,270,300,330]},
 knownBirthTime,complete
});

test('priority prefers close validated aspects over an arbitrary large area score',()=>{
 const distant=sample('d',{orb:1.9,weight:.65,applying:false});
 const close=sample('c',{orb:.1,weight:.85,transit:{id:'Saturn',symbol:'♄',longitude:122,speed:.02}});
 const a=signal('career',[distant]),b=signal('love',[close]);a.score=95;b.score=46;
 const sorted=rankPrioritySignals(context([a,b]));
 assert.equal(sorted[0].signal.category,'love');
 assert.ok(sorted[0].salience>sorted[1].salience);
});
test('missing time never fabricates angular house relevance and explicitly limits the status',()=>{
 const aspect=sample('close');
 const known=rankPrioritySignals(context([signal('love',[aspect])],true))[0];
 const unknown=rankPrioritySignals(context([signal('love',[aspect])],false))[0];
 assert.equal(unknown.limitation,'unknown-time');
 assert.equal(unknown.status,'limited');
 assert.ok(known.salience>=unknown.salience);
});
test('missing supplementary ephemeris marks the output limited without inventing factors',()=>{
 const a=rankPrioritySignals(context([signal('career',[sample('x')])],true,false));
 assert.equal(a[0].status,'limited');
 assert.equal(a[0].limitation,'missing-ephemeris');
});
test('contradictory close support and challenge contacts are labeled mixed',()=>{
 const good=sample('good',{angle:120,natal:{id:'Mercury',symbol:'☿',longitude:120,speed:0}});
 const bad=sample('bad',{angle:90,natal:{id:'Mars',symbol:'♂',longitude:90,speed:0},transit:{id:'Saturn',symbol:'♄',longitude:180,speed:.05}});
 const ranked=rankPrioritySignals(context([signal('communication',[good,bad])]))[0];
 assert.equal(ranked.status,'mixed');
 assert.ok(ranked.supporting>0);
 assert.ok(ranked.challenging>0);
});
test('invalid or out-of-orb evidence is not promoted to a priority',()=>{
 const invalid=sample('invalid',{orb:5,maximumOrb:2});
 assert.equal(priorityWeight(invalid,[],false),0);
 assert.deepEqual(rankPrioritySignals(context([signal('career',[invalid])])),[]);
});
test('identical strongest contact and repeated advice are represented once',()=>{
 const same=sample('x');
 const ranked=rankPrioritySignals(context([signal('love',[same]),signal('career',[same])]));
 const result=distinctPriority(ranked,3,()=>({title:'One headline',action:'One actionable suggestion'}));
 assert.equal(result.length,1);
});
test('short AI summary stops at four distinct complete sentences without altering full response',()=>{
 const input='First reason. Second evidence. Second evidence. Third action. Final nuance. Extra explanation.';
 const result=conciseInterpretation(input);
 assert.equal(result.brief,'First reason. Second evidence. Third action. Final nuance.');
 assert.ok(result.condensed);
 assert.equal(result.full,input);
});

test('AI summary preserves angular orb decimal values and does not hallucinate omitted sentences',()=>{
 const input='Venus aspect orb is 0.36° near exactness. Opposing Saturn factor exists. One practical action. More context later. Extra detail.';
 const out=conciseInterpretation(input,4);
 assert.match(out.brief,/0\.36°/);
 assert.equal(out.brief,'Venus aspect orb is 0.36° near exactness. Opposing Saturn factor exists. One practical action. More context later.');
 assert.ok(!out.brief.includes('Extra detail.'));
});
