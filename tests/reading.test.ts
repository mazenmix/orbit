import test from 'node:test';
import assert from 'node:assert/strict';
import {compareContacts,distinctParagraphs} from '../src/reading.ts';
const moon={transit:'Moon',natal:'Sun',angle:90,orb:.4,applying:true};
test('hourly movement identifies approach, departure and motion reversal',()=>{
 const r=compareContacts([{...moon,orb:.1,applying:false}],[moon]);
 assert.deepEqual(r.changed,[{contact:'Moon:Sun:90',orbBefore:.4,orbNow:.1,applying:false}]);
 assert.equal(r.stable,false);
});
test('slow contacts are stable below display threshold rather than invented novelty',()=>{
 assert.equal(compareContacts([{...moon,orb:.409}],[moon]).stable,true);
 assert.equal(compareContacts([{...moon,orb:.43}],[moon]).stable,false);
});
test('entering and leaving leading packet contacts are distinct from motion',()=>{
 const r=compareContacts([{...moon,transit:'Venus'}],[moon]);
 assert.deepEqual(r.entered,['Venus:Sun:90']);assert.deepEqual(r.exited,['Moon:Sun:90']);
});
test('repeated paragraphs are removed without discarding distinct evidence',()=>{
 assert.equal(distinctParagraphs('Moon approaches.\n\nMoon approaches!\n\nSaturn separates.'),'Moon approaches.\n\nSaturn separates.');
});
