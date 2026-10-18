import test from 'node:test';import assert from 'node:assert/strict';
import {checkJournal,summarizeJournal,type JournalEntry} from '../src/journal.ts';
const base:JournalEntry={id:'1',personId:'p2',at:'2026-10-18T12:00:00.000Z',kind:'call',outcome:'positive',note:'Spoke by phone',symbolicIndex:65,indexDomain:'love'};
test('journal enforces data size, known classifications and consistent symbolic domain',()=>{
 assert.deepEqual(checkJournal(base),base);
 assert.throws(()=>checkJournal({...base,note:'x'.repeat(501)}));
 assert.throws(()=>checkJournal({...base,kind:'payment' as any}));
 assert.throws(()=>checkJournal({...base,indexDomain:null}));
});
test('calibration summarizes observed events without assigning probabilities',()=>{
 const items:JournalEntry[]=[base,{...base,id:'2',outcome:'difficult',symbolicIndex:30},{...base,id:'3',outcome:'neutral',symbolicIndex:null,indexDomain:null}];
 const r=summarizeJournal(items);
 assert.equal(r.total,3);assert.equal(r.positiveMeanIndex,65);assert.equal(r.difficultMeanIndex,30);
 assert.equal(r.observedIndexCount,2);
 assert.equal('probability' in r,false);
});
test('lack of observations yields null means, never invented predictions',()=>{
 const r=summarizeJournal([]);
 assert.equal(r.positiveMeanIndex,null);assert.equal(r.difficultMeanIndex,null);assert.equal(r.observedIndexCount,0);
});
