import test from 'node:test';
import assert from 'node:assert/strict';
import {rankedFactors,signals,type Evidence,type Signal} from '../src/math.ts';
import {reviewEvidence,reviewSignal} from '../src/decision.ts';
import {resolveDecisions} from '../src/decisionUltra.ts';
import {advice} from '../src/advice.ts';
import {transitOverview} from '../src/chartNarrative.ts';
import {derivedMetrics,goModes,reviewGoMode} from '../src/metrics.ts';
import {boundedComparison,optionalComparison,compareContacts,type Contact} from '../src/reading.ts';
import type {Report} from '../src/engine.ts';

const factor=(transit:string,natal:string,angle:number,weight=.8):Evidence=>({
 id:transit+'-'+angle+'-'+natal,transit:{id:transit,longitude:angle-.2,speed:1,symbol:'•'},
 natal:{id:natal,longitude:0,speed:0,symbol:'•'},angle,weight,orb:.2,maximumOrb:2,applying:true,exact:null
});
const indexInputs={overview:90,career:90,love:90,communication:90,energy:90,emotions:90,recovery:90,timing:90};

test('domain conclusions use all contacts when the short display packet points in the opposite direction',()=>{
 const support=['Venus','Jupiter','Sun'].map((id,i)=>factor(id,'Sun',120,.96-i*.02));
 const challenge=['Saturn','Mars','Uranus','Pluto','Neptune','Mercury','Moon'].map((id,i)=>factor(id,'Sun',90,.81-i*.01));
 const all=[...support,...challenge],reading=signals(all).find(s=>s.category==='career')!;
 assert.equal(reading.factors.length,4);
 assert.equal(reading.allFactors?.length,10);
 assert.equal(reading.tone,'caution');
 assert.ok(reading.score<50);
 assert.ok(reviewSignal(reading).dominance<0);
 assert.equal(reviewSignal(reading).topSupport?.transit.id,'Venus');
 assert.equal(reviewSignal(reading).topChallenge?.transit.id,'Saturn');
 assert.deepEqual(signals([...all].reverse()),signals(all));
});

test('repeated copies of one contact cannot increase scores or source counts',()=>{
 const a=factor('Venus','Sun',120),copy={...a,id:'second-label'};
 assert.equal(rankedFactors([a,copy,a]).length,1);
 const repeated=signals([a,copy,a])[0],single=signals([a])[0];
 assert.equal(repeated.score,single.score);assert.equal(repeated.tone,single.tone);assert.equal(repeated.tier,single.tier);
 const review=reviewEvidence([a,copy,a]);
 assert.equal(review.positive,a.weight);assert.equal(review.negative,0);assert.equal(review.sourceCount,1);
 assert.equal(review.topSupport?.transit.id,'Venus');
});

test('a nearly balanced aggregate does not inherit the leading factor’s direction',()=>{
 const support=factor('Venus','Sun',120,.9),opposite=factor('Saturn','Sun',90,.95);
 const negative=signals([support,opposite])[0];
 assert.equal(negative.tone,'neutral');assert.ok(negative.score<=50);
 const positive=signals([{...support,weight:.95},{...opposite,weight:.9}])[0];
 assert.equal(positive.tone,'neutral');assert.ok(positive.score>=50);
 const equal=signals([support,{...opposite,weight:.9}])[0];
 assert.equal(equal.tone,'neutral');assert.equal(equal.score,50);
});

test('conflicting copies fail closed regardless of their order',()=>{
 const a=factor('Venus','Sun',120),conflict={...a,weight:.1};
 assert.throws(()=>signals([a,conflict]),/Conflicting calculated aspect/);
 assert.throws(()=>signals([conflict,a]),/Conflicting calculated aspect/);
});

test('three contacts from one transiting body do not become three independent sources or an S-tier window',()=>{
 const reading=signals(['Sun','Jupiter','Saturn'].map(id=>factor('Venus',id,120,.99)))[0];
 assert.equal(reading.tier,'A');
 assert.notEqual(reading.tone,'exceptional');
 assert.equal(reviewSignal(reading).sourceCount,1);
 assert.equal(reviewSignal(reading).sensitive,true);
});

test('sensitivity removes a whole transiting-body group rather than only its strongest contact',()=>{
 const support=['Sun','Jupiter','Saturn'].map(id=>factor('Venus',id,120,.9));
 const opposite=[factor('Saturn','Sun',90,.8),factor('Mars','Sun',90,.7)];
 const review=reviewEvidence([...support,...opposite]);
 assert.ok(review.dominance>0);
 assert.ok(support.every(e=>review.dominance-e.weight>0));
 assert.equal(review.sensitive,true);
 assert.equal(review.sourceCount,3);
 const stable=reviewEvidence(['Venus','Jupiter','Sun'].map(id=>factor(id,'Sun',120,.9)));
 assert.equal(stable.sensitive,false);
});

test('zero-weight, unsupported-angle and nonfinite-orb records cannot manufacture a mixed conclusion',()=>{
 const support=factor('Venus','Sun',120);
 const ignored=[factor('Saturn','Sun',90,0),factor('Mars','Sun',45),{...factor('Uranus','Sun',90),orb:NaN}];
 assert.deepEqual(reviewEvidence([support,...ignored]),reviewEvidence([support]));
 assert.deepEqual(signals([support,...ignored]),signals([support]));
});

test('mixed advice considers complete evidence and keeps a counter-factor visible in its conclusion',()=>{
 const support=factor('Venus','Venus',120,.9),challenge=factor('Saturn','Venus',90,.8);
 const signal:Signal={category:'love',score:99,tier:'S',tone:'exceptional',factors:[support],allFactors:[support,challenge]};
 const text=advice(signal,'en');
 assert.match(text.title,/mixed contacts/);
 assert.match(text.good,/coexists with a challenging factor/);
 assert.match(text.action,/first step small/);
 assert.match(text.careful,/Removing one transiting body/);
});

test('missing or weak evidence yields an insufficient conclusion rather than a generic opportunity',()=>{
 const signal:Signal={category:'love',score:99,tier:'S',tone:'exceptional',factors:[]};
 for(const factors of [[],[factor('Venus','Venus',120,.1)]]){
  assert.match(advice({...signal,factors},'en').title,/Insufficient evidence/);
  const d=resolveDecisions(factors,[]).find(d=>d.category==='love')!;
  assert.equal(d.quality,'none');assert.equal(d.resolution,'insufficient');assert.equal(d.strongest,null);
 }
});

test('a default or bonus score cannot outrank the only area with actual calculated contacts',()=>{
 const evidence=[factor('Saturn','Sun',90)];
 const r={evidence,signals:signals(evidence),scores:{...indexInputs,career:25,love:99}} as unknown as Report;
 const text=transitOverview(r).en;
 assert.match(text,/emphasize work and decisions/);
 assert.doesNotMatch(text,/emphasize love/);
 assert.match(text,/Removing one transiting body/);
});

function goContext(omit?:string,challengeTiming=false){
 const targets=['Sun','Mercury','Moon','Uranus'].filter(id=>id!==omit);
 const evidence=targets.flatMap(target=>['Venus','Jupiter'].map(id=>factor(id,target,challengeTiming&&target==='Uranus'?90:120)));
 return resolveDecisions(evidence,signals(evidence));
}

test('Go Mode checks every actual category behind its derived drivers and collapses shared categories',()=>{
 const metrics=derivedMetrics(indexInputs),mode=goModes(metrics).find(x=>x.domain==='work')!;
 assert.equal(mode.state,'go');
 const full=reviewGoMode(mode,metrics,goContext());
 assert.equal(full.state,'go');assert.equal(full.complete,true);
 assert.deepEqual(full.sourceCategories,['career','communication','recovery','timing']);
 const missing=reviewGoMode(mode,metrics,goContext('Moon'));
 assert.equal(missing.state,'check');assert.equal(missing.complete,false);
 const opposing=reviewGoMode(mode,metrics,goContext(undefined,true));
 assert.equal(opposing.state,'check');assert.equal(opposing.mixed,true);
 assert.ok(opposing.supportFactor&&opposing.challengeFactor);
 const empty=reviewGoMode(mode,metrics,resolveDecisions([],[]));
 assert.equal(empty.state,'check');assert.equal(empty.strongest,null);
});

test('Go Mode refuses a high but source-sensitive reading and malformed metric values',()=>{
 const metrics=derivedMetrics(indexInputs),mode=goModes(metrics).find(x=>x.domain==='work')!;
 const evidence=['Sun','Mercury','Moon','Uranus'].map(id=>factor('Venus',id,120));
 const review=reviewGoMode(mode,metrics,resolveDecisions(evidence,signals(evidence)));
 assert.equal(review.sensitive,true);assert.equal(review.state,'check');
 assert.throws(()=>goModes(metrics.map(m=>m.id==='career'?{...m,value:NaN}:m)),/[Ii]nvalid/);
});

const contacts:Contact[]=Array.from({length:30},(_,i)=>({transit:['Sun','Moon','Venus','Jupiter','Saturn','Uranus'][Math.floor(i/5)],natal:['Sun','Moon','Mercury','Venus','Mars'][i%5],angle:120,orb:.2,applying:true}));

test('ranking churn in a leading packet cannot be mistaken for entering or leaving a calculated orb',()=>{
 const before=contacts.slice(0,12),after=contacts.slice(1,13);
 assert.equal(compareContacts(after,before).stable,false);
 const full=boundedComparison(contacts,[...contacts].reverse());
 assert.equal(full.stable,true);
 assert.deepEqual(full.totals,{entered:0,exited:0,changed:0});
 assert.equal(full.scope,'all-computed-contacts');
});

test('bounded comparisons retain full counts and stability when examples are truncated',()=>{
 const result=boundedComparison(contacts.map(e=>({...e,orb:.3})),contacts);
 assert.equal(result.changed.length,12);
 assert.equal(result.totals.changed,30);
 assert.equal(result.stable,false);assert.equal(result.truncated,true);
 assert.ok(JSON.stringify(result).length<3000);
});
test('missing historical ephemeris stays unavailable instead of becoming an invented stable comparison',()=>{
 const comparison=optionalComparison(contacts,()=>{throw Error('Previous instant outside ephemeris range')});
 assert.equal(comparison,null);
 assert.equal(optionalComparison(contacts,()=>contacts)?.stable,true);
});
